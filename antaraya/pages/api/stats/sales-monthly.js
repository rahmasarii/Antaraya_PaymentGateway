import dbConnect from "@/lib/db";
import Checkout from "@/models/Checkout";
import Product from "@/models/Product";

export default async function handler(req, res) {
  await dbConnect();

  try {
    const data = await Checkout.aggregate([
      { $match: { status: "PAID" } },

      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalSales: { $sum: "$total" },
          count: { $sum: 1 }
        }
      },

      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
