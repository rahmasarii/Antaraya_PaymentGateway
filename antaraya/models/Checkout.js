import mongoose from 'mongoose';
const CheckoutSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true }, // gunakan order_xxx
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    qty: Number,
    color: String
  }],
  customer: {
    firstName: String,
    lastName: String,
    phone: String,
    courier: String,
    address: String,
    description: String
  },
  subtotal: Number,
  shipping_fee: Number,
  total: Number,
  status: { type: String, default: 'PENDING' } // PENDING, PAID, EXPIRED, CANCELLED
}, { timestamps: true });

export default mongoose.models.Checkout || mongoose.model('Checkout', CheckoutSchema);
