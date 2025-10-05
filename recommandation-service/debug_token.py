import os
import jwt # PyJWT library
from dotenv import load_dotenv

# Load the .env file from the current directory
load_dotenv()

# --- PASTE THE TOKEN YOU COPIED FROM YOUR BROWSER HERE ---
token_from_browser = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGQ0ODVkNGYxNWVkNDRkNWUxYWJmNWIiLCJlbWFpbCI6ImJyYWRoaWthMjM3QGdtYWlsLmNvbSIsIm5hbWUiOiJSYWRoaWthIFNhbnRvc2ggQmhvc2FsZSIsImlhdCI6MTc1OTQzMDAwNiwiZXhwIjoxNzU5NTE2NDA2fQ.24dEnz02orCpahS_TNx7CWB2-FS0BNdTZiahJluta8M" # Replace this with your actual token

# --- Get the secret key from your .env file ---
secret_key = os.getenv("JWT_SECRET_KEY")

print(f"--- Attempting to decode token with secret: '{secret_key}' ---")

try:
    # Attempt to decode the token using the secret key and the default HS256 algorithm
    decoded_payload = jwt.decode(token_from_browser, secret_key, algorithms=["HS256"])
    
    print("\n✅ SUCCESS: Token decoded successfully!")
    print("\nDecoded Payload:")
    print(decoded_payload)

except jwt.InvalidSignatureError:
    print("\n❌ FAILED: Signature verification failed.")
    print("This is PROOF that the JWT_SECRET_KEY in your Python .env file does NOT match the secret used to create the token in Node.js.")

except Exception as e:
    print(f"\n❌ FAILED: An unexpected error occurred: {e}")