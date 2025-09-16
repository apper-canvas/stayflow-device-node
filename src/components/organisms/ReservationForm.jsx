import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import guestService from "@/services/api/guestService";
import reservationService from "@/services/api/reservationService";
import roomService from "@/services/api/roomService";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";

const ReservationForm = ({ reservation, onSubmit, onCancel, bookingType = "individual" }) => {
const [formData, setFormData] = useState({
    guestId: "",
    roomId: "",
    checkIn: "",
    checkOut: "",
    specialRequests: "",
    guestFirstName: "",
    guestLastName: "",
    guestEmail: "",
    guestPhone: "",
    // Corporate account fields
    corporateAccountId: "",
    companyName: "",
    contactPerson: "",
    corporateEmail: "",
    corporatePhone: "",
    billingAddress: "",
    // Group booking fields
    groupSize: 1,
    groupRooms: [],
    groupNotes: ""
  });

const [guests, setGuests] = useState([]);
  const [corporateAccounts, setCorporateAccounts] = useState([]);
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
        guestPhone: "",
        corporateAccountId: reservation.corporateAccount?.Id || "",
        companyName: reservation.corporateAccount?.companyName || "",
        contactPerson: reservation.corporateAccount?.contactPerson || "",
        corporateEmail: reservation.corporateAccount?.email || "",
        corporatePhone: reservation.corporateAccount?.phone || "",
        billingAddress: reservation.corporateAccount?.billingAddress || "",
        groupSize: reservation.groupSize || 1,
        groupRooms: reservation.isGroupBooking ? [] : [],
        groupNotes: reservation.groupNotes || ""
      });
    }
  }, [reservation, bookingType]);

  const loadInitialData = async () => {
try {
      const [guestsData, roomsData] = await Promise.all([
        guestService.getAll(),
        roomService.getAll()
      ]);
      setGuests(guestsData);
      setRooms(roomsData);
      setAvailableRooms(roomsData.filter(room => room.status === "Available"));
      
      // Load corporate accounts from guests with corporate account type
      const corporates = guestsData.filter(guest => guest.accountType === 'corporate');
      setCorporateAccounts(corporates);
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

    // Auto-populate corporate account details
    if (name === 'corporateAccountId' && value) {
      const corporate = corporateAccounts.find(acc => acc.Id.toString() === value);
      if (corporate) {
        setFormData(prev => ({
          ...prev,
          companyName: corporate.companyName || '',
          contactPerson: `${corporate.firstName} ${corporate.lastName}`,
          corporateEmail: corporate.email,
          corporatePhone: corporate.phone,
          billingAddress: `${corporate.address?.street || ''}, ${corporate.address?.city || ''}, ${corporate.address?.state || ''} ${corporate.address?.zipCode || ''}`
        }));
      }
    }
  };

  const addGroupRoom = () => {
    setFormData(prev => ({
      ...prev,
      groupRooms: [...prev.groupRooms, {
        roomId: "",
        guestFirstName: "",
        guestLastName: "",
        specialRequests: ""
      }]
    }));
  };

  const removeGroupRoom = (index) => {
    setFormData(prev => ({
      ...prev,
      groupRooms: prev.groupRooms.filter((_, i) => i !== index)
    }));
  };

  const updateGroupRoom = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      groupRooms: prev.groupRooms.map((room, i) => 
        i === index ? { ...room, [field]: value } : room
      )
    }));
  };

  const validateForm = () => {
const newErrors = {};
    
    // Validate based on booking type
    if (bookingType === "corporate") {
      if (!formData.corporateAccountId && !formData.companyName) {
        newErrors.corporate = "Please select a corporate account or enter company details";
      }
      if (!formData.corporateAccountId) {
        if (!formData.companyName) newErrors.companyName = "Company name is required";
        if (!formData.contactPerson) newErrors.contactPerson = "Contact person is required";
        if (!formData.corporateEmail) newErrors.corporateEmail = "Corporate email is required";
      }
    } else if (bookingType === "group") {
      if (formData.groupRooms.length === 0) {
        newErrors.groupRooms = "At least one room is required for group booking";
      }
      formData.groupRooms.forEach((room, index) => {
        if (!room.roomId) newErrors[`room_${index}`] = "Room selection is required";
        if (!room.guestFirstName) newErrors[`firstName_${index}`] = "Guest name is required";
        if (!room.guestLastName) newErrors[`lastName_${index}`] = "Guest surname is required";
      });
    } else {
      // Individual booking validation
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
    }
    
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
        const subtotal = nights * room.rate;
        
        // Add basic tax calculation (10% default rate)
        const taxRate = 0.10;
        const taxAmount = subtotal * taxRate;
        
        return {
          subtotal,
          taxAmount,
          total: subtotal + taxAmount,
          nights
        };
      }
    }
    return {
      subtotal: 0,
      taxAmount: 0,
      total: 0,
      nights: 0
    };
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (bookingType === "group") {
        // Handle group booking
        const groupReservationData = {
          isGroupBooking: true,
          checkIn: new Date(formData.checkIn).toISOString(),
          checkOut: new Date(formData.checkOut).toISOString(),
          status: "Confirmed",
          groupRooms: await Promise.all(formData.groupRooms.map(async (room) => {
            let guestId = room.guestId;
            
            if (!guestId) {
              const newGuest = await guestService.create({
                firstName: room.guestFirstName,
                lastName: room.guestLastName,
                email: room.guestEmail || `${room.guestFirstName.toLowerCase()}.${room.guestLastName.toLowerCase()}@placeholder.com`,
                phone: room.guestPhone || "000-000-0000",
                address: { street: "", city: "", state: "", zipCode: "" },
                preferences: [],
                stayHistory: []
              });
              guestId = newGuest.Id;
            }
            
            return {
              guestId,
              roomId: parseInt(room.roomId),
              guestName: `${room.guestFirstName} ${room.guestLastName}`,
              roomNumber: rooms.find(r => r.Id === parseInt(room.roomId))?.number || "",
              specialRequests: room.specialRequests || "",
totalAmount: calculateRoomTotal(room.roomId).total || calculateRoomTotal(room.roomId)
            };
          })),
          specialRequests: formData.groupNotes || "",
          corporateAccount: formData.corporateAccountId ? {
            Id: parseInt(formData.corporateAccountId),
            companyName: formData.companyName,
            contactPerson: formData.contactPerson,
            email: formData.corporateEmail,
            phone: formData.corporatePhone,
            billingAddress: formData.billingAddress
          } : null
        };
        
        const result = await reservationService.create(groupReservationData);
        toast.success(`Group booking created successfully! ${result.length} reservations created.`);
        onSubmit?.(result);
        
      } else if (bookingType === "corporate") {
        // Handle corporate booking
        let corporateAccount = null;
        
        if (formData.corporateAccountId) {
          const corporate = corporateAccounts.find(acc => acc.Id.toString() === formData.corporateAccountId);
          corporateAccount = {
            Id: corporate.Id,
            companyName: corporate.companyName,
            contactPerson: `${corporate.firstName} ${corporate.lastName}`,
            email: corporate.email,
            phone: corporate.phone,
            billingAddress: `${corporate.address?.street || ''}, ${corporate.address?.city || ''}`
          };
        } else {
          // Create new corporate account
          const newCorporateGuest = await guestService.create({
            firstName: formData.contactPerson.split(' ')[0] || '',
            lastName: formData.contactPerson.split(' ').slice(1).join(' ') || '',
            email: formData.corporateEmail,
            phone: formData.corporatePhone,
            accountType: 'corporate',
            companyName: formData.companyName,
            address: { street: formData.billingAddress, city: "", state: "", zipCode: "" },
            preferences: [],
            stayHistory: []
          });
          
          corporateAccount = {
            Id: newCorporateGuest.Id,
            companyName: formData.companyName,
            contactPerson: formData.contactPerson,
            email: formData.corporateEmail,
            phone: formData.corporatePhone,
            billingAddress: formData.billingAddress
          };
        }
        
        const reservationData = {
          guestId: corporateAccount.Id,
          roomId: parseInt(formData.roomId),
          guestName: corporateAccount.contactPerson,
          roomNumber: rooms.find(r => r.Id === parseInt(formData.roomId))?.number || "",
          checkIn: new Date(formData.checkIn).toISOString(),
          checkOut: new Date(formData.checkOut).toISOString(),
          status: "Confirmed",
totalAmount: calculateTotal().total || calculateTotal(),
          specialRequests: formData.specialRequests || "",
          corporateAccount
        };
        
        let result;
        if (reservation) {
          result = await reservationService.update(reservation.Id, { 
            ...reservationData,
            modificationReason: "Corporate booking updated"
          });
          toast.success("Corporate reservation updated successfully!");
        } else {
          result = await reservationService.create(reservationData);
          toast.success("Corporate reservation created successfully!");
        }
        
        onSubmit?.(result);
        
      } else {
        // Handle individual booking
        let guestId = formData.guestId;
        
        if (!guestId) {
          const newGuest = {
            firstName: formData.guestFirstName,
            lastName: formData.guestLastName,
            email: formData.guestEmail,
            phone: formData.guestPhone,
            idType: formData.guestIdType || "",
            idNumber: formData.guestIdNumber || "",
            address: { street: "", city: "", state: "", zipCode: "" },
            preferences: [],
            stayHistory: []
          };
          
          const createdGuest = await guestService.create(newGuest);
          guestId = createdGuest.Id;
        }
        
        const reservationData = {
          guestId: guestId,
          roomId: parseInt(formData.roomId),
          guestName: formData.guestId ? 
            guests.find(g => g.Id.toString() === formData.guestId)?.firstName + ' ' + guests.find(g => g.Id.toString() === formData.guestId)?.lastName :
            `${formData.guestFirstName} ${formData.guestLastName}`,
          roomNumber: rooms.find(r => r.Id === parseInt(formData.roomId))?.number || "",
          checkIn: new Date(formData.checkIn).toISOString(),
          checkOut: new Date(formData.checkOut).toISOString(),
          status: reservation ? reservation.status : "Confirmed",
totalAmount: calculateTotal().total || calculateTotal(),
          specialRequests: formData.specialRequests || ""
        };
        
        let result;
        if (reservation) {
          result = await reservationService.update(reservation.Id, {
            ...reservationData,
            modificationReason: "Individual reservation updated"
          });
          toast.success("Reservation updated successfully!");
        } else {
          result = await reservationService.create(reservationData);
          toast.success("Reservation created successfully!");
        }
        
        onSubmit?.(result);
      }
    } catch (error) {
      console.error('Reservation submission error:', error);
      toast.error("Failed to save reservation");
    } finally {
      setLoading(false);
    }
  };

const calculateRoomTotal = (roomId) => {
    if (roomId && formData.checkIn && formData.checkOut) {
      const room = rooms.find(r => r.Id === parseInt(roomId));
      if (room) {
        const checkIn = new Date(formData.checkIn);
        const checkOut = new Date(formData.checkOut);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const subtotal = nights * room.rate;
        
        // Add basic tax calculation (10% default rate)
        const taxRate = 0.10;
        const taxAmount = subtotal * taxRate;
        
        return {
          subtotal,
          taxAmount,
          total: subtotal + taxAmount,
          nights
        };
      }
    }
    return {
      subtotal: 0,
      taxAmount: 0,
      total: 0,
      nights: 0
    };
  };

  const totalAmount = calculateTotal();

  return (
<form onSubmit={handleSubmit} className="space-y-6">
      {bookingType === "corporate" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 flex items-center mb-4">
            <ApperIcon name="Building2" size={20} className="mr-2" />
            Corporate Account Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Corporate Account"
              type="select"
              name="corporateAccountId"
              value={formData.corporateAccountId}
              onChange={handleChange}
              error={errors.corporate}
            >
              <option value="">Select corporate account or create new</option>
              {corporateAccounts.map(account => (
                <option key={account.Id} value={account.Id}>
                  {account.companyName} - {account.firstName} {account.lastName}
                </option>
              ))}
            </FormField>

            <FormField
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              error={errors.companyName}
              disabled={!!formData.corporateAccountId}
              placeholder="Enter company name"
            />

            <FormField
              label="Contact Person"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              error={errors.contactPerson}
              disabled={!!formData.corporateAccountId}
              placeholder="Enter contact person name"
            />

            <FormField
              label="Corporate Email"
              type="email"
              name="corporateEmail"
              value={formData.corporateEmail}
              onChange={handleChange}
              error={errors.corporateEmail}
              disabled={!!formData.corporateAccountId}
              placeholder="Enter corporate email"
            />

            <FormField
              label="Corporate Phone"
              name="corporatePhone"
              value={formData.corporatePhone}
              onChange={handleChange}
              disabled={!!formData.corporateAccountId}
              placeholder="Enter corporate phone"
            />

            <FormField
              label="Billing Address"
              name="billingAddress"
              value={formData.billingAddress}
              onChange={handleChange}
              disabled={!!formData.corporateAccountId}
              placeholder="Enter billing address"
            />
          </div>
        </div>
      )}

      {bookingType === "group" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-900 flex items-center">
              <ApperIcon name="Users" size={20} className="mr-2" />
              Group Booking - {formData.groupRooms.length} Room(s)
            </h3>
            <Button type="button" size="sm" onClick={addGroupRoom} variant="outline">
              <ApperIcon name="Plus" size={16} className="mr-1" />
              Add Room
            </Button>
          </div>

          <div className="space-y-4">
            {formData.groupRooms.map((room, index) => (
              <div key={index} className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Room {index + 1}</h4>
                  {formData.groupRooms.length > 1 && (
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="ghost"
                      onClick={() => removeGroupRoom(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    label="Room"
                    type="select"
                    value={room.roomId}
                    onChange={(e) => updateGroupRoom(index, 'roomId', e.target.value)}
                    error={errors[`room_${index}`]}
                    required
                  >
                    <option value="">Select room</option>
                    {availableRooms.map(availableRoom => (
                      <option key={availableRoom.Id} value={availableRoom.Id}>
                        Room {availableRoom.number} - {availableRoom.type} (${availableRoom.rate}/night)
                      </option>
                    ))}
                  </FormField>

                  <FormField
                    label="Guest First Name"
                    value={room.guestFirstName}
                    onChange={(e) => updateGroupRoom(index, 'guestFirstName', e.target.value)}
                    error={errors[`firstName_${index}`]}
                    placeholder="First name"
                  />

                  <FormField
                    label="Guest Last Name"
                    value={room.guestLastName}
                    onChange={(e) => updateGroupRoom(index, 'guestLastName', e.target.value)}
                    error={errors[`lastName_${index}`]}
                    placeholder="Last name"
                  />
                </div>

                <FormField
                  label="Special Requests"
                  type="textarea"
                  value={room.specialRequests}
                  onChange={(e) => updateGroupRoom(index, 'specialRequests', e.target.value)}
                  placeholder="Special requests for this room..."
                  rows={2}
                />
              </div>
            ))}

            {errors.groupRooms && (
              <p className="text-sm text-red-600">{errors.groupRooms}</p>
            )}

            <FormField
              label="Group Notes"
              type="textarea"
              name="groupNotes"
              value={formData.groupNotes}
              onChange={handleChange}
              placeholder="Additional notes for the group booking..."
              rows={3}
            />
          </div>
        </div>
      )}

      {bookingType === "individual" && (
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
              {guests.filter(g => g.accountType !== 'corporate').map(guest => (
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
          </div>
        </div>
      )}

      {/* Common fields for all booking types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ApperIcon name="Calendar" size={20} className="mr-2" />
            Booking Details
          </h3>

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