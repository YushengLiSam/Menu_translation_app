from sqlalchemy import text, inspect
from app.db import engine

def inspect_db():
    print("Inspecting products table schema...")
    inspector = inspect(engine)
    columns = inspector.get_columns('products')
    for column in columns:
        if column['name'] == 'image_url':
            print(f"Column: {column['name']}, Type: {column['type']}")

if __name__ == "__main__":
    inspect_db()
