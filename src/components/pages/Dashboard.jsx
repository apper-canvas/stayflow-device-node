import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import StatCard from "@/components/molecules/StatCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import reservationService from "@/services/api/reservationService";
import roomService from "@/services/api/roomService";
import guestService from "@/services/api/guestService";
import { format } from "date-fns";

const Dashboard = () => {
  const [data, setData] = useState({
    reservations: [],
rooms: [],
    guests: [],
    todayReservations: [],
    stats: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [reservations, rooms, guests] = await Promise.all([
        reservationService.getAll(),
        roomService.getAll(),
        guestService.getAll()
      ]);

      const today = new Date().toDateString();
      const todayReservations = reservations.filter(reservation => {
        const checkInDate = new Date(reservation.checkIn).toDateString();
        return checkInDate === today;
      });

// Calculate occupancy rate and room statistics
      const occupiedRooms = rooms.filter(room => room.status === "Occupied").length;
      const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;
      const outOfOrderRooms = rooms.filter(room => room.status === "Out of Order").length;
      const dirtyRooms = rooms.filter(room => room.status === "Dirty").length;

      // Calculate revenue for current month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = reservations
        .filter(r => {
          const date = new Date(r.checkIn);
          return date.getMonth() === currentMonth && 
                 date.getFullYear() === currentYear &&
                 r.status !== "Cancelled";
        })
        .reduce((sum, r) => sum + r.totalAmount, 0);

      const stats = {
        totalRooms: rooms.length,
        occupiedRooms,
        occupancyRate,
        todayArrivals: todayReservations.length,
        monthlyRevenue,
        pendingReservations: reservations.filter(r => r.status === "Pending").length
      };

      setData({
        reservations,
        rooms,
        guests,
        todayReservations,
        stats
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCheckIn = async (reservation) => {
    try {
      await reservationService.update(reservation.Id, {
        ...reservation,
        status: "Checked In"
      });
      
// Update room status to occupied
      await roomService.update(reservation.roomId, {
        status: "Occupied"
      });

      toast.success(`Guest ${reservation.guestName} checked in successfully!`);
      loadDashboardData();
    } catch (error) {
      toast.error("Failed to check in guest");
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message="Dashboard Error" description={error} onRetry={loadDashboardData} />;

  const { stats, todayReservations, rooms } = data;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-2">
          Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"}!
        </h1>
        <p className="text-primary-100">
          Here's what's happening at your hotel today - {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Occupancy Rate"
          value={`${stats.occupancyRate}%`}
          icon="BarChart3"
          color="primary"
          trend={stats.occupancyRate > 75 ? "up" : "down"}
          trendValue={`${stats.occupiedRooms}/${stats.totalRooms} rooms`}
        />
        
        <StatCard
          title="Today's Arrivals"
          value={stats.todayArrivals}
          icon="Users"
          color="success"
        />
        
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          icon="DollarSign"
          color="warning"
          trend="up"
          trendValue="This month"
        />
        
        <StatCard
          title="Pending Reservations"
          value={stats.pendingReservations}
          icon="Clock"
          color="info"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Arrivals */}
        <div className="bg-white rounded-lg shadow-card">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <ApperIcon name="Calendar" size={20} className="mr-2 text-primary-500" />
                Today's Arrivals
              </h2>
              <Badge variant="info">{todayReservations.length} guests</Badge>
            </div>
          </div>
          <div className="p-6">
            {todayReservations.length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="Calendar" size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No arrivals scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayReservations.slice(0, 5).map((reservation) => (
                  <div key={reservation.Id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{reservation.guestName}</p>
                      <p className="text-sm text-gray-600">Room {reservation.roomNumber}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(reservation.checkIn), "h:mm a")} - 
                        {format(new Date(reservation.checkOut), "MMM d")}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        reservation.status === "Confirmed" ? "confirmed" : 
                        reservation.status === "Checked In" ? "checkedin" : "pending"
                      }>
                        {reservation.status}
                      </Badge>
                      {reservation.status === "Confirmed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickCheckIn(reservation)}
                        >
                          Check In
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Room Status Overview */}
        <div className="bg-white rounded-lg shadow-card">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ApperIcon name="BedDouble" size={20} className="mr-2 text-primary-500" />
              Room Status Overview
            </h2>
          </div>
          <div className="p-6">
<div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { status: "Available", count: rooms.filter(r => r.status === "Available").length, color: "available" },
                { status: "Occupied", count: rooms.filter(r => r.status === "Occupied").length, color: "occupied" },
                { status: "Cleaning", count: rooms.filter(r => r.status === "Cleaning").length, color: "cleaning" },
                { status: "Dirty", count: rooms.filter(r => r.status === "Dirty").length, color: "dirty" },
                { status: "Maintenance", count: rooms.filter(r => r.status === "Maintenance").length, color: "maintenance" },
                { status: "Out of Order", count: rooms.filter(r => r.status === "Out of Order").length, color: "outoforder" }
              ].map((item) => (
                <div key={item.status} className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-900 mb-1">{item.count}</p>
                  <Badge variant={item.color} size="sm">{item.status}</Badge>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              {rooms
                .filter(room => ["Dirty", "Out of Order", "Maintenance"].includes(room.status))
                .slice(0, 4)
                .map((room) => (
                <div key={room.Id} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 mr-3">Room {room.number}</span>
                    <span className="text-sm text-gray-600">{room.type}</span>
                  </div>
                  <Badge variant={room.status.toLowerCase().replace(' ', '')}>{room.status}</Badge>
                </div>
              ))}
              {rooms.filter(room => ["Dirty", "Out of Order", "Maintenance"].includes(room.status)).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">All rooms in good condition</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ApperIcon name="Zap" size={20} className="mr-2 text-primary-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            className="btn-gradient h-16 flex-col justify-center"
            onClick={() => window.location.href = "/reservations"}
          >
            <ApperIcon name="Plus" size={20} className="mb-1" />
            New Reservation
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 flex-col justify-center"
            onClick={() => window.location.href = "/guests"}
          >
            <ApperIcon name="UserPlus" size={20} className="mb-1" />
            Add Guest
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 flex-col justify-center"
onClick={() => window.location.href = "/rooms"}
          >
            <ApperIcon name="Settings" size={20} className="mb-1" />
            Manage Rooms
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 flex-col justify-center"
            onClick={() => window.location.href = "/reports"}
          >
            <ApperIcon name="FileText" size={20} className="mb-1" />
            View Reports
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;