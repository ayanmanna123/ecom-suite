export interface HeroCardItem {
  id: string;
  title: string;
  images: { url: string; label: string }[];
  footerLink: string;
  footerLabel: string;
  type: "grid" | "single";
}

export const heroCardsData: HeroCardItem[] = [
  {
    id: "1",
    title: "Deals related to items you've saved",
    type: "grid",
    images: [
      { url: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=300&q=80", label: "Refurbished" },
      { url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&q=80", label: "Leather Bags" },
      { url: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=300&q=80", label: "Home Decor" },
      { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80", label: "Smart Gadgets" },
    ],
    footerLink: "/products",
    footerLabel: "See more deals",
  },
  {
    id: "2",
    title: "Upgrade your tech & office",
    type: "grid",
    images: [
      { url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&q=80", label: "Laptops" },
      { url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&q=80", label: "Tablets" },
      { url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&q=80", label: "Monitors" },
      { url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&q=80", label: "Accessories" },
    ],
    footerLink: "/products?category=Electronics",
    footerLabel: "Shop all tech",
  },
  {
    id: "3",
    title: "Smart Home Essentials",
    type: "grid",
    images: [
      { url: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=300&q=80", label: "Smart Speakers" },
      { url: "https://images.unsplash.com/photo-1557344269-3ad939989f66?w=300&q=80", label: "Webcams" },
      { url: "https://images.unsplash.com/photo-1558002038-1055907df827?w=300&q=80", label: "Smart Lighting" },
      { url: "https://images.unsplash.com/photo-1563770660941-20978e870813?w=300&q=80", label: "Cameras" },
    ],
    footerLink: "/products?category=Electronics",
    footerLabel: "See all smart home",
  },
  {
    id: "4",
    title: "Up to 75% off | Headphones",
    type: "single",
    images: [
      { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80", label: "" },
    ],
    footerLink: "/products?category=Electronics",
    footerLabel: "Shop Now",
  },
];
