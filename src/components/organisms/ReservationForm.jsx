import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import guestService from "@/services/api/guestService";
import roomService from "@/services/api/roomService";
import reservationService from "@/services/api/reservationService";

const ReservationForm = ({ reservation, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    guestId: "",
    roomId: "",
    checkIn: "",
    checkOut: "",
    specialRequests: "",
    guestFirstName: "",
    guestLastName: "",
    guestEmail: "",
    guestPhone: ""
  });

  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadInitialData();
    if (reservation) {
      setFormData({
        guestId: reservation.guestId || "",
        roomId: reservation.roomId || "",
        checkIn: reservation.checkIn ? reservation.checkIn.split("T")[0] : "",
        checkOut: reservation.checkOut ? reservation.checkOut.split("T")[0] : "",
        specialRequests: reservation.specialRequests || "",
        guestFirstName: "",
        guestLastName: "",
        guestEmail: "",
        guestPhone: ""
      });
    }
  }, [reservation]);

  const loadInitialData = async () => {
    try {
      const [guestsData, roomsData] = await Promise.all([
        guestService.getAll(),
        roomService.getAll()
      ]);
      setGuests(guestsData);
      setRooms(roomsData);
      setAvailableRooms(roomsData.filter(room => room.status === "Available"));
    } catch (error) {
      toast.error("Failed to load form data");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.guestId && !formData.guestFirstName) {
      newErrors.guest = "Please select an existing guest or enter guest details";
    }
    
    if (!formData.guestId) {
      if (!formData.guestFirstName) newErrors.guestFirstName = "First name is required";
      if (!formData.guestLastName) newErrors.guestLastName = "Last name is required";
      if (!formData.guestEmail) newErrors.guestEmail = "Email is required";
      if (!formData.guestPhone) newErrors.guestPhone = "Phone is required";
    }
    
    if (!formData.roomId) newErrors.roomId = "Room selection is required";
    if (!formData.checkIn) newErrors.checkIn = "Check-in date is required";
    if (!formData.checkOut) newErrors.checkOut = "Check-out date is required";
    
    if (formData.checkIn && formData.checkOut) {
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      
      if (checkOutDate <= checkInDate) {
        newErrors.checkOut = "Check-out date must be after check-in date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotal = () => {
    if (formData.roomId && formData.checkIn && formData.checkOut) {
      const room = rooms.find(r => r.Id === parseInt(formData.roomId));
      if (room) {
        const checkIn = new Date(formData.checkIn);
        const checkOut = new Date(formData.checkOut);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        return nights * room.rate;
      }
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      let guestId = formData.guestId;
      
      // Create new guest if not selected
      if (!guestId) {
const newGuest = {
          firstName: formData.guestFirstName,
          lastName: formData.guestLastName,
          email: formData.guestEmail,
          phone: formData.guestPhone,
          idType: formData.guestIdType || "",
          idNumber: formData.guestIdNumber || "",
          address: {
            street: "",
            city: "",
            state: "",
            zipCode: ""
          },
          preferences: [],
          stayHistory: []
        };
        
        const createdGuest = await guestService.create(newGuest);
        guestId = createdGuest.Id;
      }
      
      const reservationData = {
        guestId: guestId,
        roomId: parseInt(formData.roomId),
        checkIn: new Date(formData.checkIn).toISOString(),
        checkOut: new Date(formData.checkOut).toISOString(),
        status: reservation ? reservation.status : "Confirmed",
        totalAmount: calculateTotal(),
        specialRequests: formData.specialRequests || ""
      };
      
      let result;
      if (reservation) {
        result = await reservationService.update(reservation.Id, reservationData);
        toast.success("Reservation updated successfully!");
      } else {
        result = await reservationService.create(reservationData);
        toast.success("Reservation created successfully!");
      }
      
      onSubmit?.(result);
    } catch (error) {
      toast.error("Failed to save reservation");
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = calculateTotal();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ApperIcon name="User" size={20} className="mr-2" />
            Guest Information
          </h3>

          <FormField
            label="Existing Guest"
            type="select"
            name="guestId"
            value={formData.guestId}
            onChange={handleChange}
            error={errors.guest}
          >
            <option value="">Select existing guest or enter new guest details</option>
            {guests.map(guest => (
              <option key={guest.Id} value={guest.Id}>
                {guest.firstName} {guest.lastName} - {guest.email}
              </option>
            ))}
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="First Name"
              name="guestFirstName"
              value={formData.guestFirstName}
              onChange={handleChange}
              error={errors.guestFirstName}
              disabled={!!formData.guestId}
              placeholder="Enter first name"
            />

            <FormField
              label="Last Name"
              name="guestLastName"
              value={formData.guestLastName}
              onChange={handleChange}
              error={errors.guestLastName}
              disabled={!!formData.guestId}
              placeholder="Enter last name"
            />
          </div>

          <FormField
            label="Email"
            type="email"
            name="guestEmail"
            value={formData.guestEmail}
            onChange={handleChange}
            error={errors.guestEmail}
            disabled={!!formData.guestId}
            placeholder="Enter email address"
          />

          <FormField
            label="Phone"
            name="guestPhone"
            value={formData.guestPhone}
            onChange={handleChange}
            error={errors.guestPhone}
            disabled={!!formData.guestId}
            placeholder="Enter phone number"
/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="ID Type"
            name="guestIdType"
            value={formData.guestIdType}
            onChange={handleChange}
            placeholder="e.g. Passport, Driver's License"
          />
          <FormField
            label="ID Number"
            name="guestIdNumber"
            value={formData.guestIdNumber}
            onChange={handleChange}
            placeholder="Enter ID number"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ApperIcon name="Calendar" size={20} className="mr-2" />
            Reservation Details
          </h3>

          <FormField
            label="Room"
            type="select"
            name="roomId"
            value={formData.roomId}
            onChange={handleChange}
            error={errors.roomId}
            required
          >
            <option value="">Select a room</option>
            {availableRooms.map(room => (
              <option key={room.Id} value={room.Id}>
                Room {room.number} - {room.type} (${room.rate}/night)
              </option>
            ))}
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Check-in Date"
              type="date"
              name="checkIn"
              value={formData.checkIn}
              onChange={handleChange}
              error={errors.checkIn}
              required
              min={new Date().toISOString().split("T")[0]}
            />

            <FormField
              label="Check-out Date"
              type="date"
              name="checkOut"
              value={formData.checkOut}
              onChange={handleChange}
              error={errors.checkOut}
              required
              min={formData.checkIn || new Date().toISOString().split("T")[0]}
            />
          </div>

          <FormField
            label="Special Requests"
            type="textarea"
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            placeholder="Any special requests or notes..."
            rows={3}
          />

          {totalAmount > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Total Amount:</span>
                <span className="text-xl font-bold text-primary-600">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="btn-gradient"
        >
          {loading && <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />}
          {reservation ? "Update Reservation" : "Create Reservation"}
        </Button>
      </div>
    </form>
  );
};

export default ReservationForm;