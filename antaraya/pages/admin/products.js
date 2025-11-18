// pages/admin/products.js
import { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);

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

  // ADD GALLERY
  const addGalleryImage = () => {
    if (!galleryInput) return alert("URL wajib!");
    setForm({
      ...form,
      galleryImages: [...form.galleryImages, galleryInput],
    });
    setGalleryInput("");
  };

  const removeGalleryImage = (i) =>
    setForm({
      ...form,
      galleryImages: form.galleryImages.filter((_, index) => index !== i),
    });

    
// ADD THIS CLEAR FORM FUNCTION
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
    clearForm(); // ← ADD THIS LINE
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
        />

        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          className="border p-2 w-full rounded"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="border p-2 w-full rounded"
        />

{/* DISPLAY IMAGE INPUT */}
<input
  name="displayImage"
  value={form.displayImage}
  onChange={handleChange}
  placeholder="Display Image URL"
  className="border p-2 w-full rounded"
/>

{/* SMALL DISPLAY IMAGE PREVIEW */}
{form.displayImage && (
  <img
    src={form.displayImage}
    className="object-cover rounded mt-1 border"
    style={{ width: "32px", height: "32px" }}
  />
)}

{/* GALLERY */}
<div className="border p-3 rounded mt-4">
  <h3 className="font-semibold mb-2">Gallery Images</h3>

<div className="flex flex-wrap gap-2">
    <input
      value={galleryInput}
      onChange={(e) => setGalleryInput(e.target.value)}
      placeholder="Image URL"
      className="border p-2 w-full rounded"
    />
    <button
      type="button"
      onClick={addGalleryImage}
      className="bg-green-600 text-white px-3 rounded"
    >
      Add
    </button>
  </div>
<div className="flex flex-col gap-2">
  {form.galleryImages.map((img, i) => (
    <div
      key={i}
      className="flex flex-nowrap items-center gap-3 p-2 border rounded"
      style={{ width: "100%", overflow: "hidden" }}
    >
      <img
        src={img}
        style={{
          width: "32px",
          height: "32px",
          objectFit: "cover",
          flexShrink: 0,
        }}
        className="rounded border"
      />

      <p
        className="text-[11px] break-all"
        style={{ flex: 1, minWidth: 0 }}
      >
        {img}
      </p>

      <button
        type="button"
        onClick={() => removeGalleryImage(i)}
        className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex-shrink-0"
      >
        x
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
  className="border p-2 w-full rounded mt-4"
>
  <option value="READY">READY</option>
  <option value="HABIS">HABIS</option>
</select>

{/* COLORS */}
<div className="border p-3 rounded mt-4">
  <h3 className="font-semibold mb-2">Color Variants</h3>

  <div className="flex gap-2 mb-2">
    <input
      value={colorInput.colorName}
      onChange={(e) =>
        setColorInput({ ...colorInput, colorName: e.target.value })
      }
      placeholder="Color Name"
      className="border p-2 w-full rounded"
    />
    <input
      value={colorInput.image}
      onChange={(e) =>
        setColorInput({ ...colorInput, image: e.target.value })
      }
      placeholder="Image URL"
      className="border p-2 w-full rounded"
    />
    <button
      type="button"
      onClick={addColor}
      className="bg-green-600 text-white px-3 rounded"
    >
      Add
    </button>
  </div>
{/* COLOR PREVIEW — HORIZONTAL */}
<div className="flex flex-col gap-2">
  {form.colors.map((c, i) => (
    <div
      key={i}
      className="flex items-center gap-3 p-2 border rounded relative"
    >
      {c.image && (
        <img
          src={c.image}
          className="object-cover rounded border"
          style={{ width: "32px", height: "32px" }}
        />
      )}

      <div className="flex-1">
        <p className="text-sm font-semibold">{c.colorName}</p>
        {c.image && (
          <p className="text-[11px] break-all">{c.image}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => removeColor(i)}
        className="bg-red-500 text-white text-xs rounded-full px-2 py-1"
      >
        x
      </button>
    </div>
  ))}
</div>


  
</div>


        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Product
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
            />

            {/* PRICE */}
            <input
              type="number"
              className="border p-2 w-full mb-2 rounded"
              value={editProduct.price}
              onChange={(e) =>
                setEditProduct({ ...editProduct, price: e.target.value })
              }
            />

            {/* DESCRIPTION */}
            <textarea
              className="border p-2 w-full mb-2 rounded"
              value={editProduct.description}
              onChange={(e) =>
                setEditProduct({ ...editProduct, description: e.target.value })
              }
            />

            {/* DISPLAY IMAGE */}
            <input
              className="border p-2 w-full mb-2 rounded"
              value={editProduct.displayImage}
              onChange={(e) =>
                setEditProduct({ ...editProduct, displayImage: e.target.value })
              }
              placeholder="Display Image URL"
            />

            <h3 className="font-semibold mt-3">Gallery Images</h3>

            {/* ADD GALLERY IMAGE */}
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
            </div>
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

            {/* COLORS */}
            <h3 className="font-semibold mt-2">Colors</h3>

            {/* ADD COLOR */}
            <div className="flex gap-2 mb-2">
              <input
                placeholder="Color Name"
                className="border p-2 w-full rounded"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const colorName = e.target.value.trim();
                    if (!colorName) return;
                    setEditProduct({
                      ...editProduct,
                      colors: [...editProduct.colors, { colorName, image: "" }],
                    });
                    e.target.value = "";
                  }
                }}
              />
            </div>

            {/* COLOR LIST */}
            <div className="flex flex-wrap gap-2">
              {editProduct.colors.map((c, i) => (
                <div key={i} className="border p-2 rounded text-center relative">

                  <img
                    src={c.image || "/no-image.png"}
                    className="object-cover rounded mx-auto mb-1 bg-gray-200"
                    style={{ width: "28px", height: "28px" }}
                  />

                  <input
                    className="border p-1 w-full text-xs rounded mb-1"
                    value={c.colorName}
                    onChange={(e) => {
                      const newColors = [...editProduct.colors];
                      newColors[i].colorName = e.target.value;
                      setEditProduct({ ...editProduct, colors: newColors });
                    }}
                  />

                  <input
                    className="border p-1 w-full text-xs rounded"
                    value={c.image}
                    placeholder="Image URL (optional)"
                    onChange={(e) => {
                      const newColors = [...editProduct.colors];
                      newColors[i].image = e.target.value;
                      setEditProduct({ ...editProduct, colors: newColors });
                    }}
                  />

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
            >
              Save Changes
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
