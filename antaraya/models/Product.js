import mongoose from 'mongoose';

const ColorVariantSchema = new mongoose.Schema({
  colorName: String,
  image: String, // URL gambar per warna
});

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,

    // FOTO DISPLAY UTAMA
    displayImage: String,
    galleryImages: [String],

    // LIST WARNA (boleh kosong)
    colors: [ColorVariantSchema],

    // STOCK STATUS
    status: {
      type: String,
      enum: ["READY", "HABIS"],
      default: "READY",
    },

    // stock: Number,
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
