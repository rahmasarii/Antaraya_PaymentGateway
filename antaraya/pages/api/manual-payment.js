import dbConnect from "../../lib/db";
import Checkout from "../../models/Checkout";
import sendEmail from "../../lib/sendemail";
import sendWhatsapp from "../../lib/sendwhatsapp";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  try {
    const { cart, customer, proof } = req.body;

    if (!cart?.length) {
      return res.status(400).json({ message: "Cart kosong" });
    }

    if (!proof) {
      return res.status(400).json({ message: "Bukti pembayaran wajib diupload" });
    }

    const orderId = "manual-" + Date.now();
    const total = cart.reduce(
      (sum, item) => sum + item.price * (item.qty || 1),
      0
    );

    // Simpan ke DB
    await Checkout.create({
      orderId,
      items: cart,
      total,
      customer,
      paymentProof: proof, // <-- URL CLOUDINARY
      status: "WAITING_APPROVAL",
    });

// WhatsApp Customer
try {
  await sendWhatsapp(
    customer.phone,
    `Hai ${customer.firstName}! 👋

Terima kasih telah berbelanja di Antaraya! 🙏
Kami telah menerima bukti pembayaranmu dan pesanan akan segera kami proses.

🧾 *Order ID:* ${orderId}
💰 *Total:* Rp${total}

📦 *Detail Pesanan:*
${itemListText}

Jika diperlukan, kami akan menghubungi kamu untuk informasi lebih lanjut.

Terima kasih sudah mempercayai Antaraya! 💙`
  );
} catch (waErr) {
  console.log("WA error:", waErr);
}



    // EMAIL owner (langsung kirim URL bukti)
    await sendEmail(
      process.env.OWNER_EMAIL,
      `New Manual Payment — ${orderId}`,
      `
        <h2>New Manual Payment</h2>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Total:</strong> Rp${total}</p>

        <h3>Customer</h3>
        <p>${customer.firstName} ${customer.lastName}</p>
        <p>${customer.phone}</p>
        <p>${customer.address}</p>

        <h3>Items</h3>
        <ul>
          ${cart.map(item => `<li>${item.name} — Rp${item.price} x ${item.qty || 1}</li>`).join("")}
        </ul>

        <h3>Bukti Pembayaran</h3>
        <p><a href="${proof}" target="_blank">Klik untuk melihat bukti transfer</a></p>
      `
    );

    return res.status(200).json({ success: true, orderId });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Failed to process payment" });
  }
}
