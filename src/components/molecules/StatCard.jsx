import React from "react";
import ApperIcon from "@/components/ApperIcon";

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue,
  color = "primary",
  className = "" 
}) => {
  const colorVariants = {
    primary: "from-primary-500 to-primary-600",
    success: "from-success-500 to-success-600",
    warning: "from-warning-500 to-warning-600",
    error: "from-error-500 to-error-600",
    info: "from-info-500 to-info-600"
  };

  const iconBgColor = colorVariants[color] || colorVariants.primary;

  return (
    <div className={`bg-white rounded-lg shadow-card p-6 card-hover ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <ApperIcon 
                name={trend === "up" ? "TrendingUp" : "TrendingDown"} 
                size={16} 
                className={trend === "up" ? "text-success-500" : "text-error-500"} 
              />
              <span 
                className={`ml-1 text-sm font-medium ${
                  trend === "up" ? "text-success-500" : "text-error-500"
                }`}
              >
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`bg-gradient-to-br ${iconBgColor} rounded-lg p-3 shadow-lg`}>
          <ApperIcon name={icon} size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;