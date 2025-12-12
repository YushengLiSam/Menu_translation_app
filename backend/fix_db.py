from sqlalchemy import text
from app.db import engine

def migrate_db():
    print("Migrating database schema...")
    with engine.connect() as connection:
        # Commit the transaction explicitly
        with connection.begin():
            # Alter image_url column to TEXT to support base64 images
            connection.execute(text("ALTER TABLE products ALTER COLUMN image_url TYPE TEXT;"))
    print("Migration complete: products.image_url is now TEXT.")

if __name__ == "__main__":
    migrate_db()
