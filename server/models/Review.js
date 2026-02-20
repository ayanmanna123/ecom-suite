import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Avoid multiple reviews from the same user on the same product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Static method to get avg rating and save to product
reviewSchema.statics.calculateAverageRating = async function (productId) {
    const stats = await this.aggregate([
        {
            $match: { product: productId }
        },
        {
            $group: {
                _id: '$product',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await mongoose.model('Product').findByIdAndUpdate(productId, {
            reviewCount: stats[0].nRating,
            rating: stats[0].avgRating.toFixed(1)
        });
    } else {
        await mongoose.model('Product').findByIdAndUpdate(productId, {
            reviewCount: 0,
            rating: 0
        });
    }
};

// Call calculateAverageRating after save
reviewSchema.post('save', async function () {
    // this points to current review
    await this.constructor.calculateAverageRating(this.product);
});

// Call calculateAverageRating after remove/delete
reviewSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await doc.constructor.calculateAverageRating(doc.product);
    }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
