import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { name: "Reservations", href: "/reservations", icon: "Calendar" },
    { name: "Guests", href: "/guests", icon: "Users" },
    { name: "Rooms", href: "/rooms", icon: "BedDouble" },
    { name: "Billing", href: "/billing", icon: "CreditCard" },
    { name: "Reports", href: "/reports", icon: "BarChart3" }
  ];

  const NavItem = ({ item, mobile = false }) => (
    <NavLink
      to={item.href}
      onClick={mobile ? onClose : undefined}
      className={({ isActive }) =>
        `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`
      }
    >
      <ApperIcon name={item.icon} size={18} className="mr-3" />
      {item.name}
    </NavLink>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
        <div className="flex flex-col h-screen bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 mb-8">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-2 shadow-lg">
                <ApperIcon name="Hotel" size={24} className="text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">StayFlow</h1>
                <p className="text-sm text-gray-600">Hotel Management</p>
              </div>
            </div>
            <nav className="flex-1 px-4 space-y-2">
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-2 shadow-lg">
                    <ApperIcon name="Hotel" size={20} className="text-white" />
                  </div>
                  <div className="ml-3">
                    <h1 className="text-lg font-bold text-gray-900">StayFlow</h1>
                    <p className="text-xs text-gray-600">Hotel Management</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <ApperIcon name="X" size={18} className="text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <nav className="space-y-2">
                  {navigation.map((item) => (
                    <NavItem key={item.name} item={item} mobile />
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;