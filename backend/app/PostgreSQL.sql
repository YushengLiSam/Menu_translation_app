CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    category_id INTEGER NOT NULL REFERENCES categories(id),
    price FLOAT NOT NULL,
    currency VARCHAR(10) DEFAULT 'CNY',
    image_url VARCHAR(500),
    specs JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE affiliate_links (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    platform VARCHAR(50) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    commission_pct FLOAT NOT NULL
);

