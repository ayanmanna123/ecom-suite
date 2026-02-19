import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: String, // String because existing frontend uses string IDs
        required: true
    },
    title: String,
    quantity: {
        type: Number,
        required: true
    },
    priceAtPurchase: {
        type: Number,
        required: true
    },
    image: String
});

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    shippingAddress: {
        fullName: String,
        email: String,
        address: String,
        city: String,
        state: String,
        zip: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
