// pages/admin/products.js
import { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [uploading, setUploading] = useState(false);

  // FORM STATE
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

  // EDIT MODAL STATE
  const [editProduct, setEditProduct] = useState(null);

  // REF → untuk auto scroll
  const editSectionRef = useRef(null);

  const fetchProducts = async () => {
    const res = await axios.get("/api/products");
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();

    const savedForm = localStorage.getItem("adminProductForm");
    if (savedForm) setForm(JSON.parse(savedForm));
  }, []);

  useEffect(() => {
    localStorage.setItem("adminProductForm", JSON.stringify(form));
  }, [form]);

  // 🔥 AUTO SCROLL KE EDIT MODAL
  useEffect(() => {
    if (editProduct && editSectionRef.current) {
      editSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [editProduct]);

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

  // EDIT FILE UPLOAD HANDLER
  const handleEditFileUpload = async (file, type = "display", index = null) => {
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
        setEditProduct({ ...editProduct, displayImage: imageUrl });
      } else if (type === "gallery") {
        const updatedGallery = [...editProduct.galleryImages];
        if (index !== null) {
          updatedGallery[index] = imageUrl;
        } else {
          updatedGallery.push(imageUrl);
        }
        setEditProduct({ ...editProduct, galleryImages: updatedGallery });
      } else if (type === "color" && index !== null) {
        const updatedColors = [...editProduct.colors];
        updatedColors[index].image = imageUrl;
        setEditProduct({ ...editProduct, colors: updatedColors });
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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ADD COLOR
  const addColor = () => {
    if (!colorInput.colorName) return alert("Nama warna wajib!");
    setForm({
      ...form,
      colors: [...form.colors, colorInput],
    });
    setColorInput({ colorName: "", image: "" });
  };

  const removeColor = (i) =>
    setForm({
      ...form,
      colors: form.colors.filter((_, index) => index !== i),
    });

  // ADD GALLERY (supports both URL and file upload)
  const addGalleryImage = async () => {
    if (!galleryInput) return alert("URL wajib!");
    
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

  const removeGalleryImage = (i) =>
    setForm({
      ...form,
      galleryImages: form.galleryImages.filter((_, index) => index !== i),
    });

  // CLEAR FORM FUNCTION
  const clearForm = () => {
    setForm({
      name: "",
      price: "",
      description: "",
      displayImage: "",
      galleryImages: [],
      status: "READY",
      colors: [],
    });
    setColorInput({ colorName: "", image: "" });
    setGalleryInput("");
    localStorage.removeItem("adminProductForm");
  };

  // MODIFY handleSubmit to clear form after success
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/products", form);
      alert("Produk ditambahkan");
      fetchProducts();
      clearForm();
    } catch {
      alert("Error saving product");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus produk ini?")) return;
    try {
      await axios.delete('/api/products', { 
        data: { id } 
      });
      alert("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      alert("Error deleting product");
      console.log(error);
    }
  };

  // SAVE EDITED PRODUCT
  const saveEdit = async () => {
    try {
      await axios.put("/api/products", {
        id: editProduct._id,
        ...editProduct,
      });
      alert("Product updated");

      setEditProduct(null);
      fetchProducts();
    } catch (e) {
      alert("Error updating product");
      console.log(e);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🛍️ Admin Products</h1>

      {/* ADD PRODUCT FORM */}
      <form
        onSubmit={handleSubmit}
        className="space-y-3 mb-6 border p-4 rounded"
      >
        <h2 className="font-semibold text-lg">Add New Product</h2>

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
          <h3 className="font-semibold mb-2">Display Image</h3>
          
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
                    className="object-cover rounded border mt-1"
    style={{ width: "32px", height: "32px" }}
                alt="Preview" 
              />
            </div>
          )}
        </div>

        {/* GALLERY IMAGES */}
        <div className="border p-3 rounded">
          <h3 className="font-semibold mb-2">Gallery Images</h3>

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
                <img src={img} alt={`Gallery ${i}`} className="h-20 w-full object-cover rounded"                    
                style={{ width: "32px", height: "32px" }}
/>
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

        {/* STATUS */}
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
          <h3 className="font-semibold mb-2">Color Variants</h3>

          <div className="space-y-2 mb-2">
            <input
              value={colorInput.colorName}
              onChange={(e) =>
                setColorInput({ ...colorInput, colorName: e.target.value })
              }
              placeholder="Color Name"
              className="border p-2 w-full rounded"
                                 style={{ width: "32px", height: "32px" }}

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
                                     style={{ width: "32px", height: "32px" }}

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
                <div className="flex items-center gap-2" >
                  
                  {c.image && (
                    <img src={c.image} alt={c.colorName} className="h-8 w-8 object-cover rounded"       
          style={{ width: "32px", height: "32px" }}
 />
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
          {uploading ? "Uploading..." : "Add Product"}
        </button>
      </form>

      {/* TABLE */}
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2">Img</th>
            <th className="border px-3 py-2">Name</th>
            <th className="border px-3 py-2">Price</th>
            <th className="border px-3 py-2">Status</th>
            <th className="border px-3 py-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td className="border p-2 text-center">
                {p.displayImage ? (
                  <img
                    src={p.displayImage}
                    className="object-cover mx-auto rounded"
                    style={{ width: "24px", height: "24px" }}
                  />
                ) : (
                  "-"
                )}
              </td>
              <td className="border px-3 py-2">{p.name}</td>
              <td className="border px-3 py-2">Rp {p.price}</td>
              <td className="border px-3 py-2">{p.status}</td>
              <td className="border px-3 py-2 space-x-2">
                <button
                  className="bg-yellow-400 px-2 py-1 rounded"
                  onClick={() => setEditProduct({ ...p })}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => handleDelete(p._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* EDIT MODAL */}
      {editProduct && (
        <div
          ref={editSectionRef}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white p-6 rounded w-full max-w-lg max-h-[90vh] overflow-auto">

            <h2 className="text-xl font-bold mb-4">Edit Product</h2>

            {/* NAME */}
            <input
              className="border p-2 w-full mb-2 rounded"
              value={editProduct.name}
              onChange={(e) =>
                setEditProduct({ ...editProduct, name: e.target.value })
              }
              placeholder="Product Name"
            />

            {/* PRICE */}
            <input
              type="number"
              className="border p-2 w-full mb-2 rounded"
              value={editProduct.price}
              onChange={(e) =>
                setEditProduct({ ...editProduct, price: e.target.value })
              }
              placeholder="Price"
            />

            {/* DESCRIPTION */}
            <textarea
              className="border p-2 w-full mb-2 rounded"
              value={editProduct.description}
              onChange={(e) =>
                setEditProduct({ ...editProduct, description: e.target.value })
              }
              placeholder="Description"
            />

            {/* DISPLAY IMAGE - UPLOAD OR URL */}
            <div className="border p-3 rounded mb-2">
              <h3 className="font-semibold mb-2">Display Image</h3>
              
              {/* URL Input */}
              <input
                className="border p-2 w-full rounded mb-2"
                value={editProduct.displayImage}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, displayImage: e.target.value })
                }
                placeholder="Display Image URL"
              />
              
              {/* File Upload */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) handleEditFileUpload(file, "display");
                }}
                className="border p-2 w-full rounded"
                disabled={uploading}
              />
              
              {/* Preview */}
              {editProduct.displayImage && (
                <div className="mt-2">
                  <img 
                    src={editProduct.displayImage} 
                    alt="Preview" 
                    className="h-20 object-cover rounded"
          style={{ width: "32px", height: "32px" }}

                  />
                </div>
              )}
            </div>

            <h3 className="font-semibold mt-3">Gallery Images</h3>

          {/* ADD GALLERY IMAGE - URL INPUT */}
<div className="flex gap-2 mb-2">
  <input
    className="border p-2 w-full rounded"
    placeholder="New Image URL"
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!e.target.value) return;
        setEditProduct({
          ...editProduct,
          galleryImages: [
            ...editProduct.galleryImages,
            e.target.value,
          ],
        });
        e.target.value = "";
      }
    }}
  />
  <button
    type="button"
    onClick={(e) => {
      const input = e.target.previousElementSibling;
      if (!input.value) return;
      setEditProduct({
        ...editProduct,
        galleryImages: [
          ...editProduct.galleryImages,
          input.value,
        ],
      });
      input.value = "";
    }}
    className="bg-green-600 text-white px-3 rounded"
  >
    Add URL
  </button>
</div>

            {/* File Upload for Gallery in Edit */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) handleEditFileUpload(file, "gallery");
              }}
              className="border p-2 w-full rounded mb-2"
              disabled={uploading}
            />

            {/* LIST GALLERY */}
            <div className="flex flex-wrap gap-3 mb-4">
              {editProduct.galleryImages.map((img, i) => (
                <div key={i} className="relative border p-2 rounded w-28 text-center">
                  {/* IMAGE PREVIEW */}
                  {img ? (
                    <img
                      src={img}
                      className="w-24 h-24 object-cover rounded mx-auto mb-1"
                                style={{ width: "32px", height: "32px" }}

                    />
                  ) : null}

                  {/* URL INPUT */}
                  <input
                    type="text"
                    value={img}
                    onChange={(e) => {
                      const updated = [...editProduct.galleryImages];
                      updated[i] = e.target.value;
                      setEditProduct({ ...editProduct, galleryImages: updated });
                    }}
                    className="border rounded w-full p-1 text-xs"
                    placeholder="Image URL"
                  />

                  {/* FILE UPLOAD FOR SPECIFIC GALLERY ITEM */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleEditFileUpload(file, "gallery", i);
                    }}
                    className="border rounded w-full p-1 text-xs mt-1"
                    
                    disabled={uploading}
                  />

                  {/* REMOVE BUTTON */}
                  <button
                    type="button"
                    onClick={() =>
                      setEditProduct({
                        ...editProduct,
                        galleryImages: editProduct.galleryImages.filter(
                          (_, idx) => idx !== i
                        ),
                      })
                    }
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>

                <select
  value={editProduct.status}
  onChange={(e) =>
    setEditProduct({ ...editProduct, status: e.target.value })
  }
  className="border p-2 w-full rounded"
>
  <option value="READY">READY</option>
  <option value="HABIS">HABIS</option>
</select>


            {/* COLORS */}
            <h3 className="font-semibold mt-2">Colors</h3>

         {/* ADD COLOR - WITH URL INPUT */}
<div className="border p-3 rounded mb-2">
  <h3 className="font-semibold mb-2">Add Color Variant</h3>
  
  <div className="space-y-2 mb-2">
    <input
      placeholder="Color Name"
      className="border p-2 w-full rounded"
      id="colorNameInput"
    />
    
    <input
      placeholder="Color Image URL"
      className="border p-2 w-full rounded"
      id="colorImageInput"
    />
  </div>

  <button
    type="button"
    onClick={() => {
      const nameInput = document.getElementById('colorNameInput');
      const imageInput = document.getElementById('colorImageInput');
      const colorName = nameInput.value.trim();
      
      if (!colorName) return alert("Color name is required!");
      
      setEditProduct({
        ...editProduct,
        colors: [...editProduct.colors, { 
          colorName, 
          image: imageInput.value 
        }],
      });
      
      nameInput.value = "";
      imageInput.value = "";
    }}
    className="bg-green-600 text-white px-3 py-2 rounded w-full"
  >
    Add Color Variant
  </button>
</div>

          {/* COLOR LIST */}
<div className="flex flex-wrap gap-2">
  {editProduct.colors.map((c, i) => (
    <div key={i} className="border p-2 rounded text-center relative w-32">

      {/* IMAGE PREVIEW */}
      <img
        src={c.image || "/no-image.png"}
        className="object-cover rounded mx-auto mb-1 bg-gray-200"
        style={{ width: "32px", height: "32px" }}
      />

      {/* COLOR NAME */}
      <input
        className="border p-1 w-full text-xs rounded mb-1"
        value={c.colorName}
        onChange={(e) => {
          const newColors = [...editProduct.colors];
          newColors[i].colorName = e.target.value;
          setEditProduct({ ...editProduct, colors: newColors });
        }}
        placeholder="Color Name"
      />

      {/* IMAGE URL INPUT */}
      <input
        className="border p-1 w-full text-xs rounded mb-1"
        value={c.image}
        placeholder="Image URL"
        onChange={(e) => {
          const newColors = [...editProduct.colors];
          newColors[i].image = e.target.value;
          setEditProduct({ ...editProduct, colors: newColors });
        }}
      />

      {/* IMAGE UPLOAD */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) handleEditFileUpload(file, "color", i);
        }}
        className="border rounded w-full p-1 text-xs"
        disabled={uploading}
      />

      {/* DELETE BUTTON */}
      <button
        onClick={() =>
          setEditProduct({
            ...editProduct,
            colors: editProduct.colors.filter(
              (_, idx) => idx !== i
            ),
          })
        }
        className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1"
      >
        x
      </button>

    </div>
  ))}
</div>


            {/* SAVE BUTTON */}
            <button
              onClick={saveEdit}
              className="mt-4 bg-blue-600 text-white w-full py-2 rounded"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Save Changes"}
            </button>

            {/* CLOSE */}
            <button
              onClick={() => setEditProduct(null)}
              className="mt-2 bg-gray-700 text-white w-full py-2 rounded"
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
}