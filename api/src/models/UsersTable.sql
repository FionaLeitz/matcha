-- User table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,                  -- ID that increment itself for every new user
    username VARCHAR(255) NOT NULL UNIQUE,  -- username, string max size 255, can't be NULL and must be unique
    first_name VARCHAR(255) NOT NULL, 
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    pending_email VARCHAR(255) DEFAULT '',
    password VARCHAR(255) NOT NULL,
    birthday DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
    gender_preference VARCHAR(10) NOT NULL CHECK (gender_preference IN ('male', 'female', 'both')) DEFAULT 'both',
    bio TEXT DEFAULT '',
    image VARCHAR(255) DEFAULT '',
    images VARCHAR(255)[] DEFAULT '{}',
    likes INT[] DEFAULT '{}',               -- likes that the user gave
    dislikes INT[] DEFAULT '{}',            -- swipe left
    blocked INT[] DEFAULT '{}',             -- id that the user blocked
    reported_by INT[] DEFAULT '{}',         -- report that the user RECEIVED
    tags VARCHAR(255)[] DEFAULT '{}',
    match_nbr INT DEFAULT 0,
    latitude FLOAT DEFAULT NULL,
    longitude FLOAT DEFAULT NULL,
    allowed_loc BOOLEAN DEFAULT FALSE,
    city VARCHAR(255) DEFAULT '',
    loc JSONB DEFAULT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    email_change_token VARCHAR(255) DEFAULT NULL,
    email_change_expires TIMESTAMPTZ DEFAULT NULL,
    reset_password_token VARCHAR(255) DEFAULT NULL,
    reset_password_expires TIMESTAMPTZ DEFAULT NULL,
    last_connection TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- function to update 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- trigger to lanch 'update_updated_at_column'
CREATE OR REPLACE TRIGGER set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_users_location ON users (latitude, longitude);
