const express = require('express');
const app = express();

const PORT = process.env.PORT || 5000;
app.use(express.json());


app.get('/users', (req, res) => {
    
})