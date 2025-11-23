import formidable from "formidable";
import fs from "fs";
import cloudinary from "cloudinary";

export const config = {
  api: {
    bodyParser: false, // REQUIRED for formidable
  },
};

// Cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({
    keepExtensions: true,
  });

  try {
    const [fields, files] = await form.parse(req);

    const file = files.file?.[0];
    if (!file) return res.status(400).json({ error: "No file received" });

    // Upload to Cloudinary
    const upload = await cloudinary.v2.uploader.upload(file.filepath, {
      folder: "antaraya", // optional folder
    });

    return res.json({
      success: true,
      url: upload.secure_url, // final Cloudinary URL
      public_id: upload.public_id,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({ error: "Upload failed" });
  }
}
