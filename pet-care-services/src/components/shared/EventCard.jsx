import { Calendar, MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EventCard({ event, compact = false }) {
  return (
    <div className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-300 flex flex-col h-full">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-md text-xs font-bold text-black shadow-sm">
          ${event.price}
        </div>
        <div className="absolute top-3 left-3 bg-primary/90 text-primary-foreground px-3 py-1 rounded-md text-xs font-semibold shadow-sm">
          {event.category}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center text-xs text-muted-foreground mb-3 space-x-3">
          <span className="flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1 text-primary" />
            {event.date}
          </span>
          <span className="flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-primary" />
            {event.location}
          </span>
        </div>

        <h3 className="text-lg font-bold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        {!compact && (
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
            {event.description}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
            {!compact && (
                <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white dark:border-slate-800" />
                    ))}
                    <span className="text-xs text-muted-foreground pl-3 self-center">+120 going</span>
                </div>
            )}
            <Button size={compact ? "sm" : "default"} className={`${compact ? "w-full" : ""} bg-primary hover:bg-primary/90`}>
                {compact ? "View" : "Book Now"}
            </Button>
        </div>
      </div>
    </div>
  );
}