import { Link } from "react-router-dom";
import { HeroCardItem } from "@/data/heroCards";

interface HeroCardProps {
  card: HeroCardItem;
}

const HeroCard = ({ card }: HeroCardProps) => {
  return (
    <div className="bg-white p-5 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 leading-tight">
        {card.title}
      </h3>

      <div className="flex-grow">
        {card.type === "grid" ? (
          <div className="grid grid-cols-2 gap-4">
            {card.images.map((img, index) => (
              <Link key={index} to={card.footerLink} className="group">
                <div className="aspect-square bg-gray-100 overflow-hidden mb-1">
                  <img
                    src={img.url}
                    alt={img.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="text-xs text-gray-700 font-medium group-hover:text-primary transition-colors">
                  {img.label}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <Link to={card.footerLink} className="block h-full group">
            <div className="aspect-[4/3] bg-gray-100 overflow-hidden mb-4">
              <img
                src={card.images[0].url}
                alt={card.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
        )}
      </div>

      <div className="mt-4">
        <Link
          to={card.footerLink}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-all"
        >
          {card.footerLabel}
        </Link>
      </div>
    </div>
  );
};

export default HeroCard;
