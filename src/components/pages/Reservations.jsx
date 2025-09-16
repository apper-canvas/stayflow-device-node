import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import SearchBar from "@/components/molecules/SearchBar";
import ReservationForm from "@/components/organisms/ReservationForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import reservationService from "@/services/api/reservationService";
import { format } from "date-fns";

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  useEffect(() => {
    loadReservations();
  }, []);

  useEffect(() => {
    filterReservations();
  }, [reservations, searchQuery, statusFilter]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reservationService.getAll();
      setReservations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    let filtered = [...reservations];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(reservation => 
        reservation.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(reservation =>
        reservation.guestName.toLowerCase().includes(query) ||
        reservation.roomNumber.toString().includes(query) ||
        reservation.Id.toString().includes(query)
      );
    }

    // Sort by check-in date
    filtered.sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn));

    setFilteredReservations(filtered);
  };

  const handleCreateReservation = () => {
    setSelectedReservation(null);
    setShowForm(true);
  };

  const handleEditReservation = (reservation) => {
    setSelectedReservation(reservation);
    setShowForm(true);
  };

  const handleDeleteReservation = async (reservation) => {
    if (window.confirm("Are you sure you want to cancel this reservation?")) {
      try {
        await reservationService.update(reservation.Id, {
          ...reservation,
          status: "Cancelled"
        });
        toast.success("Reservation cancelled successfully!");
        loadReservations();
      } catch (error) {
        toast.error("Failed to cancel reservation");
      }
    }
  };

  const handleFormSubmit = (reservation) => {
    setShowForm(false);
    setSelectedReservation(null);
    loadReservations();
  };

  const handleCheckIn = async (reservation) => {
    try {
      await reservationService.update(reservation.Id, {
        ...reservation,
        status: "Checked In"
      });
      toast.success("Guest checked in successfully!");
      loadReservations();
    } catch (error) {
      toast.error("Failed to check in guest");
    }
  };

  const handleCheckOut = async (reservation) => {
    try {
      await reservationService.update(reservation.Id, {
        ...reservation,
        status: "Checked Out"
      });
      toast.success("Guest checked out successfully!");
      loadReservations();
    } catch (error) {
      toast.error("Failed to check out guest");
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message="Failed to load reservations" description={error} onRetry={loadReservations} />;

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedReservation ? "Edit Reservation" : "New Reservation"}
            </h1>
            <p className="text-gray-600">
              {selectedReservation ? "Update reservation details" : "Create a new reservation for a guest"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <ReservationForm
            reservation={selectedReservation}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
          <p className="text-gray-600">Manage hotel reservations and bookings</p>
        </div>
        <Button 
          onClick={handleCreateReservation}
          className="btn-gradient"
        >
          <ApperIcon name="Plus" size={16} className="mr-2" />
          New Reservation
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search by guest name, room number, or reservation ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked in">Checked In</option>
              <option value="checked out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reservations List */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        {filteredReservations.length === 0 ? (
          <Empty
            icon="Calendar"
            title="No reservations found"
            description={
              searchQuery || statusFilter !== "all"
                ? "No reservations match your current filters. Try adjusting your search criteria."
                : "There are no reservations yet. Create your first reservation to get started."
            }
            actionLabel={searchQuery || statusFilter !== "all" ? undefined : "Create First Reservation"}
            onAction={searchQuery || statusFilter !== "all" ? undefined : handleCreateReservation}
          />
        ) : (
          <>
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 text-sm font-medium text-gray-700">
                <div>Guest</div>
                <div>Room</div>
                <div>Check-in</div>
                <div>Check-out</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {filteredReservations.map((reservation) => (
                <div key={reservation.Id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                    <div>
                      <p className="font-medium text-gray-900">{reservation.guestName}</p>
                      <p className="text-sm text-gray-600">ID: {reservation.Id}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900">Room {reservation.roomNumber}</p>
                      <p className="text-sm text-gray-600">{reservation.roomType}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900">
                        {format(new Date(reservation.checkIn), "MMM d, yyyy")}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(reservation.checkIn), "h:mm a")}
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900">
                        {format(new Date(reservation.checkOut), "MMM d, yyyy")}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(reservation.checkOut), "h:mm a")}
                      </p>
                    </div>
                    
                    <div>
                      <Badge 
                        variant={
                          reservation.status === "Confirmed" ? "confirmed" :
                          reservation.status === "Checked In" ? "checkedin" :
                          reservation.status === "Checked Out" ? "success" :
                          reservation.status === "Cancelled" ? "cancelled" :
                          "pending"
                        }
                      >
                        {reservation.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {reservation.status === "Confirmed" && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleCheckIn(reservation)}
                        >
                          <ApperIcon name="LogIn" size={14} className="mr-1" />
                          Check In
                        </Button>
                      )}
                      
                      {reservation.status === "Checked In" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCheckOut(reservation)}
                        >
                          <ApperIcon name="LogOut" size={14} className="mr-1" />
                          Check Out
                        </Button>
                      )}
                      
                      {reservation.status !== "Cancelled" && reservation.status !== "Checked Out" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditReservation(reservation)}
                          >
                            <ApperIcon name="Edit" size={14} />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteReservation(reservation)}
                            className="text-error-600 hover:text-error-700 hover:bg-error-50"
                          >
                            <ApperIcon name="Trash2" size={14} />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reservations;