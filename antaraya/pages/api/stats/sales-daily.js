import dbConnect from "@/lib/db";
import Checkout from "@/models/Checkout";
import Product from "@/models/Product";

export default async function handler(req, res) {
  await dbConnect();

  try {
    const dailySales = await Checkout.aggregate([
      {
        $match: {
          status: { $in: ["PAID", "paid", "SUCCESS"] }, 
          // jika mau semua status, hapus baris match ini
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            }
          },
          totalSales: { $sum: "$total" }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);

    res.status(200).json(dailySales);
  } catch (err) {
    console.error("Error Daily Sales:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
