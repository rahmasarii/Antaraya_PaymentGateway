// pages/api/webhook.js
import dbConnect from "../../lib/db";
import Checkout from "../../models/Checkout";
import Payment from "../../models/Payment";
import sendWhatsapp from "../../lib/sendwhatsapp";
import sendEmail from "../../lib/sendemail";
import crypto from "crypto";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") return res.status(405).end();
  const body = req.body;

  const {
    order_id,
    status_code,
    gross_amount,
    transaction_status,
    transaction_id,
    payment_type,
    signature_key,
  } = body;

  // verify signature
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const toHash = order_id + status_code + gross_amount + serverKey;
  const expectedSignature = crypto
    .createHash("sha512")
    .update(toHash)
    .digest("hex");

  if (expectedSignature !== signature_key) {
    return res.status(403).send("invalid signature");
  }

  // get checkout first
  const checkout = await Checkout.findOne({ orderId: order_id });
  const customer = checkout?.customer;

  // convert midtrans status → our status
  let newStatus = transaction_status.toUpperCase(); // settlement → SETTLEMENT

  // NORMALIZE
  if (
    newStatus === "SETTLEMENT" ||
    newStatus === "CAPTURE" ||
    newStatus === "SUCCESS"
  ) {
    newStatus = "PAID";
  } else if (newStatus === "EXPIRE") {
    newStatus = "EXPIRED";
  } else if (newStatus === "CANCEL") {
    newStatus = "CANCELLED";
  } else if (newStatus === "PENDING") {
    newStatus = "PENDING";
  }

  // CHECK DUPLICATE STATUS → SKIP
  if (checkout.status === newStatus) {
    console.log("Skip duplicate webhook, status:", newStatus);
    return res.status(200).send("ok");
  }

  // update status
  await Checkout.findOneAndUpdate({ orderId: order_id }, { status: newStatus });

  // ADMIN EMAIL
  const adminEmail = "celinemasko@gmail.com";

  // ================
  // SEND NOTIFICATION (only once)
  // ================

  if (newStatus === "PAID") {
    await sendEmail(
      adminEmail,
      `PAID: ${order_id}`,
      `
      <h3>Transaksi LUNAS</h3>
      <p>Order ID: ${order_id}</p>
      <p>Total: Rp${gross_amount}</p>
      <p>Status: <b>PAID</b></p>
      `
    );

    await sendWhatsapp(
      customer.phone,
      `Yeay! Pembayaran kamu sudah diterima 🎉\n\nOrder ID: ${order_id}\nTotal: Rp${gross_amount}\nStatus: PAID`
    );
  }

  if (newStatus === "EXPIRED") {
    await sendEmail(
      adminEmail,
      `EXPIRED: ${order_id}`,
      `
      <h3>Transaksi Kedaluwarsa</h3>
      <p>Order ID: ${order_id}</p>
      <p>Status: <b>EXPIRED</b></p>
      `
    );

    await sendWhatsapp(
      customer.phone,
      `Transaksi kedaluwarsa 😢\nOrder ID: ${order_id}\nStatus: EXPIRED`
    );
  }

  if (newStatus === "CANCELLED") {
    await sendEmail(
      adminEmail,
      `CANCELLED: ${order_id}`,
      `
      <h3>Transaksi Dibatalkan</h3>
      <p>Order ID: ${order_id}</p>
      <p>Status: <b>CANCELLED</b></p>
      `
    );

    await sendWhatsapp(
      customer.phone,
      `Transaksi kamu dibatalkan.\nOrder ID: ${order_id}`
    );
  }

  return res.status(200).send("ok");
}
