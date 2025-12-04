import { IncomingForm } from "formidable";
import cloudinary from "cloudinary";

// Wajib - matikan body parser bawaan Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ error: err.message });
    }

    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const uploadResult = await cloudinary.v2.uploader.upload(
        file[0].filepath, // << Formidable v3 menyimpan file di dalam array
        {
          folder: "proof-payments",
        }
      );

      return res.status(200).json({
        url: uploadResult.secure_url,
      });
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return res.status(500).json({ error: "Upload failed" });
    }
  });
}
