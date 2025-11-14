import dbConnect from "@/lib/db";
import Checkout from "@/models/Checkout";
import Payment from "@/models/Payment";
import Product from "@/models/Product";


export default async function handler(req, res) {
  await dbConnect();

  try {
    const data = await Checkout.find()
      .populate("items.product")
      .sort({ createdAt: -1 });

    // ambil payment juga
    const payments = await Payment.find().sort({ createdAt: -1 });

    res.status(200).json({
      checkout: data,
      payments,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
