import { useState, useEffect } from "react";
import heroImage from "@/assets/hero-image.jpg";
import HeroCard from "./HeroCard";
import { heroCardsData } from "@/data/heroCards";

const heroContent = [
  {
    url: heroImage,
    subtitle: "New Collection",
    title: "Crafted for everyday beauty",
    description: "Thoughtfully designed pieces that blend timeless craft with modern sensibility."
  },
  {
    url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=1600",
    subtitle: "Exclusive Leather",
    title: "Hand-stitched Italian Bags",
    description: "Premium leather craftsmanship designed to last a lifetime of style."
  },
  {
    url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1600",
    subtitle: "Timeless Apparel",
    title: "Linen & Classic Silhouettes",
    description: "Effortlessly polished pieces for warm-weather styling and beyond."
  },
  {
    url: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=1600",
    subtitle: "Home & Living",
    title: "Handmade Ceramic Essentials",
    description: "Elevate your daily rituals with unique pieces glazed in warm earth tones."
  }
];

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroContent.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-[#E3E6E6]">
      {/* Background Hero Image with Sliding Animation */}
      <div className="relative w-full h-[75vh] min-h-[600px] overflow-hidden">
        {heroContent.map((item, index) => (
          <div
            key={item.url}
            className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
              index === currentIndex 
                ? "translate-x-0 z-10" 
                : index < currentIndex 
                  ? "-translate-x-full z-0" 
                  : "translate-x-full z-0"
            }`}
          >
            <img
              src={item.url}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/25" />
            
            {/* Dynamic Text Content - Positioned Higher */}
            <div className={`absolute inset-0 container mx-auto px-4 lg:px-8 flex items-start pt-24 md:pt-32 transition-all duration-700 delay-300 ${
              index === currentIndex ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}>
              <div className="max-w-lg space-y-6">
                <p className="text-white/90 text-sm font-semibold tracking-widest uppercase drop-shadow-sm">
                  {item.subtitle}
                </p>
                <h1 className="font-display text-4xl md:text-5xl lg:text-7xl font-semibold text-white leading-tight drop-shadow-md">
                  {item.title.split(' ').map((word, i) => 
                    word.toLowerCase() === 'everyday' ? (
                      <span key={i}><em className="italic font-normal">everyday</em> </span>
                    ) : (
                      word + ' '
                    )
                  )}
                </h1>
                <p className="text-white/80 text-base md:text-xl max-w-md leading-relaxed font-medium drop-shadow-sm">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-transparent via-transparent to-[#E3E6E6]/90" />
      </div>

      {/* Hero Cards Grid - Shifted Downward */}
      <div className="container mx-auto px-4 lg:px-8 -mt-16 md:-mt-24 lg:-mt-32 relative z-30 pb-20">
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
