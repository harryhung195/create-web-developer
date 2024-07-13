import express from "express";
import dotenv from "dotenv";
import stripe from "stripe";
//load variables
dotenv.config();
//start server
const app = express();
app.use(express.static("public"));
app.use(express.json());

//Home route
app.get('/', (req, res) => {
    res.sendFile("index.html", {root: "public"});

});
//cart
app.get("/cart.html", (req, res) => {
    res.sendFile("cart.html", {root: "public"});

});
//success
app.get("/success.html", (req, res) => {
    res.sendFile("success.html", {root: "public"});

});
//cancel
app.get("/cancel.html", (req, res) => {
    res.sendFile("cancel.html", {root: "public"});

});

//stripe
let stripeGateway = stripe(process.env.stripe_key);

app.post("/stripe-checkout", async (req, res) => {
    const lineItems = req.body.items.map((item) => {
        const unitAmount = parseInt(parseFloat(item.price) * 100); // Remove "$" sign and convert to cents
        console.log("item-price:", item.price);
        console.log("unitAmount:", unitAmount);

        return {
            price_data: {
                currency: "aud",
                product_data: {
                    name: item.title,
                    images: [item.image], // Use correct property name
                },
                unit_amount: unitAmount,
            },
            quantity: item.quantity, // Parse quantity to integer
        };
    });

    try {
        const session = await stripeGateway.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            success_url: "https://create-web-developer.vercel.app/success.html",
            cancel_url: "https://create-web-developer.vercel.app/cancel.html",
            billing_address_collection: "required",
            line_items: lineItems,
        });
        res.json({ url: session.url });
    } catch (error) {
        console.error("Error creating Stripe session:", error);
        res.status(500).json({ error: "Error creating Stripe session" });
    }
});


app.listen(3000, () =>{
console.log("listing on port 3000");
});
