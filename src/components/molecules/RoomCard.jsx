import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";

const RoomCard = ({ 
  room, 
  onStatusChange, 
  onViewDetails,
  className = "" 
}) => {
  const getStatusColor = (status) => {
switch (status?.toLowerCase()) {
      case "available":
        return "available";
      case "occupied":
        return "occupied";
      case "cleaning":
        return "cleaning";
      case "dirty":
        return "dirty";
      case "maintenance":
        return "maintenance";
      case "out of order":
        return "outoforder";
      default:
        return "default";
    }
  };

const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "CheckCircle";
      case "occupied":
        return "User";
      case "cleaning":
        return "Sparkles";
      case "dirty":
        return "AlertTriangle";
      case "maintenance":
        return "Wrench";
      case "out of order":
        return "XCircle";
      default:
        return "Circle";
    }
  };

const formatLastCleaned = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getStatusPriority = (status) => {
    switch (status?.toLowerCase()) {
      case "out of order": return "high";
      case "dirty": return "medium";
      case "maintenance": return "medium";
      case "cleaning": return "low";
      default: return "normal";
    }
  };

const priorityColor = getStatusPriority(room.status);
  const borderClass = priorityColor === "high" ? "border-l-4 border-l-red-500" : 
                     priorityColor === "medium" ? "border-l-4 border-l-yellow-500" : "";

  return (
    <div className={`bg-white rounded-lg shadow-card p-4 card-hover ${borderClass} ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-gray-900">Room {room.number}</h3>
          <Badge variant={getStatusColor(room.status)}>
            {room.status}
          </Badge>
        </div>
        <ApperIcon name={getStatusIcon(room.status)} size={20} className="text-gray-400" />
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Type:</span> {room.type}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Rate:</span> ${room.rate}/night
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Last Cleaned:</span> {formatLastCleaned(room.lastCleaned)}
        </p>
{(() => {
          // Normalize amenities to array format for safe processing
          const amenitiesArray = Array.isArray(room.amenities) 
            ? room.amenities 
            : typeof room.amenities === 'string' 
              ? room.amenities.split(',').map(item => item.trim()).filter(item => item.length > 0)
              : [];
          
          return amenitiesArray.length > 0 && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Amenities:</span> {amenitiesArray.slice(0, 2).join(", ")}
              {amenitiesArray.length > 2 && ` +${amenitiesArray.length - 2} more`}
            </p>
          );
        })()}
        {room.notes && (
          <p className="text-xs text-gray-500 italic">
            <span className="font-medium">Notes:</span> {room.notes}
          </p>
        )}
      </div>

      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onViewDetails?.(room)}
          className="flex-1"
        >
          <ApperIcon name="Eye" size={14} className="mr-1" />
          View
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onStatusChange?.(room)}
          className="flex-1"
        >
          <ApperIcon name="Edit" size={14} className="mr-1" />
          Update
        </Button>
      </div>
    </div>
  );
};

export default RoomCard;