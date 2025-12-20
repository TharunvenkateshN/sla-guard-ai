import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Safety check
if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase credentials not found in .env")

# Create Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
