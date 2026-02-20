import heroImage from "@/assets/hero-image.jpg";
import { Link } from "react-router-dom";
import HeroCard from "./HeroCard";
import { heroCardsData } from "@/data/heroCards";

const HeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-[#E3E6E6]">
      {/* Background Hero Image */}
      <div className="relative w-full h-[60vh] min-h-[400px]">
        <img
          src={heroImage}
          alt="Curated lifestyle collection"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#E3E6E6]" />
        
        <div className="relative h-full container mx-auto px-4 lg:px-8 flex items-center pb-24 md:pb-32">
          <div className="max-w-lg space-y-6">
            <p className="text-foreground/80 text-sm font-medium tracking-widest uppercase">
              New Collection
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground leading-tight">
              Crafted for
              <br />
              <em className="italic font-normal">everyday</em> beauty
            </h1>
            <p className="text-foreground/70 text-base max-w-sm leading-relaxed">
              Thoughtfully designed pieces that blend timeless craft with modern sensibility.
            </p>
          </div>
        </div>
      </div>

      {/* Hero Cards Grid */}
      <div className="container mx-auto px-4 lg:px-8 -mt-24 md:-mt-32 lg:-mt-48 relative z-10 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {heroCardsData.map((card) => (
            <HeroCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
