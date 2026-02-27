-- Views table
CREATE TABLE IF NOT EXISTS views (
	id SERIAL PRIMARY KEY,
	viewer_id INT NOT NULL REFERENCES users(id),
	viewed_id INT NOT NULL REFERENCES users(id),
	viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	view_count INT DEFAULT 1,
	UNIQUE (viewer_id, viewed_id)
);

-- function to update 'viewed_at'
CREATE OR REPLACE FUNCTION update_viewed_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.viewed_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- trigger to launch 'update_viewed_at_column'
CREATE OR REPLACE TRIGGER set_viewed_at
BEFORE UPDATE ON views
FOR EACH ROW
EXECUTE FUNCTION update_viewed_at_column();