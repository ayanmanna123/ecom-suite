import heroImage from "@/assets/hero-image.jpg";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
      <img
        src={heroImage}
        alt="Curated lifestyle collection"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/30 to-transparent" />
      <div className="relative h-full container mx-auto px-4 lg:px-8 flex items-center">
        <div className="max-w-lg space-y-6">
          <p className="text-primary-foreground/80 text-sm font-medium tracking-widest uppercase">
            New Collection
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-primary-foreground leading-tight">
            Crafted for
            <br />
            <em className="italic font-normal">everyday</em> beauty
          </h1>
          <p className="text-primary-foreground/70 text-base max-w-sm leading-relaxed">
            Thoughtfully designed pieces that blend timeless craft with modern sensibility.
          </p>
          <div className="flex gap-3 pt-2">
            <Link
              to="/products"
              className="bg-background text-foreground px-6 py-3 text-sm font-medium rounded-sm hover:bg-background/90 transition-colors"
            >
              Shop Now
            </Link>
            <Link
              to="/products?category=Clothing"
              className="border border-primary-foreground/40 text-primary-foreground px-6 py-3 text-sm font-medium rounded-sm hover:bg-primary-foreground/10 transition-colors"
            >
              Explore
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
