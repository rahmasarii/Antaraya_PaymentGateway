import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    displayImage: "",
    galleryImages: [],
    status: "READY",
    colors: [],
  });

  const [colorInput, setColorInput] = useState({ colorName: "", image: "" });
  const [galleryInput, setGalleryInput] = useState("");
  const [editId, setEditId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchProducts = async () => {
    const res = await axios.get("/api/products");
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // FILE UPLOAD HANDLER
  const handleFileUpload = async (file, type = "display") => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = response.data.url;

      if (type === "display") {
        setForm({ ...form, displayImage: imageUrl });
      } else if (type === "gallery") {
        setForm({ 
          ...form, 
          galleryImages: [...form.galleryImages, imageUrl] 
        });
        setGalleryInput("");
      } else if (type === "color") {
        setColorInput({ ...colorInput, image: imageUrl });
      }

      return imageUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  // HANDLE FORM INPUT
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ADD COLOR VARIANT
  const addColor = () => {
    if (!colorInput.colorName) return alert("Nama warna wajib");
    setForm({
      ...form,
      colors: [...form.colors, colorInput],
    });
    setColorInput({ colorName: "", image: "" });
  };

  const removeColor = (index) => {
    setForm({
      ...form,
      colors: form.colors.filter((_, i) => i !== index),
    });
  };

  // ADD GALLERY IMAGE (supports both URL and file upload)
  const addGalleryImage = async () => {
    if (!galleryInput) return alert("URL gambar wajib");
    
    // If it's a file input (from upload)
    if (galleryInput instanceof File) {
      await handleFileUpload(galleryInput, "gallery");
    } else {
      // If it's a URL
      setForm({
        ...form,
        galleryImages: [...form.galleryImages, galleryInput],
      });
      setGalleryInput("");
    }
  };

  const removeGalleryImage = (index) => {
    setForm({
      ...form,
      galleryImages: form.galleryImages.filter((_, i) => i !== index),
    });
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await axios.put("/api/products", { id: editId, ...form });
      } else {
        await axios.post("/api/products", form);
      }

      setForm({
        name: "",
        price: "",
        description: "",
        displayImage: "",
        galleryImages: [],
        status: "READY",
        colors: [],
      });

      setEditId(null);
      fetchProducts();
      alert("Product saved successfully!");
    } catch (e) {
      alert("Error saving product");
    }
  };

  // EDIT PRODUCT
  const handleEdit = (p) => {
    setForm({
      name: p.name,
      price: p.price,
      description: p.description || "",
      displayImage: p.displayImage || "",
      galleryImages: p.galleryImages || [],
      status: p.status || "READY",
      colors: p.colors || [],
    });
    setEditId(p._id);
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus produk ini?")) return;
    await axios.delete("/api/products", { data: { id } });
    fetchProducts();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🛍️ Admin Products</h1>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-6 border p-4 rounded">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Product Name"
          className="border p-2 w-full rounded"
          required
        />

        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          className="border p-2 w-full rounded"
          required
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="border p-2 w-full rounded"
        />

        {/* DISPLAY IMAGE - UPLOAD OR URL */}
        <div className="border p-3 rounded">
          <h2 className="font-semibold mb-2">Display Image</h2>
          
          {/* URL Input */}
          <input
            name="displayImage"
            value={form.displayImage}
            onChange={handleChange}
            placeholder="Or enter image URL"
            className="border p-2 w-full rounded mb-2"
          />
          
          {/* File Upload */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) handleFileUpload(file, "display");
            }}
            className="border p-2 w-full rounded"
            disabled={uploading}
          />
          
          {/* Preview */}
          {form.displayImage && (
            <div className="mt-2">
              <img 
                src={form.displayImage} 
                alt="Preview" 
                className="h-20 object-cover rounded"
              />
            </div>
          )}
        </div>

        {/* GALLERY IMAGES */}
        <div className="border p-3 rounded">
          <h2 className="font-semibold mb-2">Gallery Images</h2>

          <div className="flex gap-2 mb-2">
            {/* URL Input */}
            <input
              value={galleryInput}
              onChange={(e) => setGalleryInput(e.target.value)}
              placeholder="Image URL"
              className="border p-2 flex-1 rounded"
            />
            <button
              type="button"
              onClick={addGalleryImage}
              className="bg-green-600 text-white px-3 rounded"
              disabled={uploading}
            >
              Add URL
            </button>
          </div>

          {/* File Upload for Gallery */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setGalleryInput(file);
                addGalleryImage();
              }
            }}
            className="border p-2 w-full rounded mb-2"
            disabled={uploading}
          />

          {/* Gallery Preview */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            {form.galleryImages.map((img, i) => (
              <div key={i} className="relative border rounded">
                <img src={img} alt={`Gallery ${i}`} className="h-20 w-full object-cover rounded" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(i)}
                  className="absolute top-0 right-0 bg-red-600 text-white w-6 h-6 rounded-full"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        >
          <option value="READY">READY</option>
          <option value="HABIS">HABIS</option>
        </select>

        {/* COLORS */}
        <div className="border p-3 rounded">
          <h2 className="font-semibold mb-2">Color Variants</h2>

          <div className="space-y-2 mb-2">
            <input
              value={colorInput.colorName}
              onChange={(e) =>
                setColorInput({ ...colorInput, colorName: e.target.value })
              }
              placeholder="Color Name"
              className="border p-2 w-full rounded"
            />
            
            {/* Color Image URL */}
            <input
              value={colorInput.image}
              onChange={(e) =>
                setColorInput({ ...colorInput, image: e.target.value })
              }
              placeholder="Or enter color image URL"
              className="border p-2 w-full rounded"
            />
            
            {/* Color Image Upload */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) handleFileUpload(file, "color");
              }}
              className="border p-2 w-full rounded"
              disabled={uploading}
            />
            
            {/* Color Preview */}
            {colorInput.image && (
              <div className="mt-2">
                <img 
                  src={colorInput.image} 
                  alt="Color preview" 
                  className="h-16 w-16 object-cover rounded border"
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={addColor}
            className="bg-green-600 text-white px-3 py-2 rounded w-full"
          >
            Add Color Variant
          </button>

          {/* Color List */}
          <div className="mt-2 space-y-2">
            {form.colors.map((c, i) => (
              <div key={i} className="flex justify-between items-center border p-2 rounded">
                <div className="flex items-center gap-2">
                  {c.image && (
                    <img src={c.image} alt={c.colorName} className="h-8 w-8 object-cover rounded" />
                  )}
                  <span>{c.colorName}</span>
                </div>
                <button
                  onClick={() => removeColor(i)}
                  type="button"
                  className="text-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : (editId ? "Update Product" : "Add Product")}
        </button>
      </form>

      {/* PRODUCT LIST */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-1">Name</th>
            <th className="border px-3 py-1">Price</th>
            <th className="border px-3 py-1">Colors</th>
            <th className="border px-3 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td className="border px-3 py-1">{p.name}</td>
              <td className="border px-3 py-1">Rp {p.price}</td>
              <td className="border px-3 py-1">
                {p.colors.map((c) => c.colorName).join(", ")}
              </td>
              <td className="border px-3 py-1 space-x-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="bg-yellow-400 px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}