import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
import joblib
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
import random
from datetime import datetime, timedelta
import traceback

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://localhost:3000"])

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_IDENTITY_CLAIM"] = "_id"
mongo_uri = os.getenv("MONGO_URI")

jwt = JWTManager(app)

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({"success": False, "message": "Token is invalid.", "error_details": str(error)}), 422

@jwt.unauthorized_loader
def unauthorized_callback(error):
    return jsonify({"success": False, "message": "Authorization required"}), 401

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"success": False, "message": "Token has expired"}), 401

# MongoDB Connection
try:
    client = MongoClient(mongo_uri)
    db = client['E-commerce']
    events_collection = db.events
    products_collection = db.products
except Exception as e:
    events_collection = None
    products_collection = None

# Load Model and Metadata
try:
    model = joblib.load('recommendation_model.joblib')
    metadata = joblib.load('model_metadata.joblib')
    popular_products = joblib.load('popular_products.joblib')
    all_product_ids = metadata['product_ids']
    all_user_ids = metadata['user_ids']
except FileNotFoundError as e:
    model = None
    metadata = None
    popular_products = []
    all_product_ids = []
    all_user_ids = []

def get_popular_products(exclude_ids=None, limit=10):
    """Get popular products as fallback"""
    if exclude_ids is None:
        exclude_ids = set()
    
    available_popular = [pid for pid in popular_products if pid not in exclude_ids]
    return available_popular[:limit]

def get_user_interaction_history(user_id):
    """Get products user has already interacted with"""
    try:
        user_events = events_collection.find({'userId': ObjectId(user_id)})
        seen_products = set()
        product_scores = {}
        
        for event in user_events:
            product_id = str(event['productId'])
            seen_products.add(product_id)
            
            # Calculate engagement score
            action = event['action']
            weight = {'purchase': 10, 'add_to_cart': 5, 'rating': 4, 'view': 1}.get(action, 1)
            product_scores[product_id] = product_scores.get(product_id, 0) + weight
        
        return seen_products, product_scores
    except Exception as e:
        return set(), {}

def get_similar_user_recommendations(user_id, seen_products, limit=5):
    """Find products liked by similar users (collaborative filtering)"""
    try:
        # Get user's favorite products (purchases and cart additions)
        user_events = list(events_collection.find({'userId': ObjectId(user_id)}))
        user_purchases = {str(e['productId']) for e in user_events if e['action'] in ['purchase', 'add_to_cart']}
        
        if not user_purchases:
            return []
        
        # Find other users who bought similar products
        similar_users = events_collection.aggregate([
            {'$match': {'productId': {'$in': [ObjectId(pid) for pid in user_purchases]}}},
            {'$group': {'_id': '$userId', 'count': {'$sum': 1}}},
            {'$match': {'_id': {'$ne': ObjectId(user_id)}}},
            {'$sort': {'count': -1}},
            {'$limit': 10}
        ])
        
        similar_user_ids = [str(u['_id']) for u in similar_users]
        
        if not similar_user_ids:
            return []
        
        # Get products these similar users liked
        similar_user_products = events_collection.aggregate([
            {'$match': {
                'userId': {'$in': [ObjectId(uid) for uid in similar_user_ids]},
                'action': {'$in': ['purchase', 'add_to_cart']}
            }},
            {'$group': {'_id': '$productId', 'score': {'$sum': 1}}},
            {'$sort': {'score': -1}},
            {'$limit': limit * 2}
        ])
        
        recommendations = []
        for product in similar_user_products:
            product_id = str(product['_id'])
            if product_id not in seen_products:
                recommendations.append(product_id)
                if len(recommendations) >= limit:
                    break
        
        return recommendations
        
    except Exception as e:
        return []

@app.route('/api/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    """Main recommendation endpoint - returns personalized product recommendations"""
    if model is None or events_collection is None:
        return jsonify({
            "success": False, 
            "message": "Recommendation service is not ready. Please train the model first."
        }), 500
    
    try:
        user_id = get_jwt_identity()
        
        # Get user's interaction history
        seen_products, product_scores = get_user_interaction_history(user_id)
        
        # Get all current products from database
        current_products = list(products_collection.find({}, {'_id': 1}))
        current_product_ids = [str(product['_id']) for product in current_products]
        
        recommendations = []
        strategy_used = "none"
        
        # Strategy 1: ML-based predictions for users in training data
        if str(user_id) in all_user_ids:
            strategy_used = "ml"
            
            # Get unseen products that model was trained on
            unseen_trained_products = [
                pid for pid in all_product_ids 
                if pid not in seen_products and pid in current_product_ids
            ]
            
            if unseen_trained_products:
                # Get predictions from the model
                predictions = []
                for pid in unseen_trained_products:
                    try:
                        pred = model.predict(str(user_id), pid)
                        predictions.append((pid, pred.est))
                    except Exception as pred_error:
                        continue
                
                # Sort by estimated rating (highest first)
                predictions.sort(key=lambda x: x[1], reverse=True)
                ml_recommendations = [pid for pid, score in predictions[:6]]
                recommendations.extend(ml_recommendations)
        else:
            strategy_used = "collaborative"
            
            # Strategy 2: Find similar users and recommend their favorites
            similar_user_recs = get_similar_user_recommendations(user_id, seen_products, limit=5)
            if similar_user_recs:
                recommendations.extend(similar_user_recs)
        
        # Strategy 3: Add new products (not in training data) - exploration
        new_products = [
            pid for pid in current_product_ids 
            if pid not in all_product_ids and pid not in seen_products
        ]
        
        if new_products and len(recommendations) < 10:
            random.shuffle(new_products)
            slots_available = min(3, 10 - len(recommendations))
            new_product_sample = new_products[:slots_available]
            recommendations.extend(new_product_sample)
        
        # Strategy 4: Fill with popular products if needed
        if len(recommendations) < 8:
            needed = 10 - len(recommendations)
            popular_recs = get_popular_products(
                exclude_ids=set(recommendations) | seen_products,
                limit=needed
            )
            recommendations.extend(popular_recs)
            if not strategy_used or strategy_used == "none":
                strategy_used = "popular"
        
        # Strategy 5: Last resort - show user's favorites (re-engagement)
        if not recommendations and product_scores:
            strategy_used = "favorites"
            favorite_products = sorted(
                product_scores.items(), 
                key=lambda x: x[1], 
                reverse=True
            )[:10]
            recommendations = [pid for pid, score in favorite_products]
        
        # Final fallback - completely random (shouldn't happen often)
        if not recommendations:
            strategy_used = "random"
            available_products = [
                pid for pid in current_product_ids 
                if pid not in seen_products
            ]
            random.shuffle(available_products)
            recommendations = available_products[:10]
        
        # Remove duplicates while preserving order
        seen = set()
        unique_recommendations = []
        for pid in recommendations:
            if pid not in seen:
                seen.add(pid)
                unique_recommendations.append(pid)
        
        return jsonify({
            "success": True, 
            "recommendations": unique_recommendations[:10],
            "metadata": {
                "user_seen_count": len(seen_products),
                "catalog_size": len(current_product_ids),
                "strategy_used": strategy_used,
                "recommendation_count": len(unique_recommendations)
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False, 
            "message": "An error occurred while generating recommendations"
        }), 500

@app.route('/api/retrain', methods=['POST'])
def retrain_model():
    """Retrain the recommendation model with current data"""
    try:
        import subprocess
        import sys
        
        # Run the training script
        result = subprocess.run(
            [sys.executable, 'train.py'], 
            capture_output=True, 
            text=True, 
            cwd='.',
            timeout=300  # 5 minute timeout
        )
        
        if result.returncode == 0:
            # Reload the model and metadata
            global model, metadata, popular_products, all_product_ids, all_user_ids
            
            model = joblib.load('recommendation_model.joblib')
            metadata = joblib.load('model_metadata.joblib')
            popular_products = joblib.load('popular_products.joblib')
            all_product_ids = metadata['product_ids']
            all_user_ids = metadata['user_ids']
            
            return jsonify({
                "success": True, 
                "message": "Model retrained successfully",
                "metadata": {
                    "total_products": len(all_product_ids),
                    "total_users": len(all_user_ids),
                    "trained_at": metadata['trained_at'],
                    "model_performance": {
                        "rmse": round(metadata['model_params']['rmse'], 4),
                        "mae": round(metadata['model_params']['mae'], 4)
                    }
                }
            })
        else:
            error_msg = result.stderr if result.stderr else "Unknown training error"
            return jsonify({
                "success": False, 
                "message": "Model training failed",
                "error": error_msg
            }), 500
            
    except subprocess.TimeoutExpired:
        return jsonify({
            "success": False, 
            "message": "Training timeout - please try again or check your data size"
        }), 500
    except Exception as e:
        return jsonify({
            "success": False, 
            "message": f"Retraining error: {str(e)}"
        }), 500

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get the current status of the recommendation service"""
    try:
        # Check database connection
        if events_collection is None or products_collection is None:
            return jsonify({
                "success": False,
                "message": "Database not connected"
            }), 500
        
        # Get current catalog info
        current_products = list(products_collection.find({}, {'_id': 1}))
        current_product_count = len(current_products)
        
        # Get training info
        trained_product_count = len(all_product_ids) if all_product_ids else 0
        trained_user_count = len(all_user_ids) if all_user_ids else 0
        
        # Get events count
        events_count = events_collection.count_documents({})
        
        # Check if retraining is recommended
        last_trained = metadata.get('trained_at') if metadata else None
        needs_retraining = False
        retraining_reason = []
        
        if metadata:
            # More than 10% new products
            if current_product_count > trained_product_count * 1.1:
                needs_retraining = True
                retraining_reason.append("New products added")
            
            # More than 50% new events
            if events_count > metadata.get('total_events', 0) * 1.5:
                needs_retraining = True
                retraining_reason.append("Significant new user interactions")
            
            # Model older than 7 days
            if last_trained:
                trained_date = datetime.fromisoformat(last_trained)
                days_old = (datetime.now() - trained_date).days
                if days_old > 7:
                    needs_retraining = True
                    retraining_reason.append(f"Model is {days_old} days old")
        else:
            needs_retraining = True
            retraining_reason.append("No model found")
        
        return jsonify({
            "success": True,
            "status": {
                "model_loaded": model is not None,
                "database_connected": True,
                "service_ready": model is not None and events_collection is not None,
                "catalog": {
                    "total_products": current_product_count,
                    "trained_products": trained_product_count,
                    "new_products": max(0, current_product_count - trained_product_count)
                },
                "users": {
                    "trained_users": trained_user_count
                },
                "interactions": {
                    "total_events": events_count,
                    "events_in_training": metadata.get('total_events', 0) if metadata else 0
                },
                "model_info": {
                    "last_trained": last_trained,
                    "performance": metadata['model_params'] if metadata else None
                },
                "maintenance": {
                    "needs_retraining": needs_retraining,
                    "reasons": retraining_reason if needs_retraining else []
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Status check failed: {str(e)}"
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        "success": True,
        "message": "Recommendation service is running",
        "model_loaded": model is not None,
        "database_connected": events_collection is not None
    })

@app.route('/', methods=['GET'])
def home():
    """Root endpoint with service info"""
    return jsonify({
        "service": "E-commerce Recommendation API",
        "version": "1.0.0",
        "endpoints": {
            "recommendations": "/api/recommendations (GET, requires JWT)",
            "retrain": "/api/retrain (POST)",
            "status": "/api/status (GET)",
            "health": "/api/health (GET)"
        },
        "status": "running"
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)