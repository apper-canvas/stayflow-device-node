import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Empty = ({ 
  icon = "Inbox",
  title = "No data available", 
  description = "There's nothing to show here yet. Try adding some items to get started.",
  actionLabel = "Get Started",
  onAction,
  className = "" 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] text-center p-8 ${className}`}>
      <div className="bg-gradient-to-br from-accent-400 to-accent-600 rounded-full p-4 mb-6 shadow-lg">
        <ApperIcon name={icon} size={32} className="text-white" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-md leading-relaxed">
        {description}
      </p>
      
      {onAction && actionLabel && (
        <Button 
          onClick={onAction}
          className="btn-gradient text-white px-6 py-2.5 rounded-lg font-medium hover:shadow-hover transition-all duration-200"
        >
          <ApperIcon name="Plus" size={16} className="mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default Empty;