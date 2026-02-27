const express = require('express');
const amqp = require('amqplib');
const authcheck = require('./auth');
const app = express();

const PORT = process.env.PORT || 3001;
app.use(express.json());


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