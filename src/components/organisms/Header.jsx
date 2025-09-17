import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Header = ({ onMenuClick }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <ApperIcon name="Menu" size={20} />
            </Button>
            <div className="ml-4 lg:ml-0">
              <h1 className="text-lg font-semibold text-gray-900">
                Welcome to StayFlow
              </h1>
              <p className="text-sm text-gray-600">
                Manage your hotel operations efficiently
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <ApperIcon name="Clock" size={16} />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
<div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-full p-2">
                <ApperIcon name="User" size={16} className="text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">Hotel Manager</p>
                <p className="text-xs text-gray-600">Administrator</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const { ApperUI } = window.ApperSDK;
                  ApperUI.logout();
                }}
                className="ml-3"
              >
                <ApperIcon name="LogOut" size={14} className="mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;