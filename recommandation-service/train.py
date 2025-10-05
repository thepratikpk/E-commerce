import pandas as pd
from pymongo import MongoClient
from surprise import Dataset, Reader, SVD
from surprise.model_selection import cross_validate
import joblib
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

mongo_connection_string = os.getenv('MONGO_URI')
if not mongo_connection_string:
    raise ValueError("MONGO_URI not found. Please set it in the .env file.")

client = MongoClient(mongo_connection_string)
db = client['E-commerce']

print("=" * 50)
print("TRAINING RECOMMENDATION MODEL")
print("=" * 50)

# Fetch all events
events_data = list(db.events.find({}, {
    '_id': 0, 
    'userId': 1, 
    'productId': 1, 
    'action': 1,
    'value': 1,
    'createdAt': 1
}))

if not events_data:
    print("❌ No event data found. Exiting.")
    exit()

df = pd.DataFrame(events_data)
print(f"✅ Loaded {len(df)} events from MongoDB.")

# Convert ObjectIds to strings for consistency
df['userId'] = df['userId'].astype(str)
df['productId'] = df['productId'].astype(str)

# Improved action weights with recency boost
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
else:
    print("ℹ️  No 'value' column found - using default action weights")

# Add recency boost (more recent interactions are more relevant)
if 'createdAt' in df.columns:
    try:
        df['createdAt'] = pd.to_datetime(df['createdAt'])
        days_ago = (datetime.now() - df['createdAt']).dt.days
        recency_boost = 1 + (30 - days_ago.clip(0, 30)) / 30 * 0.3  # Up to 30% boost for recent interactions
        df['rating'] = df['rating'] * recency_boost
        print("✅ Applied recency boost to ratings")
    except Exception as e:
        print(f"⚠️  Could not apply recency boost: {e}")
else:
    print("ℹ️  No 'createdAt' column - skipping recency boost")

# Handle duplicate user-product interactions by aggregating
# This prevents the model from being biased by repeat views
df_aggregated = df.groupby(['userId', 'productId']).agg({
    'rating': 'mean'  # Average rating for multiple interactions
}).reset_index()

print(f"📊 Aggregated to {len(df_aggregated)} unique user-product pairs")

# Drop any rows with missing values
df_aggregated.dropna(subset=['userId', 'productId', 'rating'], inplace=True)

# Ensure minimum interactions per user (quality control)
user_counts = df_aggregated['userId'].value_counts()
valid_users = user_counts[user_counts >= 2].index  # At least 2 interactions
df_filtered = df_aggregated[df_aggregated['userId'].isin(valid_users)]

print(f"👥 {len(df_filtered['userId'].unique())} users with sufficient interaction history")
print(f"📦 {len(df_filtered['productId'].unique())} unique products in training data")

# Prepare data for Surprise
reader = Reader(rating_scale=(1, 5))
data = Dataset.load_from_df(df_filtered[['userId', 'productId', 'rating']], reader)

# Train the model with optimized hyperparameters
print("\n🤖 Training SVD model with cross-validation...")
trainset = data.build_full_trainset()

# Use better hyperparameters for SVD
algo = SVD(
    n_factors=100,      # Number of latent factors
    n_epochs=20,        # Number of training iterations
    lr_all=0.005,       # Learning rate
    reg_all=0.02        # Regularization term
)

# Cross-validate to check model performance
cv_results = cross_validate(algo, data, measures=['RMSE', 'MAE'], cv=3, verbose=False)
print(f"   RMSE: {cv_results['test_rmse'].mean():.4f}")
print(f"   MAE: {cv_results['test_mae'].mean():.4f}")

# Train on full dataset
algo.fit(trainset)
print("✅ Model training complete!")

# Save the model
joblib.dump(algo, 'recommendation_model.joblib')
print("💾 Model saved to recommendation_model.joblib")

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
        'n_factors': 100,
        'n_epochs': 20,
        'rmse': float(cv_results['test_rmse'].mean()),
        'mae': float(cv_results['test_mae'].mean())
    }
}

joblib.dump(metadata, 'model_metadata.joblib')
print(f"📋 Saved metadata: {len(all_product_ids)} products, {len(all_user_ids)} users")

# Calculate popular products as fallback
product_interaction_counts = df['productId'].value_counts()
popular_products = product_interaction_counts.head(20).index.tolist()
joblib.dump(popular_products, 'popular_products.joblib')
print(f"⭐ Saved {len(popular_products)} popular products for cold start")

print("\n" + "=" * 50)
print("TRAINING COMPLETE!")
print("=" * 50)