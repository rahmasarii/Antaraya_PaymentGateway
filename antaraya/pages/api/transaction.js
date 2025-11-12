// pages/api/transactions.js
import dbConnect from '../../lib/db';
import Payment from '../../models/Payment';
import Checkout from '../../models/Checkout';

export default async function handler(req,res){
  await dbConnect();
  if (req.method === 'GET') {
    const payments = await Payment.find().sort('-createdAt').limit(200);
    // optional: populate checkout info
    return res.json(payments);
  }
  res.status(405).end();
}
