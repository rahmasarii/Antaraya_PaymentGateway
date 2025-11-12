// pages/api/test-db.js
import dbConnect from '../../lib/db';

export default async function handler(req, res) {
  try {
    await dbConnect();
    res.status(200).json({ success: true, message: 'MongoDB connected successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'MongoDB connection failed!', error: error.message });
  }
}
