import React, { useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

export default function ReviewModal({ isOpen, onClose, onSubmit, product, loading }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoveredStar, setHoveredStar] = useState(0);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ rating, comment });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-8 py-6 border-b border-neutral-100 flex justify-between items-center">
                    <h2 className="text-xl font-black text-neutral-900">Write a Review</h2>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                        <X size={20} className="text-neutral-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-8 space-y-8">

                        {/* Product Info */}
                        <div className="flex items-center gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                            <div className="w-16 h-16 bg-white rounded-xl overflow-hidden border border-neutral-100 shrink-0">
                                <img src={product?.image || product?.productImage} alt={product?.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="font-bold text-neutral-900 line-clamp-1">{product?.name}</p>
                                <p className="text-xs text-neutral-500 mt-0.5">Share your experience with this product</p>
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="text-center space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Rate this product</label>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setHoveredStar(star)}
                                        onMouseLeave={() => setHoveredStar(0)}
                                        onClick={() => setRating(star)}
                                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        <Star
                                            size={32}
                                            fill={(hoveredStar || rating) >= star ? "currentColor" : "none"}
                                            className={(hoveredStar || rating) >= star ? "text-amber-400" : "text-neutral-200"}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm font-bold text-neutral-600">
                                {rating === 5 ? "Excellent!" : rating === 4 ? "Good" : rating === 3 ? "Average" : rating === 2 ? "Poor" : "Terrible"}
                            </p>
                        </div>

                        {/* Comment */}
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-neutral-400">Your Review</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Tell us what you liked or didn't like..."
                                className="w-full h-32 p-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all text-sm font-medium resize-none"
                                required
                            />
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="px-8 py-6 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="rounded-xl">Cancel</Button>
                        <Button type="submit" disabled={loading} className="bg-neutral-900 hover:bg-black text-white rounded-xl min-w-[120px]">
                            {loading ? <Loader2 className="animate-spin" /> : "Submit Review"}
                        </Button>
                    </div>
                </form>

            </div>
        </div>
    );
}
