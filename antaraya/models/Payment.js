import mongoose from 'mongoose';
const PaymentSchema = new mongoose.Schema({
  orderId: String,
  transactionId: String,
  payment_type: String,
  transaction_status: String,
  gross_amount: Number,
  raw: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
