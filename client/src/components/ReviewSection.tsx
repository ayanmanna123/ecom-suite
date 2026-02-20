import { Star } from "lucide-react";
import { Product } from "@/data/products";

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  createdAt: string;
}

interface ReviewSectionProps {
  product: Product;
  reviews: Review[];
}

const ReviewSection = ({ product, reviews }: ReviewSectionProps) => {
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-10 pb-8 border-b border-border">
        <div>
          <h2 className="font-display text-3xl font-semibold text-foreground mb-4">Reviews</h2>
          <div className="flex items-center gap-4">
            <div className="text-5xl font-semibold text-foreground">{product.rating.toFixed(1)}</div>
            <div>
              <div className="flex items-center gap-0.5 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.floor(product.rating) ? "fill-star text-star" : "text-muted-foreground/30"}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Based on {product.reviewCount} reviews
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-xs space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = reviews.filter((r) => Math.floor(r.rating) === rating).length;
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-3 text-sm">
                <span className="w-3 text-muted-foreground">{rating}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-muted-foreground text-[10px]">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-10">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="group pb-10 border-b border-border last:border-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary uppercase">
                    {review.user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <span className="block font-medium text-sm text-foreground">
                      {review.user?.name || "Anonymous User"}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      Verified Purchase
                    </span>
                    {review.sentiment && (
                      <span className={`ml-2 text-[10px] uppercase tracking-widest font-bold ${
                        review.sentiment === 'positive' ? 'text-success' : 
                        review.sentiment === 'negative' ? 'text-destructive' : 
                        'text-muted-foreground'
                      }`}>
                        • {review.sentiment}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={i < review.rating ? "fill-star text-star" : "text-muted-foreground/30"}
                  />
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {review.comment}
              </p>
            </div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-6">
              <Star size={32} className="text-muted-foreground/30" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">No reviews yet for this product.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
