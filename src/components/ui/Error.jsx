import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Error = ({ 
  message = "Something went wrong", 
  description = "We encountered an error while loading this content. Please try again.",
  onRetry,
  className = "" 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] text-center p-8 ${className}`}>
      <div className="bg-gradient-to-br from-error-500 to-error-600 rounded-full p-4 mb-6 shadow-lg">
        <ApperIcon name="AlertTriangle" size={32} className="text-white" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {message}
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-md leading-relaxed">
        {description}
      </p>
      
      {onRetry && (
        <Button 
          onClick={onRetry}
          className="btn-gradient text-white px-6 py-2.5 rounded-lg font-medium hover:shadow-hover transition-all duration-200"
        >
          <ApperIcon name="RefreshCw" size={16} className="mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default Error;