from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase client with service role key
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase configuration in environment variables")

# Create Supabase client
supabase: Client = create_client(supabase_url, supabase_key)

def get_supabase() -> Client:
    """Get the Supabase client instance."""
    return supabase
