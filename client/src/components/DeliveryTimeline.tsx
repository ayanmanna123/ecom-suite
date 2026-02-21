import React from 'react';
import { CheckCircle2, Circle, Truck, PackageCheck, Package, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface StatusUpdate {
  status: string;
  timestamp: string;
  message?: string;
}

interface DeliveryTimelineProps {
  history: StatusUpdate[];
  currentStatus: string;
}

const DeliveryTimeline: React.FC<DeliveryTimelineProps> = ({ history, currentStatus }) => {
  const getIcon = (status: string, isCompleted: boolean) => {
    const iconSize = 20;
    const color = isCompleted ? "text-green-500" : "text-muted-foreground";

    switch (status.toLowerCase()) {
      case 'pending':
        return <Package size={iconSize} className={color} />;
      case 'processing':
        return <Clock size={iconSize} className={color} />;
      case 'shipped':
        return <Truck size={iconSize} className={color} />;
      case 'delivered':
        return <PackageCheck size={iconSize} className={color} />;
      case 'cancelled':
        return <Circle size={iconSize} className="text-red-500" />;
      default:
        return <Circle size={iconSize} className={color} />;
    }
  };

  const statusLabels: Record<string, string> = {
    'pending': 'Order Confirmed',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  };

  // Sort history by timestamp descending to show latest first or ascending for timeline?
  // Usually timeline is top to bottom, chronological.
  const sortedHistory = [...history].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div className="py-6 px-2">
      <div className="relative space-y-8">
        {/* Vertical Line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />

        {sortedHistory.map((update, index) => {
          const isLast = index === sortedHistory.length - 1;
          const isCompleted = true; // History items are by definition completed steps

          return (
            <div key={index} className="relative flex gap-6 items-start">
              <div className="relative z-10 flex items-center justify-center bg-background rounded-full mt-1">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isLast ? 'border-green-500 bg-green-500' : 'border-green-500 bg-green-500'
                }`}>
                    <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>

              <div className="flex-1 pb-2">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 mb-1">
                  <h4 className="text-sm font-semibold text-foreground capitalize">
                    {statusLabels[update.status.toLowerCase()] || update.status}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(update.timestamp), "eee, do MMM ''yy")}
                  </span>
                </div>
                
                {update.message && (
                    <p className="text-sm text-foreground/80 mt-1">
                        {update.message}
                    </p>
                )}
                <p className="text-[11px] text-muted-foreground mt-0.5">
                    {format(new Date(update.timestamp), "eee, do MMM ''yy - h:mm a")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeliveryTimeline;
