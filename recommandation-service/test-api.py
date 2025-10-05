# test_app.py
import pytest
from app import app # Import the Flask app object from your app.py

@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    with app.test_client() as client:
        yield client

def test_recommendations_endpoint_success(client):
    """
    Test if the recommendations endpoint returns a successful response
    and the correct data structure.
    """
    # NOTE: Replace 'some_real_user_id' with an actual userId string
    # that exists in the data you used for training.
    user_id = 'some_real_user_id' 
    
    response = client.get(f'/recommendations/{user_id}')
    
    # 1. Check for a successful status code (200 OK)
    assert response.status_code == 200
    
    # 2. Check that the response is JSON
    assert response.is_json
    
    # 3. Check for the expected keys in the JSON response
    data = response.get_json()
    assert 'userId' in data
    assert 'productIds' in data
    
    # 4. Check that productIds is a list
    assert isinstance(data['productIds'], list)
    print(f"Successfully received {len(data['productIds'])} recommendations for user {data['userId']}")

def test_recommendations_for_unknown_user(client):
    """
    Test how the endpoint behaves with a user ID that was not in the training data.
    It should still work without errors and return an empty or less accurate list.
    """
    user_id = 'a_completely_new_user_id_xyz'
    response = client.get(f'/recommendations/{user_id}')
    
    assert response.status_code == 200
    assert response.is_json
    
    data = response.get_json()
    assert 'productIds' in data
    print(f"Received recommendations for an unknown user as expected.")