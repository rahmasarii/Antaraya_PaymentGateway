import dbConnect from "../../../lib/db";
import Checkout from "../../../models/Checkout";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  const { orderId, status } = req.body;

  if (!orderId || !status) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const updated = await Checkout.findOneAndUpdate(
      { orderId },
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      message: "Status updated",
      data: updated,
    });
  } catch (err) {
    console.error("Update error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
