CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    hashed_pass VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS progress (
    progress_id SERIAL PRIMARY KEY,
    pages_read INTEGER NOT NULL DEFAULT 0,
    total_pages INTEGER NOT NULL,
    books_read_this_year INTERGER NOT NULL,
    status VARCHAR (20) DEFAULT 'Not Started',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    user_id INTEGER KEY REFERENCES users(user_id),
    book_id INTEGER REFERENCES books(book_id),
    UNIQUE (user_id, book_id)
);

CREATE TABLE IF NOT EXISTS user_books (
    user_book_id SERIAL PRIMARY KEY,
    have_read BOOLEAN NOT NULL DEFAULT FALSE,
    want_to_read BOOLEAN NOT NULL DEFAULT FALSE,
    user_id INTEGER REFERENCES users(user_id),
    book_id INTEGER REFERENCES books(book_id),
    UNIQUE (user_id, book_id)
);

INSERT INTO users (first_name, last_name, email, hashed_pass) VALUES
('John', 'Doe', 'johnDoe@sample.com', 'example_hash_1'),
('Jane', 'Smith', 'janeSmith@unb.ca', 'example_hash_2'),
('Ryan', 'Johnson', 'ryanJ@outlook.com', 'example_hash_3');

INSERT INTO progress (pages_read, total_pages, books_read_this_year, status, started_at, completed_at, user_id, book_id) VALUES
(100, 300, 1, 'In Progress', '2024-01-01', NULL, 1, 1),
(0, 200, 0, 'Not Started', NULL, NULL, 2, 2);

INSERT INTO user_books (have_read, want_to_read, user_id, book_id) VALUES
(FALSE, TRUE, 1, 2),
(TRUE, FALSE, 2, 1),
(FALSE, TRUE, 3, 1);