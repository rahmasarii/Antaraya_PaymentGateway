// pages/api/create-transaction.js
import midtransClient from "midtrans-client";
import dbConnect from "../../lib/db";
import Checkout from "../../models/Checkout"; // ✅ tambahkan ini
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { cart, customer } = req.body;

    if (!cart?.length) {
      return res.status(400).json({ message: "Cart kosong atau tidak valid" });
    }

    const gross_amount = cart.reduce((sum, item) => sum + (item.price || 0), 0);
    const orderId = "order-" + Date.now();

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount,
      },
      item_details: cart.map((item) => ({
        id: item._id || item.name,
        price: item.price || 0,
        quantity: 1,
        name: item.name,
      })),
      customer_details: {
        first_name: customer.firstName,
        last_name: customer.lastName,
        phone: customer.phone,
        shipping_address: {
          address: customer.address,
        },
      },
    };

    const transaction = await snap.createTransaction(parameter);
    console.log("✅ Midtrans transaction created:", transaction);

    await Checkout.create({
  orderId,
  items: cart,
  total: gross_amount,
  customer,
  status: 'PENDING',
});


    return res.status(200).json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    console.error("❌ Midtrans createTransaction error:", error);
    return res.status(500).json({
      message: error.message || "Failed to create transaction",
    });
  }
}
