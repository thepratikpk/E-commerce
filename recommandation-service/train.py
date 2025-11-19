import pandas as pd
from pymongo import MongoClient
from surprise import Dataset, Reader, SVD
from surprise.model_selection import cross_validate
import joblib
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import sys

def create_cold_start_model(db):
    """Create a minimal model when no user interaction data exists"""
    try:
        # Get all products from the database
        products = list(db.products.find({}, {'_id': 1}))
        product_ids = [str(p['_id']) for p in products]
        
        if not product_ids:
            # If no products exist, create dummy data
            product_ids = ['dummy_product_1', 'dummy_product_2', 'dummy_product_3']
        
        # Create minimal training data with dummy interactions
        dummy_data = []
        for i, pid in enumerate(product_ids[:10]):  # Limit to first 10 products
            dummy_data.append({
                'userId': f'cold_start_user_{i % 3}',
                'productId': pid,
                'rating': 3.0 + (i % 3) * 0.5  # Ratings between 3.0 and 4.0
            })
        
        df = pd.DataFrame(dummy_data)
        
        # Train minimal model
        reader = Reader(rating_scale=(1, 5))
        data = Dataset.load_from_df(df[['userId', 'productId', 'rating']], reader)
        trainset = data.build_full_trainset()
        
        algo = SVD(n_factors=10, n_epochs=10, lr_all=0.005, reg_all=0.02)
        algo.fit(trainset)
        
        # Save model and metadata
        joblib.dump(algo, 'recommendation_model.joblib')
        
        metadata = {
            'product_ids': product_ids,
            'user_ids': [f'cold_start_user_{i}' for i in range(3)],
            'total_events': 0,
            'unique_pairs': len(dummy_data),
            'trained_at': datetime.now().isoformat(),
            'model_params': {
                'n_factors': 10,
                'n_epochs': 10,
                'rmse': 0.0,
                'mae': 0.0
            },
            'cold_start': True
        }
        
        joblib.dump(metadata, 'model_metadata.joblib')
        
        # Use all products as popular products for cold start
        popular_products = product_ids[:20]  # First 20 products
        joblib.dump(popular_products, 'popular_products.joblib')
        
        return True
        
    except Exception as e:
        raise RuntimeError(f"Failed to create cold start model: {e}")

def main():
    load_dotenv()

    mongo_connection_string = os.getenv('MONGO_URI')
    if not mongo_connection_string:
        raise ValueError("MONGO_URI not found. Please set it in the .env file.")

    try:
        client = MongoClient(mongo_connection_string)
        db = client['E-commerce']
        
        # Test connection
        client.admin.command('ping')
        
    except Exception as e:
        raise ConnectionError(f"Failed to connect to MongoDB: {e}")

    # Fetch all events
    try:
        events_data = list(db.events.find({}, {
            '_id': 0, 
            'userId': 1, 
            'productId': 1, 
            'action': 1,
            'value': 1,
            'createdAt': 1
        }))
    except Exception as e:
        raise RuntimeError(f"Failed to fetch events from database: {e}")

    # Handle empty database case
    if not events_data:
        create_cold_start_model(db)
        return

    df = pd.DataFrame(events_data)

    # Convert ObjectIds to strings for consistency
    df['userId'] = df['userId'].astype(str)
    df['productId'] = df['productId'].astype(str)

    # Remove any null values
    df = df.dropna(subset=['userId', 'productId'])
    
    if len(df) == 0:
        create_cold_start_model(db)
        return

    # Improved action weights
    action_weights = {
        'view': 1.0,
        'add_to_cart': 3.5,
        'purchase': 5.0,
        'rating': 4.0
    }

    # Calculate base rating from action
    df['rating'] = df['action'].apply(lambda x: action_weights.get(x, 1.0))

    # For rating actions, use actual rating value if available
    if 'value' in df.columns:
        rating_mask = df['action'] == 'rating'
        df.loc[rating_mask, 'rating'] = df.loc[rating_mask, 'value'].fillna(3.0)

    # Add recency boost (more recent interactions are more relevant)
    if 'createdAt' in df.columns:
        try:
            df['createdAt'] = pd.to_datetime(df['createdAt'])
            days_ago = (datetime.now() - df['createdAt']).dt.days
            recency_boost = 1 + (30 - days_ago.clip(0, 30)) / 30 * 0.3
            df['rating'] = df['rating'] * recency_boost
        except Exception:
            pass  # Skip recency boost if there's an error

    # Handle duplicate user-product interactions by aggregating
    df_aggregated = df.groupby(['userId', 'productId']).agg({
        'rating': 'mean'
    }).reset_index()

    # Drop any rows with missing values
    df_aggregated.dropna(subset=['userId', 'productId', 'rating'], inplace=True)
    
    if len(df_aggregated) == 0:
        create_cold_start_model(db)
        return

    # Ensure minimum interactions per user (quality control)
    user_counts = df_aggregated['userId'].value_counts()
    
    # Adjust minimum interactions based on data size
    min_interactions = 2 if len(df_aggregated) >= 10 else 1
    valid_users = user_counts[user_counts >= min_interactions].index
    df_filtered = df_aggregated[df_aggregated['userId'].isin(valid_users)]

    # If still no valid data, use all available data
    if len(df_filtered) == 0:
        df_filtered = df_aggregated

    # Final check - need at least 2 interactions for Surprise
    if len(df_filtered) < 2:
        create_cold_start_model(db)
        return

    # Prepare data for Surprise
    reader = Reader(rating_scale=(1, 5))
    data = Dataset.load_from_df(df_filtered[['userId', 'productId', 'rating']], reader)
    trainset = data.build_full_trainset()

    # Adjust hyperparameters based on data size
    n_users = len(df_filtered['userId'].unique())
    n_items = len(df_filtered['productId'].unique())
    data_size = len(df_filtered)

    # Use smaller factors for small datasets
    n_factors = min(50, max(10, min(n_users, n_items) // 2))

    algo = SVD(
        n_factors=n_factors,
        n_epochs=20,
        lr_all=0.005,
        reg_all=0.02
    )

    # Cross-validate only if we have enough data
    rmse, mae = 0.0, 0.0
    if data_size >= 6:  # Need at least 6 samples for 3-fold CV
        try:
            cv_folds = min(3, data_size // 2)
            cv_results = cross_validate(algo, data, measures=['RMSE', 'MAE'], cv=cv_folds, verbose=False)
            rmse = cv_results['test_rmse'].mean()
            mae = cv_results['test_mae'].mean()
        except Exception:
            pass  # Skip CV if it fails

    # Train on full dataset
    algo.fit(trainset)

    # Save the model
    joblib.dump(algo, 'recommendation_model.joblib')

    # Save metadata for the API
    all_product_ids = df_filtered['productId'].unique().tolist()
    all_user_ids = df_filtered['userId'].unique().tolist()

    metadata = {
        'product_ids': all_product_ids,
        'user_ids': all_user_ids,
        'total_events': len(df),
        'unique_pairs': len(df_filtered),
        'trained_at': datetime.now().isoformat(),
        'model_params': {
            'n_factors': n_factors,
            'n_epochs': 20,
            'rmse': float(rmse),
            'mae': float(mae)
        },
        'cold_start': False
    }

    joblib.dump(metadata, 'model_metadata.joblib')

    # Calculate popular products as fallback
    product_interaction_counts = df['productId'].value_counts()
    popular_products = product_interaction_counts.head(20).index.tolist()
    joblib.dump(popular_products, 'popular_products.joblib')

if __name__ == '__main__':
    try:
        main()
        sys.exit(0)  # Success
    except Exception as e:
        # Write error to stderr for the calling process
        sys.stderr.write(f"Training failed: {str(e)}\n")
        sys.exit(1)  # Failure