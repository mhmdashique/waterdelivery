import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  quantity: Number,
  price: Number,
});

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  items: [OrderItemSchema],
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  instructions: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Delivered'],
    default: 'Pending',
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Unpaid'],
    default: 'Unpaid',
  },
  paymentMethod: {
    type: String,
    enum: ['Online', 'Cash on Delivery'],
    default: 'Cash on Delivery',
  },
  total: {
    type: Number,
    required: true,
  },
  cansReturned: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
