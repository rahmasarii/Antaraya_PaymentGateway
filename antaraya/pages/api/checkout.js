// pages/api/create-transaction.js
import dbConnect from '../../lib/db';
import Checkout from '../../models/Checkout';
import { snap } from '../../lib/midtrans';
export default async function handler(req,res){
  await dbConnect();
  if (req.method !== 'POST') return res.status(405).end();
  const { checkoutId } = req.body;
  const checkout = await Checkout.findById(checkoutId);
  if (!checkout) return res.status(404).json({error:'not found'});
  const transactionObj = {
    transaction_details: { order_id: checkout.orderId, gross_amount: checkout.total },
    customer_details: {
      first_name: checkout.customer.firstName,
      last_name: checkout.customer.lastName,
      phone: checkout.customer.phone,
      address: checkout.customer.address
    },
    item_details: checkout.items.map(i=>({
      id: i.product.toString(),
      price: i.price,
      quantity: i.qty,
      name: i.name,
    }))
  };
  try {
    const response = await snap.createTransaction(transactionObj); // returns token & redirect_url
    // response.token, response.redirect_url
    return res.json(response);
  } catch(e){
    console.error(e);
    return res.status(500).json({error: e.message});
  }
}
