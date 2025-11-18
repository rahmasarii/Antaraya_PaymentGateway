import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uploadDir = path.join(process.cwd(), 'public/uploads');
  
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    filename: (name, ext, part) => {
      return `${Date.now()}-${part.originalFilename}`;
    },
  });

  try {
    const [fields, files] = await form.parse(req);
    
    const file = files.file[0];
    const fileUrl = `/uploads/${file.newFilename}`;
    
    res.json({ 
      success: true, 
      url: fileUrl,
      filename: file.newFilename 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
}