import midtransClient from "midtrans-client";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // pastikan server key ada
    if (!process.env.MIDTRANS_SERVER_KEY) {
      return res.status(500).json({ message: "MIDTRANS_SERVER_KEY not found" });
    }

    const { cart, customer } = req.body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ message: "Cart kosong atau tidak valid" });
    }

    // total harga
    const gross_amount = cart.reduce((sum, item) => sum + item.price, 0);

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
    });

    const orderId = "order-" + Date.now();

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount,
      },
      customer_details: {
        first_name: customer.firstName,
        last_name: customer.lastName,
        phone: customer.phone,
        address: customer.address,
      },
      item_details: cart.map((item) => ({
        id: item._id || item.name,
        price: item.price,
        quantity: 1,
        name: item.name,
      })),
    };

    const transaction = await snap.createTransaction(parameter);
    console.log("Midtrans transaction created:", transaction);
    return res.status(200).json(transaction);
  } catch (error) {
    console.error("Midtrans createTransaction error:", error);
    return res.status(500).json({
      message: error.message || "Failed to create transaction",
      details: error,
    });
  }
}
