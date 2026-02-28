import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true
    },
    productName: String,
    productImage: String,
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    totalPrice: {
        type: Number,
        default: 0
    },
    totalItems: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

cartSchema.pre('save', function (next) {
    this.totalItems = this.items.length;
    this.totalPrice = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    next();
});

export default mongoose.models.Cart || mongoose.model('Cart', cartSchema);
