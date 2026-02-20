import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
}

const ReviewForm = ({ productId, onReviewSubmitted }: ReviewFormProps) => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to leave a review.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    if (comment.trim().length < 5) {
      toast({
        title: "Comment too short",
        description: "Please provide a more detailed review.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          product: productId,
          rating,
          comment
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Review submitted",
          description: "Thank you for your feedback!"
        });
        setComment("");
        onReviewSubmitted();
      } else {
        throw new Error(data.msg || "Failed to submit review");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-muted/30 p-6 rounded-sm text-center">
        <p className="text-sm text-muted-foreground mb-4">Please sign in to write a review.</p>
        <Button variant="outline" className="rounded-sm" onClick={() => navigate("/auth")}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-muted/20 p-6 rounded-sm border border-border/50">
      <div className="space-y-3">
        <h3 className="font-display font-medium text-lg text-foreground">Write a Review</h3>
        <p className="text-sm text-muted-foreground">Share your experience with this product to help others.</p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rating</Label>
        <div className="flex gap-1.5 pt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                size={22}
                className={(hoverRating || rating) >= star ? "fill-star text-star" : "text-muted-foreground/20"}
              />
            </button>
          ))}
          <span className="ml-2 text-sm font-medium text-muted-foreground self-center">
            {rating} of 5
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Comment
        </Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          placeholder="What did you like or dislike? How was the quality?"
          className="min-h-[120px] bg-background border-border/60 focus:border-primary/50 transition-colors resize-none"
        />
      </div>

      <Button 
        type="submit" 
        disabled={submitting} 
        className="w-full rounded-sm h-11 text-sm font-semibold tracking-wide"
      >
        {submitting ? (
          <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Submitting...</>
        ) : "Post Review"}
      </Button>
    </form>
  );
};

export default ReviewForm;
