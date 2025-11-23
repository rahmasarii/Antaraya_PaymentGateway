// pages/admin/products.js
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import AdminNavbar from "@/components/AdminNavbar";
import AdminFooter from "@/components/Footer";
import styles from "@/styles/AdminProducts.module.css";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Modal tambah produk
  const [showAddModal, setShowAddModal] = useState(false);

  // Delete confirmation modal pop up
  const [deleteId, setDeleteId] = useState(null);


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
  const [editColorInput, setEditColorInput] = useState({ colorName: "", image: "" });


  // REF → untuk auto scroll ke edit modal
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

  // AUTO SCROLL KE EDIT MODAL
  useEffect(() => {
    if (editProduct && editSectionRef.current) {
      editSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [editProduct]);

  // LOGOUT HANDLER (seperti versi lama)
  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/login";
  };

  // FILE UPLOAD HANDLER (ADD FORM)
  const handleFileUpload = async (file, type = "display") => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const imageUrl = response.data.url;

      if (type === "display") {
        setForm({ ...form, displayImage: imageUrl });
      } else if (type === "gallery") {
        setForm({
          ...form,
          galleryImages: [...form.galleryImages, imageUrl],
        });
        setGalleryInput("");
      } else if (type === "color") {
        setColorInput({ ...colorInput, image: imageUrl });
      }

      return imageUrl;
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  };

  // FILE UPLOAD HANDLER (EDIT MODAL)
  const handleEditFileUpload = async (file, type = "display", index = null) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
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
      console.error("Upload failed:", error);
      alert("Upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ADD COLOR (ADD FORM)
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

  // ADD GALLERY (ADD FORM) – URL atau File
  const addGalleryImage = async (file) => {
    if (!file) return alert("Gambar belum dimasukkan!");

    // upload langsung
    await handleFileUpload(file, "gallery");
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

  // SUBMIT ADD PRODUCT
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/products", form);
      alert("Produk ditambahkan");
      fetchProducts();
      clearForm();
      setShowAddModal(false);
    } catch {
      alert("Error saving product");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus produk ini?")) return;
    try {
      await axios.delete("/api/products", {
        data: { id },
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
    <>
      <AdminNavbar onLogout={handleLogout} />

      <div className={styles.productsPage}>
        {/* HEADER: Title + tombol Add */}
        <div className={styles.headerRow}>
          <h1 className={styles.productsTitle}>Admin Products</h1>
          <button
            type="button"
            className={`${styles["action-btn"]} ${styles["action-edit"]} ${styles.addButton}`}
            onClick={() => setShowAddModal(true)}
            disabled={uploading}
          >
            + Add New Product
          </button>
        </div>

        {/* TABLE PRODUCT LIST */}
        <div className={styles["table-wrapper"]}>
          <table className={styles["products-table"]}>
            <thead>
              <tr>
                <th>Img</th>
                <th>Name</th>
                <th>Price</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    {p.displayImage ? (
                      <img
                        src={p.displayImage}
                        className={styles["product-img"]}
                        alt={p.name}
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{p.name}</td>
                  <td>Rp {p.price}</td>
                  <td>{p.status}</td>
                  <td>
                    <button
                      type="button"
                      className={`${styles["action-btn"]} ${styles["action-edit"]}`}
                      onClick={() => setEditProduct({ ...p })}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={`${styles["action-btn"]} ${styles["action-delete"]}`}
                      onClick={() => setDeleteId(p._id)}
                      style={{ marginLeft: "6px" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ADD PRODUCT MODAL */}
        {showAddModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalBox}>
              <h2 className={styles.modalTitle}>Add New Product</h2>

              <form onSubmit={handleSubmit}>
                {/* NAME */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Product Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={styles.formInput}
                    required
                  />
                </div>

                {/* PRICE */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Price</label>
                  <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    className={styles.formInput}
                    required
                  />
                </div>

                {/* DESCRIPTION */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className={styles.formTextarea}
                  />
                </div>

                {/* DISPLAY IMAGE */}
                <div className={styles.sectionBox}>
                  <h3 className={styles.sectionTitle}>Display Image</h3>
                  <input
                    name="displayImage"
                    value={form.displayImage}
                    onChange={handleChange}
                    placeholder="Enter image URL"
                    className={styles.formInput}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleFileUpload(file, "display");
                    }}
                    className={styles.formInput}
                    disabled={uploading}
                  />
                </div>

                {/* GALLERY IMAGES */}
                <div className={styles.sectionBox}>
                  <h3 className={styles.sectionTitle}>Gallery Images</h3>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      value={galleryInput}
                      onChange={(e) => setGalleryInput(e.target.value)}
                      placeholder="Image URL"
                      className={styles.formInput}
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
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) addGalleryImage(file);
                    }}
                    className={styles.formInput}
                    disabled={uploading}
                  />
                  {/* PREVIEW GALLERY */}
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                    {form.galleryImages.map((img, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <img
                          src={img}
                          style={{
                            width: "38px",
                            height: "38px",
                            objectFit: "cover",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(i)}
                          style={{
                            position: "absolute",
                            top: "-6px",
                            right: "-6px",
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            background: "red",
                            color: "white",
                            border: "none",
                            fontSize: "10px",
                            cursor: "pointer",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* STATUS */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={styles.formSelect}
                  >
                    <option value="READY">READY</option>
                    <option value="HABIS">HABIS</option>
                  </select>
                </div>

                {/* COLORS */}
                <div className={styles.sectionBox}>
                  <h3 className={styles.sectionTitle}>Color Variants</h3>
                  <input
                    value={colorInput.colorName}
                    onChange={(e) =>
                      setColorInput({ ...colorInput, colorName: e.target.value })
                    }
                    placeholder="Color Name"
                    className={styles.formInput}
                  />
                  <input
                    value={colorInput.image}
                    onChange={(e) =>
                      setColorInput({ ...colorInput, image: e.target.value })
                    }
                    placeholder="Color Image URL"
                    className={styles.formInput}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleFileUpload(file, "color");
                    }}
                    className={styles.formInput}
                    disabled={uploading}
                  />
                  <button
                    type="button"
                    onClick={addColor}
                    className={styles.modalBtnPrimary}
                    disabled={uploading}
                  >
                    Add Color Variant
                  </button>

                  {/* PREVIEW COLOR LIST */}
                  <div style={{ marginTop: "8px" }}>
                    {form.colors.map((c, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          border: "1px solid #ddd",
                          padding: "8px",
                          borderRadius: "6px",
                          marginBottom: "6px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {c.image && (
                            <img
                              src={c.image}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "4px",
                                objectFit: "cover",
                              }}
                            />
                          )}
                          <span>{c.colorName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeColor(i)}
                          style={{
                            color: "red",
                            border: "none",
                            background: "transparent",
                            fontSize: "16px",
                            cursor: "pointer",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.modalBtnPrimary}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Add Product"}
                </button>
              </form>


              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className={styles.modalClose}
                disabled={uploading}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* EDIT MODAL*/}
        {editProduct && (
          <div className={styles.modalOverlay}>
            <div ref={editSectionRef} className={styles.modalBox}>
              <h2 className={styles.modalTitle}>Edit Product</h2>

              {/* NAME */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Product Name</label>
                <input
                  value={editProduct.name}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, name: e.target.value })
                  }
                  className={styles.formInput}
                />
              </div>

              {/* PRICE */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Price</label>
                <input
                  type="number"
                  value={editProduct.price}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, price: e.target.value })
                  }
                  className={styles.formInput}
                />
              </div>

              {/* DESCRIPTION */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <textarea
                  value={editProduct.description}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      description: e.target.value,
                    })
                  }
                  className={styles.formTextarea}
                />
              </div>

              {/* DISPLAY IMAGE */}
              <div className={styles.sectionBox}>
                <h3 className={styles.sectionTitle}>Display Image</h3>
                <input
                  value={editProduct.displayImage}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      displayImage: e.target.value,
                    })
                  }
                  className={styles.formInput}
                  placeholder="Image URL"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleEditFileUpload(file, "display");
                  }}
                  className={styles.formInput}
                  disabled={uploading}
                />
                {editProduct.displayImage && (
                  <img
                    src={editProduct.displayImage}
                    style={{
                      width: "38px",
                      height: "38px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      marginTop: "6px",
                    }}
                  />
                )}
              </div>

              {/* GALLERY */}
              <div className={styles.sectionBox}>
                <h3 className={styles.sectionTitle}>Gallery Images</h3>

                {/* Add URL */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  <input
                    placeholder="New Image URL"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (!e.target.value) return;
                        setEditProduct({
                          ...editProduct,
                          galleryImages: [...editProduct.galleryImages, e.target.value],
                        });
                        e.target.value = "";
                      }
                    }}
                    className={styles.formInput}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const input = e.target.previousElementSibling;
                      if (!input.value) return;
                      setEditProduct({
                        ...editProduct,
                        galleryImages: [...editProduct.galleryImages, input.value],
                      });
                      input.value = "";
                    }}
                    className={styles.modalBtnPrimary}
                  >
                    Add URL
                  </button>
                </div>

                {/* Upload new file */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleEditFileUpload(file, "gallery");
                  }}
                  className={styles.formInput}
                  disabled={uploading}
                />

                {/* PREVIEW + EDIT EACH GALLERY */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                  {editProduct.galleryImages.map((img, i) => (
                    <div key={i} style={{ position: "relative", width: "82px", textAlign: "center" }}>
                      {img && (
                        <img
                          src={img}
                          style={{
                            width: "38px",
                            height: "38px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            margin: "0 auto 6px",
                          }}
                        />
                      )}
                      <input
                        value={img}
                        onChange={(e) => {
                          const updated = [...editProduct.galleryImages];
                          updated[i] = e.target.value;
                          setEditProduct({ ...editProduct, galleryImages: updated });
                        }}
                        className={styles.formInput}
                        placeholder="Image URL"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleEditFileUpload(file, "gallery", i);
                        }}
                        className={styles.formInput}
                        disabled={uploading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setEditProduct({
                            ...editProduct,
                            galleryImages: editProduct.galleryImages.filter((_, idx) => idx !== i),
                          })
                        }
                        style={{
                          position: "absolute",
                          top: "-6px",
                          right: "-6px",
                          width: "18px",
                          height: "18px",
                          background: "red",
                          color: "white",
                          borderRadius: "50%",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "10px",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* STATUS */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Status</label>
                <select
                  value={editProduct.status}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, status: e.target.value })
                  }
                  className={styles.formSelect}
                >
                  <option value="READY">READY</option>
                  <option value="HABIS">HABIS</option>
                </select>
              </div>

              {/* COLORS */}
              <div className={styles.sectionBox}>
                <h3 className={styles.sectionTitle}>Color Variants</h3>

                {/* Add new color */}
                <input
                  placeholder="Color Name"
                  className={styles.formInput}
                  id="colorNameInput"
                />
                <input
                  placeholder="Color Image URL"
                  className={styles.formInput}
                  id="colorImageInput"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleEditFileUpload(file, "colorTemp").then((url) => {
                        if (url) setEditColorInput({ ...editColorInput, image: url });
                      });
                    }
                  }}
                  className={styles.formInput}
                  disabled={uploading}
                />
                {editColorInput.image && (
                  <img
                    src={editColorInput.image}
                    style={{
                      width: "38px",
                      height: "38px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      marginTop: "6px",
                    }}
                  />
                )}

                <button
                  type="button"
                  onClick={() => {
                    const name = document.getElementById("colorNameInput").value.trim();
                    if (!name) return alert("Color name required!");
                    setEditProduct({
                      ...editProduct,
                      colors: [
                        ...editProduct.colors,
                        { colorName: name, image: editColorInput.image },
                      ],
                    });
                    setEditColorInput({ colorName: "", image: "" });
                  }}
                  className={styles.modalBtnPrimary}
                >
                  Add Color Variant
                </button>

                {/* Color list */}
                <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {editProduct.colors.map((c, i) => (
                    <div key={i} style={{ width: "88px", border: "1px solid #ccc", borderRadius: "6px", padding: "6px", position: "relative", textAlign: "center" }}>
                      <img
                        src={c.image || "/no-image.png"}
                        style={{
                          width: "38px",
                          height: "38px",
                          objectFit: "cover",
                          borderRadius: "5px",
                          marginBottom: "4px",
                        }}
                      />
                      <input
                        className={styles.formInput}
                        value={c.colorName}
                        onChange={(e) => {
                          const updated = [...editProduct.colors];
                          updated[i].colorName = e.target.value;
                          setEditProduct({ ...editProduct, colors: updated });
                        }}
                        placeholder="Color Name"
                      />
                      <input
                        className={styles.formInput}
                        value={c.image}
                        placeholder="Image URL"
                        onChange={(e) => {
                          const updated = [...editProduct.colors];
                          updated[i].image = e.target.value;
                          setEditProduct({ ...editProduct, colors: updated });
                        }}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleEditFileUpload(file, "color", i);
                        }}
                        className={styles.formInput}
                        disabled={uploading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setEditProduct({
                            ...editProduct,
                            colors: editProduct.colors.filter((_, idx) => idx !== i),
                          })
                        }
                        style={{
                          position: "absolute",
                          top: "-6px",
                          right: "-6px",
                          width: "18px",
                          height: "18px",
                          background: "red",
                          color: "white",
                          borderRadius: "50%",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "10px",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SAVE BUTTON */}
              <button
                type="button"
                onClick={saveEdit}
                className={styles.modalBtnPrimary}
                disabled={uploading}
              >
                {uploading ? "Saving..." : "Save Changes"}
              </button>

              {/* CLOSE */}
              <button
                type="button"
                onClick={() => setEditProduct(null)}
                className={styles.modalClose}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/*DELET MODAL*/}
        {deleteId && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalBox}>
              <h2 className={styles.modalTitle} style={{ textAlign: "center" }}>
                Hapus Produk
              </h2>

              <p className={styles.deleteConfirmText}>
                Anda yakin ingin menghapus produk?
              </p>

              <button
                type="button"
                className={styles.deleteBtn}
                onClick={async () => {
                  try {
                    await axios.delete("/api/products", { data: { id: deleteId } });
                    fetchProducts();
                    setDeleteId(null);
                  } catch (err) {
                    alert("Gagal menghapus produk");
                  }
                }}
              >
                Ya, hapus produk
              </button>

              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setDeleteId(null)}
              >
                Batal
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
