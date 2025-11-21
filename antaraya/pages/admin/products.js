// pages/admin/products.js
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import AdminNavbar from "@/components/AdminNavbar";
import "@/styles/AdminProducts.module.css";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

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

  // AUTO SCROLL KE MODAL
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

  useEffect(() => {
    if (editProduct && editSectionRef.current) {
      editSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [editProduct]);

  // LOGOUT HANDLER
  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/login";
  };

  // FILE UPLOAD HANDLER
  const handleFileUpload = async (file, type = "display") => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const url = response.data.url;

      if (type === "display") {
        setForm({ ...form, displayImage: url });
      } else if (type === "gallery") {
        setForm({
          ...form,
          galleryImages: [...form.galleryImages, url],
        });
        setGalleryInput("");
      } else if (type === "color") {
        setColorInput({ ...colorInput, image: url });
      }

      return url;
    } catch {
      alert("Upload gagal");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleEditFileUpload = async (file, type = "display", index = null) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const url = response.data.url;

      if (type === "display") {
        setEditProduct({ ...editProduct, displayImage: url });
      } else if (type === "gallery") {
        const updatedGallery = [...editProduct.galleryImages];
        if (index !== null) updatedGallery[index] = url;
        else updatedGallery.push(url);
        setEditProduct({ ...editProduct, galleryImages: updatedGallery });
      } else if (type === "color" && index !== null) {
        const updatedColors = [...editProduct.colors];
        updatedColors[index].image = url;
        setEditProduct({ ...editProduct, colors: updatedColors });
      }

      return url;
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
      colors: form.colors.filter((_, idx) => idx !== i),
    });

  const addGalleryImage = async () => {
    if (!galleryInput) return alert("URL wajib!");

    if (galleryInput instanceof File) {
      await handleFileUpload(galleryInput, "gallery");
    } else {
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
      galleryImages: form.galleryImages.filter((_, idx) => idx !== i),
    });

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
    setShowAddForm(false);
  };

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
      await axios.delete("/api/products", { data: { id } });
      alert("Product deleted");
      fetchProducts();
    } catch {
      alert("Error deleting");
    }
  };

  const saveEdit = async () => {
    try {
      await axios.put("/api/products", {
        id: editProduct._id,
        ...editProduct,
      });
      alert("Product updated");
      setEditProduct(null);
      fetchProducts();
    } catch {
      alert("Error updating");
    }
  };

  // Format date untuk display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  // Generate SKU-like ID untuk display
  const generateDisplayId = (id) => {
    if (!id) return 'db:0/00000';
    const shortId = id.substring(0, 8);
    return `db:${Math.floor(Math.random() * 10)}/${Math.floor(10000 + Math.random() * 90000)}`;
  };

  return (
    <>
      {/* NAVBAR */}
      <AdminNavbar onLogout={handleLogout} />

      {/* MAIN WRAPPER */}
      <div className="admin-products-container">
        <div className="admin-products-header">
          <h1 className="admin-products-title">
            🛍️ Products
          </h1>
          <button
            className="add-product-toggle"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? '✕ Cancel' : '+ Add Product'}
          </button>
        </div>

        {/* ADD PRODUCT FORM */}
        {showAddForm && (
          <div className="admin-products-card form-container">
            <h2>Add New Product</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="admin-flex">
                <div className="admin-flex-1 admin-mr-2">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Product Name"
                    className="admin-input"
                    required
                  />
                </div>
                <div className="admin-flex-1">
                  <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Price"
                    className="admin-input"
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Description"
                  className="admin-textarea"
                />
              </div>

              {/* DISPLAY IMAGE */}
              <div className="admin-section">
                <h3>Display Image</h3>
                <input
                  name="displayImage"
                  value={form.displayImage}
                  onChange={handleChange}
                  placeholder="Or enter image URL"
                  className="admin-input admin-mb-2"
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleFileUpload(file, "display");
                  }}
                  className="admin-input"
                  disabled={uploading}
                />

                {form.displayImage && (
                  <div className="admin-mt-2">
                    <img
                      src={form.displayImage}
                      className="admin-image-preview"
                      alt="Display preview"
                    />
                  </div>
                )}
              </div>

              <div className="admin-flex">
                <div className="admin-flex-1 admin-mr-2">
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="admin-select"
                  >
                    <option value="READY">READY</option>
                    <option value="HABIS">HABIS</option>
                  </select>
                </div>
                <div className="admin-flex-1">
                  <button
                    type="submit"
                    className="admin-btn admin-btn-primary admin-w-full"
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Add Product"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* PRODUCT LIST */}
        {/* <div className="admin-products-card">
          <h2>Product List ({products.length} products)</h2>
          <div className="products-list">
            {products.length === 0 ? (
              <div className="empty-state">
                <p>No products found. Add your first product!</p>
              </div>
            ) : (
              products.map((product) => (
                <div key={product._id} className="product-card">
                  <div className="product-header">
                    <div className="product-name-section">
                      {product.displayImage && (
                        <img
                          src={product.displayImage}
                          className="product-image"
                          alt={product.name}
                        />
                      )}
                      <div className="product-name-info">
                        <div className="product-name">{product.name}</div>
                        <div className="product-sku">
                          {generateDisplayId(product._id)}
                        </div>
                      </div>
                    </div>
                    <div className="product-date">
                      {formatDate(product.createdAt || new Date())}
                    </div>
                  </div>

                  <div className="product-details">
                    <div className="product-detail-item">
                      <span className="detail-label">Status</span>
                      <span className={`detail-value ${product.status === 'READY' ? 'status-ready' : 'status-habis'}`}>
                        {product.status}
                      </span>
                    </div>
                    <div className="product-detail-item">
                      <span className="detail-label">Price</span>
                      <span className="detail-value">Rp {product.price}</span>
                    </div>
                  </div>

                  <div className="product-actions">
                    <button
                      className="admin-btn admin-btn-warning"
                      onClick={() => setEditProduct({ ...product })}
                    >
                      Edit
                    </button>
                    <button
                      className="admin-btn admin-btn-danger"
                      onClick={() => handleDelete(product._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div> */}
        <div className="product-list-wrapper">
          <div className="products-list">
            {products.length === 0 ? (
              <div className="empty-state">
                <p>No products found. Add your first product!</p>
              </div>
            ) : (
              products.map((product) => (
                <div key={product._id} className="product-card">

                  {/* Image */}
                  <img
                    src={product.displayImage}
                    alt={product.name}
                    className="product-image"
                  />

                  {/* Name + SKU */}
                  <div className="product-name-info">
                    <div className="product-name">{product.name}</div>
                    <div className="product-sku">{generateDisplayId(product._id)}</div>
                  </div>

                  {/* Created Date */}
                  <div className="product-date">
                    {formatDate(product.createdAt)}
                  </div>

                  {/* Price */}
                  <div className="product-detail-item">
                    Rp {product.price}
                  </div>

                  {/* Status */}
                  <div>
                    <span className={`status-badge ${product.status === "READY" ? "status-ready" : "status-habis"}`}>
                      {product.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="product-actions">
                    <button
                      className="admin-btn admin-btn-warning"
                      onClick={() => setEditProduct({ ...product })}
                    >
                      Edit
                    </button>
                    <button
                      className="admin-btn admin-btn-danger"
                      onClick={() => handleDelete(product._id)}
                    >
                      Delete
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>


        {/* EDIT MODAL */}
        {editProduct && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-content">
              <h2 className="admin-modal-header">Edit Product</h2>

              <div className="space-y-4">
                <div className="admin-form-group">
                  <input
                    className="admin-input"
                    value={editProduct.name}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, name: e.target.value })
                    }
                    placeholder="Product Name"
                  />
                </div>

                <div className="admin-form-group">
                  <input
                    type="number"
                    className="admin-input"
                    value={editProduct.price}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, price: e.target.value })
                    }
                    placeholder="Price"
                  />
                </div>

                <div className="admin-form-group">
                  <textarea
                    className="admin-textarea"
                    value={editProduct.description}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        description: e.target.value,
                      })
                    }
                    placeholder="Description"
                  />
                </div>

                {/* DISPLAY IMAGE */}
                <div className="admin-section">
                  <h3>Display Image</h3>
                  <input
                    className="admin-input admin-mb-2"
                    value={editProduct.displayImage}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        displayImage: e.target.value,
                      })
                    }
                    placeholder="Display Image URL"
                  />

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleEditFileUpload(file, "display");
                    }}
                    className="admin-input"
                    disabled={uploading}
                  />

                  {editProduct.displayImage && (
                    <div className="admin-mt-2">
                      <img
                        src={editProduct.displayImage}
                        className="admin-image-preview"
                        alt="Display preview"
                      />
                    </div>
                  )}
                </div>

                {/* STATUS */}
                <div className="admin-form-group">
                  <select
                    className="admin-select"
                    value={editProduct.status}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, status: e.target.value })
                    }
                  >
                    <option value="READY">READY</option>
                    <option value="HABIS">HABIS</option>
                  </select>
                </div>
              </div>

              <div className="admin-mt-4 space-y-2">
                <button
                  onClick={saveEdit}
                  className="admin-btn admin-btn-primary admin-w-full"
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Save Changes"}
                </button>
                <button
                  onClick={() => setEditProduct(null)}
                  className="admin-btn admin-btn-secondary admin-w-full"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// // pages/admin/products.js
// import { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import AdminNavbar from "@/components/AdminNavbar";

// export default function AdminProducts() {
//   const [products, setProducts] = useState([]);
//   const [uploading, setUploading] = useState(false);

//   // FORM STATE
//   const [form, setForm] = useState({
//     name: "",
//     price: "",
//     description: "",
//     displayImage: "",
//     galleryImages: [],
//     status: "READY",
//     colors: [],
//   });

//   const [colorInput, setColorInput] = useState({ colorName: "", image: "" });
//   const [galleryInput, setGalleryInput] = useState("");

//   // EDIT MODAL STATE
//   const [editProduct, setEditProduct] = useState(null);

//   // AUTO SCROLL KE MODAL
//   const editSectionRef = useRef(null);

//   const fetchProducts = async () => {
//     const res = await axios.get("/api/products");
//     setProducts(res.data);
//   };

//   useEffect(() => {
//     fetchProducts();

//     const savedForm = localStorage.getItem("adminProductForm");
//     if (savedForm) setForm(JSON.parse(savedForm));
//   }, []);

//   useEffect(() => {
//     localStorage.setItem("adminProductForm", JSON.stringify(form));
//   }, [form]);

//   useEffect(() => {
//     if (editProduct && editSectionRef.current) {
//       editSectionRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [editProduct]);

//   // LOGOUT HANDLER
//   const handleLogout = async () => {
//     await fetch("/api/admin/logout", { method: "POST" });
//     window.location.href = "/login";
//   };

//   // FILE UPLOAD HANDLER
//   const handleFileUpload = async (file, type = "display") => {
//     setUploading(true);
//     try {
//       const formData = new FormData();
//       formData.append("file", file);

//       const response = await axios.post("/api/upload", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       const url = response.data.url;

//       if (type === "display") {
//         setForm({ ...form, displayImage: url });
//       } else if (type === "gallery") {
//         setForm({
//           ...form,
//           galleryImages: [...form.galleryImages, url],
//         });
//         setGalleryInput("");
//       } else if (type === "color") {
//         setColorInput({ ...colorInput, image: url });
//       }

//       return url;
//     } catch {
//       alert("Upload gagal");
//       return null;
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleEditFileUpload = async (file, type = "display", index = null) => {
//     setUploading(true);
//     try {
//       const formData = new FormData();
//       formData.append("file", file);

//       const response = await axios.post("/api/upload", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       const url = response.data.url;

//       if (type === "display") {
//         setEditProduct({ ...editProduct, displayImage: url });
//       } else if (type === "gallery") {
//         const updatedGallery = [...editProduct.galleryImages];
//         if (index !== null) updatedGallery[index] = url;
//         else updatedGallery.push(url);
//         setEditProduct({ ...editProduct, galleryImages: updatedGallery });
//       } else if (type === "color" && index !== null) {
//         const updatedColors = [...editProduct.colors];
//         updatedColors[index].image = url;
//         setEditProduct({ ...editProduct, colors: updatedColors });
//       }

//       return url;
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   const addColor = () => {
//     if (!colorInput.colorName) return alert("Nama warna wajib!");
//     setForm({
//       ...form,
//       colors: [...form.colors, colorInput],
//     });
//     setColorInput({ colorName: "", image: "" });
//   };

//   const removeColor = (i) =>
//     setForm({
//       ...form,
//       colors: form.colors.filter((_, idx) => idx !== i),
//     });

//   const addGalleryImage = async () => {
//     if (!galleryInput) return alert("URL wajib!");

//     if (galleryInput instanceof File) {
//       await handleFileUpload(galleryInput, "gallery");
//     } else {
//       setForm({
//         ...form,
//         galleryImages: [...form.galleryImages, galleryInput],
//       });
//       setGalleryInput("");
//     }
//   };

//   const removeGalleryImage = (i) =>
//     setForm({
//       ...form,
//       galleryImages: form.galleryImages.filter((_, idx) => idx !== i),
//     });

//   const clearForm = () => {
//     setForm({
//       name: "",
//       price: "",
//       description: "",
//       displayImage: "",
//       galleryImages: [],
//       status: "READY",
//       colors: [],
//     });
//     setColorInput({ colorName: "", image: "" });
//     setGalleryInput("");
//     localStorage.removeItem("adminProductForm");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post("/api/products", form);
//       alert("Produk ditambahkan");
//       fetchProducts();
//       clearForm();
//     } catch {
//       alert("Error saving product");
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!confirm("Hapus produk ini?")) return;

//     try {
//       await axios.delete("/api/products", { data: { id } });
//       alert("Product deleted");
//       fetchProducts();
//     } catch {
//       alert("Error deleting");
//     }
//   };

//   const saveEdit = async () => {
//     try {
//       await axios.put("/api/products", {
//         id: editProduct._id,
//         ...editProduct,
//       });
//       alert("Product updated");
//       setEditProduct(null);
//       fetchProducts();
//     } catch {
//       alert("Error updating");
//     }
//   };

//   return (
//     <>
//       {/* NAVBAR */}
//       <AdminNavbar onLogout={handleLogout} />

//       {/* MAIN WRAPPER */}
//       <div
//         className="p-6 max-w-5xl mx-auto"
//         style={{ paddingTop: "130px" }} // supaya tidak ketutup navbar
//       >
//         <h1 className="text-2xl font-bold mb-4">🛍️ Admin Products</h1>

//         {/* ========================================================
//             ADD PRODUCT FORM
//         ========================================================= */}
//         <form
//           onSubmit={handleSubmit}
//           className="space-y-3 mb-6 border p-4 rounded"
//         >
//           <h2 className="font-semibold text-lg">Add New Product</h2>

//           <input
//             name="name"
//             value={form.name}
//             onChange={handleChange}
//             placeholder="Product Name"
//             className="border p-2 w-full rounded"
//             required
//           />

//           <input
//             name="price"
//             type="number"
//             value={form.price}
//             onChange={handleChange}
//             placeholder="Price"
//             className="border p-2 w-full rounded"
//             required
//           />

//           <textarea
//             name="description"
//             value={form.description}
//             onChange={handleChange}
//             placeholder="Description"
//             className="border p-2 w-full rounded"
//           />

//           {/* DISPLAY IMAGE */}
//           <div className="border p-3 rounded">
//             <h3 className="font-semibold mb-2">Display Image</h3>

//             <input
//               name="displayImage"
//               value={form.displayImage}
//               onChange={handleChange}
//               placeholder="Or enter image URL"
//               className="border p-2 w-full rounded mb-2"
//             />

//             <input
//               type="file"
//               accept="image/*"
//               onChange={(e) => {
//                 const file = e.target.files[0];
//                 if (file) handleFileUpload(file, "display");
//               }}
//               className="border p-2 w-full rounded"
//               disabled={uploading}
//             />

//             {form.displayImage && (
//               <div className="mt-2">
//                 <img
//                   src={form.displayImage}
//                   className="object-cover rounded border mt-1"
//                   style={{ width: "32px", height: "32px" }}
//                 />
//               </div>
//             )}
//           </div>

//           {/* GALLERY */}
//           <div className="border p-3 rounded">
//             <h3 className="font-semibold mb-2">Gallery Images</h3>

//             <div className="flex gap-2 mb-2">
//               <input
//                 value={galleryInput}
//                 onChange={(e) => setGalleryInput(e.target.value)}
//                 placeholder="Image URL"
//                 className="border p-2 flex-1 rounded"
//               />
//               <button
//                 type="button"
//                 onClick={addGalleryImage}
//                 className="bg-green-600 text-white px-3 rounded"
//                 disabled={uploading}
//               >
//                 Add URL
//               </button>
//             </div>

//             <input
//               type="file"
//               accept="image/*"
//               onChange={(e) => {
//                 const file = e.target.files[0];
//                 if (file) {
//                   setGalleryInput(file);
//                   addGalleryImage();
//                 }
//               }}
//               className="border p-2 w-full rounded mb-2"
//               disabled={uploading}
//             />

//             <div className="grid grid-cols-3 gap-2 mt-2">
//               {form.galleryImages.map((img, i) => (
//                 <div key={i} className="relative border rounded">
//                   <img
//                     src={img}
//                     className="h-20 w-full object-cover rounded"
//                     style={{ width: "32px", height: "32px" }}
//                   />

//                   <button
//                     type="button"
//                     onClick={() => removeGalleryImage(i)}
//                     className="absolute top-0 right-0 bg-red-600 text-white w-6 h-6 rounded-full"
//                   >
//                     ×
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* STATUS */}
//           <select
//             name="status"
//             value={form.status}
//             onChange={handleChange}
//             className="border p-2 w-full rounded"
//           >
//             <option value="READY">READY</option>
//             <option value="HABIS">HABIS</option>
//           </select>

//           {/* COLORS */}
//           <div className="border p-3 rounded">
//             <h3 className="font-semibold mb-2">Color Variants</h3>

//             <div className="space-y-2 mb-2">
//               <input
//                 value={colorInput.colorName}
//                 onChange={(e) =>
//                   setColorInput({ ...colorInput, colorName: e.target.value })
//                 }
//                 placeholder="Color Name"
//                 className="border p-2 w-full rounded"
//               />

//               <input
//                 value={colorInput.image}
//                 onChange={(e) =>
//                   setColorInput({ ...colorInput, image: e.target.value })
//                 }
//                 placeholder="Or enter color image URL"
//                 className="border p-2 w-full rounded"
//               />

//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => {
//                   const file = e.target.files[0];
//                   if (file) handleFileUpload(file, "color");
//                 }}
//                 className="border p-2 w-full rounded"
//                 disabled={uploading}
//               />

//               {colorInput.image && (
//                 <div className="mt-2">
//                   <img
//                     src={colorInput.image}
//                     className="h-16 w-16 object-cover rounded border"
//                     style={{ width: "32px", height: "32px" }}
//                   />
//                 </div>
//               )}
//             </div>

//             <button
//               type="button"
//               onClick={addColor}
//               className="bg-green-600 text-white px-3 py-2 rounded w-full"
//             >
//               Add Color Variant
//             </button>

//             <div className="mt-2 space-y-2">
//               {form.colors.map((c, i) => (
//                 <div
//                   key={i}
//                   className="flex justify-between items-center border p-2 rounded"
//                 >
//                   <div className="flex items-center gap-2">
//                     {c.image && (
//                       <img
//                         src={c.image}
//                         className="h-8 w-8 object-cover rounded"
//                         style={{ width: "32px", height: "32px" }}
//                       />
//                     )}
//                     <span>{c.colorName}</span>
//                   </div>

//                   <button
//                     type="button"
//                     onClick={() => removeColor(i)}
//                     className="text-red-600"
//                   >
//                     ×
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <button
//             type="submit"
//             className="bg-blue-600 text-white px-4 py-2 rounded w-full"
//             disabled={uploading}
//           >
//             {uploading ? "Uploading..." : "Add Product"}
//           </button>
//         </form>

//         {/* ========================================================
//             TABLE PRODUCT LIST
//         ========================================================= */}
//         <table className="w-full border text-sm">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="border px-3 py-2">Img</th>
//               <th className="border px-3 py-2">Name</th>
//               <th className="border px-3 py-2">Price</th>
//               <th className="border px-3 py-2">Status</th>
//               <th className="border px-3 py-2">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {products.map((p) => (
//               <tr key={p._id}>
//                 <td className="border p-2 text-center">
//                   {p.displayImage ? (
//                     <img
//                       src={p.displayImage}
//                       className="object-cover mx-auto rounded"
//                       style={{ width: "24px", height: "24px" }}
//                     />
//                   ) : (
//                     "-"
//                   )}
//                 </td>

//                 <td className="border px-3 py-2">{p.name}</td>
//                 <td className="border px-3 py-2">Rp {p.price}</td>
//                 <td className="border px-3 py-2">{p.status}</td>

//                 <td className="border px-3 py-2 space-x-2">
//                   <button
//                     className="bg-yellow-400 px-2 py-1 rounded"
//                     onClick={() => setEditProduct({ ...p })}
//                   >
//                     Edit
//                   </button>

//                   <button
//                     className="bg-red-500 text-white px-2 py-1 rounded"
//                     onClick={() => handleDelete(p._id)}
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {/* ========================================================
//              EDIT MODAL
//         ========================================================= */}
//         {editProduct && (
//           <div
//             ref={editSectionRef}
//             className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
//           >
//             <div className="bg-white p-6 rounded w-full max-w-lg max-h-[90vh] overflow-auto">
//               <h2 className="text-xl font-bold mb-4">Edit Product</h2>

//               {/* NAME */}
//               <input
//                 className="border p-2 w-full mb-2 rounded"
//                 value={editProduct.name}
//                 onChange={(e) =>
//                   setEditProduct({ ...editProduct, name: e.target.value })
//                 }
//                 placeholder="Product Name"
//               />

//               {/* PRICE */}
//               <input
//                 type="number"
//                 className="border p-2 w-full mb-2 rounded"
//                 value={editProduct.price}
//                 onChange={(e) =>
//                   setEditProduct({ ...editProduct, price: e.target.value })
//                 }
//                 placeholder="Price"
//               />

//               {/* DESCRIPTION */}
//               <textarea
//                 className="border p-2 w-full mb-2 rounded"
//                 value={editProduct.description}
//                 onChange={(e) =>
//                   setEditProduct({
//                     ...editProduct,
//                     description: e.target.value,
//                   })
//                 }
//                 placeholder="Description"
//               />

//               {/* DISPLAY IMAGE */}
//               <div className="border p-3 rounded mb-2">
//                 <h3 className="font-semibold mb-2">Display Image</h3>

//                 <input
//                   className="border p-2 w-full rounded mb-2"
//                   value={editProduct.displayImage}
//                   onChange={(e) =>
//                     setEditProduct({
//                       ...editProduct,
//                       displayImage: e.target.value,
//                     })
//                   }
//                   placeholder="Display Image URL"
//                 />

//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) => {
//                     const file = e.target.files[0];
//                     if (file) handleEditFileUpload(file, "display");
//                   }}
//                   className="border p-2 w-full rounded"
//                   disabled={uploading}
//                 />

//                 {editProduct.displayImage && (
//                   <div className="mt-2">
//                     <img
//                       src={editProduct.displayImage}
//                       className="h-20 object-cover rounded"
//                       style={{ width: "32px", height: "32px" }}
//                     />
//                   </div>
//                 )}
//               </div>

//               {/* GALLERY */}
//               <h3 className="font-semibold mt-3">Gallery Images</h3>

//               <div className="flex gap-2 mb-2">
//                 <input
//                   className="border p-2 w-full rounded"
//                   placeholder="New Image URL"
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") {
//                       e.preventDefault();
//                       if (!e.target.value) return;
//                       setEditProduct({
//                         ...editProduct,
//                         galleryImages: [
//                           ...editProduct.galleryImages,
//                           e.target.value,
//                         ],
//                       });
//                       e.target.value = "";
//                     }
//                   }}
//                 />
//               </div>

//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => {
//                   const file = e.target.files[0];
//                   if (file) handleEditFileUpload(file, "gallery");
//                 }}
//                 className="border p-2 w-full rounded mb-2"
//                 disabled={uploading}
//               />

//               <div className="flex flex-wrap gap-3 mb-4">
//                 {editProduct.galleryImages.map((img, i) => (
//                   <div
//                     key={i}
//                     className="relative border p-2 rounded w-28 text-center"
//                   >
//                     {img && (
//                       <img
//                         src={img}
//                         className="w-24 h-24 object-cover rounded mx-auto mb-1"
//                         style={{ width: "32px", height: "32px" }}
//                       />
//                     )}

//                     <input
//                       type="text"
//                       value={img}
//                       onChange={(e) => {
//                         const updated = [...editProduct.galleryImages];
//                         updated[i] = e.target.value;
//                         setEditProduct({
//                           ...editProduct,
//                           galleryImages: updated,
//                         });
//                       }}
//                       className="border rounded w-full p-1 text-xs"
//                       placeholder="Image URL"
//                     />

//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) => {
//                         const file = e.target.files[0];
//                         if (file) handleEditFileUpload(file, "gallery", i);
//                       }}
//                       className="border rounded w-full p-1 text-xs mt-1"
//                       disabled={uploading}
//                     />

//                     <button
//                       type="button"
//                       onClick={() =>
//                         setEditProduct({
//                           ...editProduct,
//                           galleryImages: editProduct.galleryImages.filter(
//                             (_, idx) => idx !== i
//                           ),
//                         })
//                       }
//                       className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1"
//                     >
//                       x
//                     </button>
//                   </div>
//                 ))}
//               </div>

//               {/* COLORS */}
//               <h3 className="font-semibold mt-2">Colors</h3>

//               <div className="flex gap-2 mb-2">
//                 <input
//                   placeholder="Color Name"
//                   className="border p-2 w-full rounded"
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") {
//                       e.preventDefault();
//                       const name = e.target.value.trim();
//                       if (!name) return;
//                       setEditProduct({
//                         ...editProduct,
//                         colors: [...editProduct.colors, { colorName: name, image: "" }],
//                       });
//                       e.target.value = "";
//                     }
//                   }}
//                 />
//               </div>

//               <div className="flex flex-wrap gap-2">
//                 {editProduct.colors.map((c, i) => (
//                   <div
//                     key={i}
//                     className="border p-2 rounded text-center relative w-32"
//                   >
//                     <img
//                       src={c.image || "/no-image.png"}
//                       className="object-cover rounded mx-auto mb-1 bg-gray-200"
//                       style={{ width: "32px", height: "32px" }}
//                     />

//                     <input
//                       className="border p-1 w-full text-xs rounded mb-1"
//                       value={c.colorName}
//                       onChange={(e) => {
//                         const updated = [...editProduct.colors];
//                         updated[i].colorName = e.target.value;
//                         setEditProduct({ ...editProduct, colors: updated });
//                       }}
//                       placeholder="Color Name"
//                     />

//                     <input
//                       className="border p-1 w-full text-xs rounded mb-1"
//                       value={c.image}
//                       placeholder="Image URL"
//                       onChange={(e) => {
//                         const updated = [...editProduct.colors];
//                         updated[i].image = e.target.value;
//                         setEditProduct({ ...editProduct, colors: updated });
//                       }}
//                     />

//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) => {
//                         const file = e.target.files[0];
//                         if (file) handleEditFileUpload(file, "color", i);
//                       }}
//                       className="border rounded w-full p-1 text-xs"
//                       disabled={uploading}
//                     />

//                     <button
//                       onClick={() =>
//                         setEditProduct({
//                           ...editProduct,
//                           colors: editProduct.colors.filter(
//                             (_, idx) => idx !== i
//                           ),
//                         })
//                       }
//                       className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1"
//                     >
//                       x
//                     </button>
//                   </div>
//                 ))}
//               </div>

//               <button
//                 onClick={saveEdit}
//                 className="mt-4 bg-blue-600 text-white w-full py-2 rounded"
//                 disabled={uploading}
//               >
//                 {uploading ? "Uploading..." : "Save Changes"}
//               </button>

//               <button
//                 onClick={() => setEditProduct(null)}
//                 className="mt-2 bg-gray-700 text-white w-full py-2 rounded"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }
