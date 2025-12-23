#!/usr/bin/env python3
"""
Script to check Supabase database schema
"""

from supabase import create_client, Client

def main():
    try:
        # Supabase configuration - using the same credentials as insert_mock_data.py
        SUPABASE_URL = "https://cdozcvfnamrqbaqsrhnp.supabase.co"
        SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkb3pjdmZuYW1ycWJhcXNyaG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNDIwNDEsImV4cCI6MjA1ODcxODA0MX0.CprHN0BfyN5PlQp9yfQoiZkyjnO18Rm7MAD3ObzafJ8"

        # Initialize Supabase client
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Connected to Supabase")

        # List all tables in the public schema
        print("\n📋 Listing all tables in the database:")
        try:
            # This is a workaround since Supabase Python client doesn't have a direct way to list tables
            # We'll try to query each table we're interested in
            tables = ['departments', 'courses', 'students', 'users']
            
            for table in tables:
                print(f"\n🔍 Checking table: {table}")
                try:
                    # Try to get one row from the table
                    result = supabase.table(table).select("*").limit(1).execute()
                    if hasattr(result, 'data'):
                        print(f"   ✅ Table exists")
                        if result.data:
                            print(f"   📊 Sample row: {result.data[0]}")
                        else:
                            print("   ℹ️ Table is empty")
                            
                        # Get table schema by describing the table
                        try:
                            # This is a workaround - we'll try to get the column names from an empty query
                            columns = supabase.table(table).select("*").limit(0).execute()
                            if hasattr(columns, 'data'):
                                print(f"   🏗️  Table schema:")
                                if columns.data and len(columns.data) > 0:
                                    for col in columns.data[0].keys():
                                        print(f"      - {col}")
                        except Exception as e:
                            print(f"   ❌ Could not get schema: {str(e)}")
                except Exception as e:
                    print(f"   ❌ Table does not exist or cannot be accessed: {str(e)}")

        except Exception as e:
            print(f"❌ Error accessing database: {e}")

    except Exception as e:
        print(f"❌ Error connecting to Supabase: {e}")

if __name__ == "__main__":
    main()
