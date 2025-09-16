import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import RoomCard from "@/components/molecules/RoomCard";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import roomService from "@/services/api/roomService";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [roomToUpdate, setRoomToUpdate] = useState(null);
  const [formData, setFormData] = useState({
    number: "",
    type: "",
    status: "Available",
    rate: "",
    amenities: "",
    notes: ""
  });
  const [formErrors, setFormErrors] = useState({});

  const roomTypes = ["Standard", "Deluxe", "Suite", "Executive Suite", "Presidential Suite"];
  const roomStatuses = ["Available", "Occupied", "Cleaning", "Maintenance"];

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [rooms, statusFilter, typeFilter]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomService.getAll();
      setRooms(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterRooms = () => {
    let filtered = [...rooms];

    if (statusFilter !== "all") {
      filtered = filtered.filter(room => room.status === statusFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(room => room.type === typeFilter);
    }

    // Sort by room number
    filtered.sort((a, b) => {
      const numA = parseInt(a.number);
      const numB = parseInt(b.number);
      return numA - numB;
    });

    setFilteredRooms(filtered);
  };

  const resetForm = () => {
    setFormData({
      number: "",
      type: "",
      status: "Available",
      rate: "",
      amenities: "",
      notes: ""
    });
    setFormErrors({});
  };

  const handleCreateRoom = () => {
    resetForm();
    setSelectedRoom(null);
    setShowForm(true);
  };

  const handleEditRoom = (room) => {
    setFormData({
      number: room.number || "",
      type: room.type || "",
      status: room.status || "Available",
      rate: room.rate ? room.rate.toString() : "",
      amenities: room.amenities ? room.amenities.join(", ") : "",
      notes: room.notes || ""
    });
    setSelectedRoom(room);
    setFormErrors({});
    setShowForm(true);
  };

  const handleStatusChange = (room) => {
    setRoomToUpdate(room);
    setShowStatusModal(true);
  };

  const handleUpdateRoomStatus = async (newStatus) => {
    if (!roomToUpdate) return;

    try {
      await roomService.update(roomToUpdate.Id, {
        ...roomToUpdate,
        status: newStatus,
        lastCleaned: newStatus === "Available" ? new Date().toISOString() : roomToUpdate.lastCleaned
      });
      
      toast.success(`Room ${roomToUpdate.number} status updated to ${newStatus}!`);
      setShowStatusModal(false);
      setRoomToUpdate(null);
      loadRooms();
    } catch (error) {
      toast.error("Failed to update room status");
    }
  };

  const handleDeleteRoom = async (room) => {
    if (window.confirm(`Are you sure you want to delete Room ${room.number}?`)) {
      try {
        await roomService.delete(room.Id);
        toast.success("Room deleted successfully!");
        loadRooms();
      } catch (error) {
        toast.error("Failed to delete room");
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.number.trim()) errors.number = "Room number is required";
    if (!formData.type) errors.type = "Room type is required";
    if (!formData.rate) errors.rate = "Room rate is required";
    else if (isNaN(formData.rate) || parseFloat(formData.rate) <= 0) errors.rate = "Rate must be a positive number";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const roomData = {
        number: formData.number.trim(),
        type: formData.type,
        status: formData.status,
        rate: parseFloat(formData.rate),
        amenities: formData.amenities ? formData.amenities.split(",").map(a => a.trim()).filter(a => a) : [],
        notes: formData.notes.trim(),
        lastCleaned: selectedRoom?.lastCleaned || new Date().toISOString()
      };

      if (selectedRoom) {
        await roomService.update(selectedRoom.Id, roomData);
        toast.success("Room updated successfully!");
      } else {
        await roomService.create(roomData);
        toast.success("Room created successfully!");
      }

      setShowForm(false);
      loadRooms();
    } catch (error) {
      toast.error("Failed to save room");
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message="Failed to load rooms" description={error} onRetry={loadRooms} />;

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedRoom ? "Edit Room" : "New Room"}
            </h1>
            <p className="text-gray-600">
              {selectedRoom ? "Update room information" : "Add a new room to the hotel"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Room Details</h3>
                
                <FormField
                  label="Room Number"
                  name="number"
                  value={formData.number}
                  onChange={handleFormChange}
                  error={formErrors.number}
                  required
                  placeholder="e.g., 101, 201A"
                />

                <FormField
                  label="Room Type"
                  type="select"
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  error={formErrors.type}
                  required
                >
                  <option value="">Select room type</option>
                  {roomTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </FormField>

                <FormField
                  label="Status"
                  type="select"
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  required
                >
                  {roomStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </FormField>

                <FormField
                  label="Nightly Rate"
                  type="number"
                  name="rate"
                  value={formData.rate}
                  onChange={handleFormChange}
                  error={formErrors.rate}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                
                <FormField
                  label="Amenities"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleFormChange}
                  placeholder="WiFi, TV, Mini Bar, etc. (comma separated)"
                />

                <FormField
                  label="Notes"
                  type="textarea"
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  placeholder="Any additional notes about the room..."
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="btn-gradient"
              >
                {selectedRoom ? "Update Room" : "Create Room"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
          <p className="text-gray-600">Manage room inventory and status</p>
        </div>
        <Button 
          onClick={handleCreateRoom}
          className="btn-gradient"
        >
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Room
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              {roomStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="sm:w-48">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Types</option>
              {roomTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div>
        {filteredRooms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-card">
            <Empty
              icon="BedDouble"
              title="No rooms found"
              description={
                statusFilter !== "all" || typeFilter !== "all"
                  ? "No rooms match your current filters. Try adjusting your filter criteria."
                  : "There are no rooms set up yet. Add your first room to get started."
              }
              actionLabel={statusFilter !== "all" || typeFilter !== "all" ? undefined : "Add First Room"}
              onAction={statusFilter !== "all" || typeFilter !== "all" ? undefined : handleCreateRoom}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.Id}
                room={room}
                onStatusChange={handleStatusChange}
                onViewDetails={handleEditRoom}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && roomToUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Update Room {roomToUpdate.number} Status
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ApperIcon name="X" size={20} />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Current status: <span className="font-medium">{roomToUpdate.status}</span>
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {roomStatuses.map((status) => (
                <Button
                  key={status}
                  variant={roomToUpdate.status === status ? "primary" : "outline"}
                  onClick={() => handleUpdateRoomStatus(status)}
                  disabled={roomToUpdate.status === status}
                  className="justify-center"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;