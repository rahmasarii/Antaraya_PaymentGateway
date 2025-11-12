// pages/api/webhook.js
import dbConnect from '../../lib/db';
import Checkout from '../../models/Checkout';
import Payment from '../../models/Payment';
import crypto from 'crypto';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== 'POST') return res.status(405).end();
  const body = req.body;
  /*
    notification has fields:
    order_id, status_code, gross_amount, transaction_status, transaction_id, payment_type, signature_key, ...
  */
  const { order_id, status_code, gross_amount, transaction_status, transaction_id, payment_type, signature_key } = body;

  // Verify signature key: SHA512(order_id + status_code + gross_amount + serverKey)
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const toHash = order_id + status_code + gross_amount + serverKey;
  const expectedSignature = crypto.createHash('sha512').update(toHash).digest('hex');

  if (expectedSignature !== signature_key) {
    console.warn('Invalid signature', expectedSignature, signature_key);
    return res.status(403).send('invalid signature');
  }

  // Save payment record
  await Payment.create({
    orderId: order_id,
    transactionId: transaction_id,
    payment_type,
    transaction_status,
    gross_amount: Number(gross_amount),
    raw: body
  });

  // Update checkout status based on transaction_status
  if (transaction_status === 'settlement' || transaction_status === 'capture' || transaction_status === 'success') {
    await Checkout.findOneAndUpdate({ orderId: order_id }, { status: 'PAID' });
  } else if (transaction_status === 'expire') {
    await Checkout.findOneAndUpdate({ orderId: order_id }, { status: 'EXPIRED' });
  } else if (transaction_status === 'cancel') {
    await Checkout.findOneAndUpdate({ orderId: order_id }, { status: 'CANCELLED' });
  }

  // Respond 200 as acknowledgement
  res.status(200).send('ok');
}
