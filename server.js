require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Pool } = require('pg');
const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());
const pool = new Pool({connectionString: process.env.DATABASE_URL});

async function initDB() {
    const client = await pool.connect();
    try {
        await client.query(`CREATE TABLE IF NOT EXISTS bookings (id SERIAL PRIMARY KEY, name VARCHAR(100), email VARCHAR(100), price DECIMAL(10, 2));`);
    } catch (error) {
        console.error('Error creating table:', error);
    } finally {
        client.release();
    }
}

function priceForWeeks(weeks) {
    const pricePerWeek = 100;
    return pricePerWeek * weeks;
}

app.get('/success.html', (req, res) => {
    res.sendFile(__dirname + '/public/success.html');
});

app.post('/checkout', async (req, res) => {
    const { email, weeks } = req.body;
    const amount = priceForWeeks(weeks);
    try {
        const paymentIntent = await stripe.paymentIntents.create({amount, currency: 'usd', receipt_email: email});
        res.send({ success: true, clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).send({ success: false, error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log('Server running on port 3000');
});

initDB();