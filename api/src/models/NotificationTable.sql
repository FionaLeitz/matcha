--- Notification table
CREATE TABLE IF NOT EXISTS notification (
	id SERIAL PRIMARY KEY,
    type VARCHAR(10) NOT NULL CHECK (type IN ('like', 'view', 'match', 'unmatch', 'message')),
	receiver_id INT NOT NULL REFERENCES users(id),
	sender_id INT NOT NULL REFERENCES users(id),
	seen BOOLEAN DEFAULT FALSE,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);