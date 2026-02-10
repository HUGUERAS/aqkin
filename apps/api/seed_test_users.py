"""Seed test users into Supabase for development/testing.

Creates two users:
  - teste@ativoreal.com / teste123 (proprietario)
  - topografo@ativoreal.com / teste123 (topografo)

Also creates the 'perfis' table if it doesn't exist yet.
"""

import os
import httpx
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")

if not url or not key:
    print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")
    exit(1)

supabase = create_client(url, key)

# --- Step 0: Ensure perfis table exists via SQL ---
CREATE_PERFIS_SQL = """
CREATE TABLE IF NOT EXISTS public.perfis (
  id SERIAL PRIMARY KEY,
  user_id UUID UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'proprietario'
       CHECK (role IN ('topografo', 'proprietario')),
  nome_completo VARCHAR(150),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_perfis_user ON public.perfis(user_id);
"""

print("--- Step 0: Ensuring perfis table exists ---")
try:
    # Use Supabase SQL API (pg-meta) with service role key
    resp = httpx.post(
        f"{url}/rest/v1/rpc/exec_sql",
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        },
        json={"query": CREATE_PERFIS_SQL},
        timeout=15,
    )
    if resp.status_code < 300:
        print("OK: perfis table ensured via exec_sql RPC")
    else:
        raise Exception(f"exec_sql failed: {resp.status_code}")
except Exception:
    # Fallback: try direct PostgREST health check to see if table exists
    try:
        supabase.table("perfis").select("id").limit(1).execute()
        print("OK: perfis table already exists")
    except Exception:
        print("WARN: perfis table does not exist.")
        print("      Please run the following SQL in Supabase SQL Editor")
        print("      (https://supabase.com/dashboard/project/xntxtdximacsdnldouxa/sql):\n")
        print(CREATE_PERFIS_SQL)
        print("      Then re-run this script.\n")

# --- Step 1: Create test users ---
TEST_USERS = [
    {"email": "teste@ativoreal.com", "password": "teste123", "role": "proprietario"},
    {"email": "topografo@ativoreal.com", "password": "teste123", "role": "topografo"},
]

print("\n--- Step 1: Creating test users ---")
for user in TEST_USERS:
    try:
        # Create auth user with email pre-confirmed (no verification email)
        result = supabase.auth.admin.create_user(
            {
                "email": user["email"],
                "password": user["password"],
                "email_confirm": True,
            }
        )
        uid = result.user.id
        print(f"AUTH OK: {user['email']} (uid={uid})")
    except Exception as e:
        msg = str(e)
        if "already been registered" in msg or "already exists" in msg:
            print(f"AUTH SKIP: {user['email']} already exists")
            # Try to get existing user ID
            try:
                users = supabase.auth.admin.list_users()
                for u in users:
                    if u.email == user["email"]:
                        uid = u.id
                        break
                else:
                    print(f"  Could not find existing uid for {user['email']}")
                    continue
            except Exception:
                print(f"  Could not list users to find uid")
                continue
        else:
            print(f"AUTH ERROR: {user['email']} -> {msg}")
            continue

    # Set role in perfis table
    try:
        supabase.table("perfis").upsert(
            {"user_id": str(uid), "role": user["role"]}
        ).execute()
        print(f"ROLE OK: {user['email']} -> {user['role']}")
    except Exception as e:
        print(f"ROLE ERROR: {user['email']} -> {e}")

print("\n--- Done! ---")
print("Login credentials:")
print("  Proprietario: teste@ativoreal.com / teste123")
print("  Topografo:    topografo@ativoreal.com / teste123")
