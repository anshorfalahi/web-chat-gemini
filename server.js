require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

// Menggunakan middleware CORS
app.use(cors());

// Middleware untuk menyajikan file statis
app.use(express.static(path.join(__dirname, 'public')));

// Route untuk meneruskan permintaan ke API
app.get('/api/bard', async (req, res) => {
    const { q } = req.query;
    const apikey = process.env.API_KEY;
    try {
        const response = await axios.get(`https://api.neoxr.my.id/api/bard?q=${q}&apikey=${apikey}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ status: false, msg: error.message });
    }
});

// Route default untuk menyajikan index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server proxy berjalan di http://localhost:${port}`);
});
