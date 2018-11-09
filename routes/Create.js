const mongoose = require('mongoose');
const express = require('express');

const api = express.Router();

api.get('/create', (req, res) => {
    res.send('Hello from router');
});

module.exports = api;