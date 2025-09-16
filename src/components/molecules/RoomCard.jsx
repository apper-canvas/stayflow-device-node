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
      case "maintenance":
        return "maintenance";
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
      case "maintenance":
        return "Wrench";
      default:
        return "Circle";
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-card p-4 card-hover ${className}`}>
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
        {room.amenities && room.amenities.length > 0 && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Amenities:</span> {room.amenities.slice(0, 2).join(", ")}
            {room.amenities.length > 2 && ` +${room.amenities.length - 2} more`}
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