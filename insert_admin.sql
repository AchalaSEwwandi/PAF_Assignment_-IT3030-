USE smart_campus;

INSERT INTO users (username, email, full_name, password_hash, role, status, is_active, created_at)
VALUES (
    'admin',
    'admin@campus.edu',
    'Admin User',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhy2',
    'ADMIN',
    1,
    1,
    NOW()
);
