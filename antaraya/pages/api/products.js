// pages/api/products.js
import dbConnect from '../../lib/db';
import Product from '../../models/Product';

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;
if (method === 'GET') {
  const { id, category } = req.query;

  // Jika ada parameter id, ambil produk spesifik
  if (id) {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }
    return res.json(product);
  }

  // Jika tidak ada id, baru pakai filter kategori
  const filter = category ? { category } : {};
  const products = await Product.find(filter).sort('-createdAt');
  return res.json(products);
}

  if (method === 'POST') {
    const p = await Product.create(req.body);
    return res.status(201).json(p);
  }
  if (method === 'PUT') {
    const { id, ...data } = req.body;
    const p = await Product.findByIdAndUpdate(id, data, { new: true });
    return res.json(p);
  }
  if (method === 'DELETE') {
    const { id } = req.body;
    await Product.findByIdAndDelete(id);
    return res.json({ ok: true });
  }
  res.setHeader('Allow', ['GET','POST','PUT','DELETE']);
  res.status(405).end(`Method ${method} Not Allowed`);
}
