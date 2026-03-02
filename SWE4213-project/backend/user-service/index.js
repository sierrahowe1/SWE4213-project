const express = require('express');
const amqp = require('amqplib');
const authcheck = require('./auth');
const app = express();
const { Pool } = require('pg');

const PORT = process.env.PORT || 3001;
app.use(express.json());

const pool = new Pool({
    host: process.env.DB_HOST || 'users-db',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'usersdb',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });


app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    res.json({ message: 'Filler login success message'});
});

app.post('/auth/register', (req, res) => {
    const { username, password } = req.body;
    res.json({ message: 'Filler register success message'});

});

app.get('auth/status', (req, res) => {
    res.json({ message: 'Filler auth status message' });
});

app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    res.json({ id: userId, username: 'fillerUser'});
});

app.get('/userBooks/:userId', (req, res) => {
    res.json({ userId: req.params.userId, books: ['Book1', 'Book2']});
});

app.put('/userBooks/:userId', (req, res) => {
    const userId = req.params.userId;
    const { books } = req.body;
    res.json({ message: `Updated books for user ${userId}`, books });
});

app.listen(PORT, () => {
    console.log(`User service running on port ${PORT}`);
});