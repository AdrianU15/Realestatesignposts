require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser")
const Stripe = require("stripe")
const { Pool } = require("pg")
const app = express()
const stripe = Stripe(process.env.STRIPE_SECRET || "sk_test_placeholder")
const db = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost/signposts" })
app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }))

async function initDB(){
    await db.query(` CREATE TABLE IF NOT EXISTS bookings( id SERIAL PRIMARY KEY, name TEXT, email TEXT, address TEXT, post_color TEXT, rental_weeks INTEGER, install_date DATE, price INTEGER, created_at TIMESTAMP DEFAULT NOW() ) `)
}

initDB()

function priceForWeeks(w){
    if(w==1) return 3500
    if(w==2) return 5500
    if(w==4) return 9000
    if(w==8) return 15000
    return 3500
}

app.get("/success.html", (req, res) => {
    res.sendFile(__dirname + '/public/success.html');
});

app.post("/checkout", async(req,res)=>{
    const {name,email,address,post_color,rental_weeks,install_date} = req.body
    const price = priceForWeeks(rental_weeks)
    const session = await stripe.checkout.sessions.create({
        payment_method_types:["card"],
        line_items:[{
            price_data:{
                currency:"cad",
                product_data:{name:"Sign Post Rental"},
                unit_amount:price
            },
            quantity:1
        }],
        mode:"payment",
        success_url:`${req.headers.origin}/success.html`,
        cancel_url:`${req.headers.origin}/book.html`,
        metadata:{ name,email,address,post_color,rental_weeks,install_date }
    })
    res.redirect(303, session.url)
})

app.listen(process.env.PORT || 3000, ()=>{
    console.log("Server running")
})