// pages/api/create-transaction.js
import midtransClient from "midtrans-client";
import dbConnect from "../../lib/db";
import Checkout from "../../models/Checkout";
import sendEmail from "../../lib/sendemail";
import sendWhatsapp from "../../lib/sendwhatsapp";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  try {
    const { cart, customer } = req.body;

    if (!cart?.length) {
      return res.status(400).json({ message: "Cart Order sebelumnya sudah ada, silakan cek WA untuk link pembayaran" });
    }

    // ==============================================
    // 🔐 1) Buat fingerprint unik berdasarkan cart
    // ==============================================
    const cartFingerprint = crypto
      .createHash("sha256")
      .update(JSON.stringify(cart) + customer.phone)
      .digest("hex");

    // ==============================================
    // 🔎 2) Cari pending order yang match fingerprint
    // ==============================================
    const existingOrder = await Checkout.findOne({
      status: "PENDING",
      fingerprint: cartFingerprint,
    });

    if (existingOrder) {
      console.log("🔁 Reusing existing order:", existingOrder.orderId);

      // RETURN ORDER LAMA
      return res.status(200).json({
        token: existingOrder.snapToken,
        redirect_url: existingOrder.redirect_url,
        reused: true,
        orderId: existingOrder.orderId,
      });
    }

    // ==============================================
    // 🆕 3) Buat order baru
    // ==============================================

    const gross_amount = cart.reduce((sum, item) => sum + (item.price || 0), 0);
    const orderId = "order-" + Date.now();

    const snap = new midtransClient.Snap({
      isProduction: "false",
// isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    const parameter = {
      transaction_details: { order_id: orderId, gross_amount },
      item_details: cart.map((item) => ({
        id: item._id || item.name,
        price: item.price || 0,
        quantity: item.qty || 1,
        name: item.name,
      })),
      customer_details: {
        first_name: customer.firstName,
        last_name: customer.lastName,
        phone: customer.phone,
        shipping_address: { address: customer.address },
      },
    };

    const transaction = await snap.createTransaction(parameter);

    console.log("🆕 New Midtrans transaction:", transaction);

    // ==============================================
    // 💾 SAVE ORDER (dengan fingerprint & snapToken)
    // ==============================================
    const newOrder = await Checkout.create({
      orderId,
      items: cart,
      total: gross_amount,
      customer,
      status: "PENDING",
      fingerprint: cartFingerprint,
      snapToken: transaction.token,
      redirect_url: transaction.redirect_url,
    });

    // ==============================================
    // 📲 WhatsApp + Email notifikasi
    // ==============================================
    const itemListText = cart
      .map(
        (item, i) =>
          `${i + 1}. ${item.name} - Rp${item.price} x ${item.qty || 1}`
      )
      .join("\n");

    const itemListHTML = cart
      .map(
        (item) =>
          `<li>${item.name} — Rp${item.price} x ${item.qty || 1}</li>`
      )
      .join("");

    try {
      // WA USER
      await sendWhatsapp(
        customer.phone,
        `Hai ${customer.firstName}! 👋

Pesanan kamu masih menunggu pembayaran.

🧾 Order ID: ${orderId}
💰 Total: Rp${gross_amount}

📦 Detail Pesanan:
${itemListText}

Klik untuk lanjutkan pembayaran:
${transaction.redirect_url}

Terima kasih!`
      );

      // EMAIL OWNER
      await sendEmail(
        process.env.OWNER_EMAIL,
        `New Pending Order — ${orderId}`,
        `
        <h2>New Pending Order</h2>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Total:</strong> Rp${gross_amount}</p>

        <h3>Customer Info</h3>
        <p>${customer.firstName} ${customer.lastName}</p>
        <p>Phone: ${customer.phone}</p>
        <p>Address: ${customer.address}</p>

        <h3>Items</h3>
        <ul>${itemListHTML}</ul>

        <p>Status: <strong>PENDING</strong></p>
      `
      );
    } catch (notifErr) {
      console.error("❌ Notification error:", notifErr);
    }

    return res.status(200).json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      reused: false,
      orderId,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      message: error.message || "Failed to create transaction",
    });
  }
}
