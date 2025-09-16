import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import guestService from "@/services/api/guestService";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";

const Guests = () => {
  const [guests, setGuests] = useState([]);
  const [filteredGuests, setFilteredGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    idType: "",
    idNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: ""
    },
    preferences: [],
    vipStatus: false,
    loyaltyProgram: {
      tier: "",
      points: 0,
      joinDate: ""
    }
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadGuests();
  }, []);

  useEffect(() => {
    filterGuests();
  }, [guests, searchQuery]);

  const loadGuests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await guestService.getAll();
      setGuests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterGuests = () => {
    let filtered = [...guests];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(guest =>
        `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(query) ||
        guest.email.toLowerCase().includes(query) ||
        guest.phone.includes(query)
      );
    }

    // Sort by last name, then first name
    filtered.sort((a, b) => {
      const nameA = `${a.lastName} ${a.firstName}`.toLowerCase();
      const nameB = `${b.lastName} ${b.firstName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    setFilteredGuests(filtered);
  };

  const resetForm = () => {
setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      idType: "",
      idNumber: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: ""
      },
      preferences: [],
      vipStatus: false,
      loyaltyProgram: {
        tier: "",
        points: 0,
        joinDate: ""
      }
    });
    setFormErrors({});
  };

  const handleCreateGuest = () => {
    resetForm();
    setSelectedGuest(null);
    setShowForm(true);
  };

  const handleEditGuest = (guest) => {
    setFormData({
firstName: guest.firstName || "",
      lastName: guest.lastName || "",
      email: guest.email || "",
      phone: guest.phone || "",
      idType: guest.idType || "",
      idNumber: guest.idNumber || "",
      address: {
        street: guest.address?.street || "",
        city: guest.address?.city || "",
        state: guest.address?.state || "",
        zipCode: guest.address?.zipCode || ""
      },
      preferences: guest.preferences || [],
      vipStatus: guest.vipStatus || false,
      loyaltyProgram: {
        tier: guest.loyaltyProgram?.tier || "",
        points: guest.loyaltyProgram?.points || 0,
        joinDate: guest.loyaltyProgram?.joinDate || ""
      }
    });
    setSelectedGuest(guest);
    setFormErrors({});
    setShowForm(true);
  };

  const handleDeleteGuest = async (guest) => {
    if (window.confirm(`Are you sure you want to delete ${guest.firstName} ${guest.lastName}?`)) {
      try {
        await guestService.delete(guest.Id);
        toast.success("Guest deleted successfully!");
        loadGuests();
      } catch (error) {
        toast.error("Failed to delete guest");
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (name === "vipStatus") {
      setFormData(prev => ({ ...prev, [name]: value === "true" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };
  const validateForm = () => {
    const errors = {};
if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid";
    if (!formData.phone.trim()) errors.phone = "Phone is required";
    if (!formData.idType.trim()) errors.idType = "ID type is required";
    if (!formData.idNumber.trim()) errors.idNumber = "ID number is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
const guestData = {
        ...formData,
        stayHistory: selectedGuest?.stayHistory || [],
        createdAt: selectedGuest?.createdAt || new Date().toISOString(),
        loyaltyProgram: {
          ...formData.loyaltyProgram,
          joinDate: formData.loyaltyProgram.joinDate || new Date().toISOString().split('T')[0]
        }
      };

      if (selectedGuest) {
        await guestService.update(selectedGuest.Id, guestData);
        toast.success("Guest updated successfully!");
      } else {
        await guestService.create(guestData);
        toast.success("Guest created successfully!");
      }

      setShowForm(false);
      loadGuests();
    } catch (error) {
      toast.error("Failed to save guest");
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message="Failed to load guests" description={error} onRetry={loadGuests} />;

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedGuest ? "Edit Guest" : "New Guest"}
            </h1>
            <p className="text-gray-600">
              {selectedGuest ? "Update guest information" : "Add a new guest to the system"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleFormChange}
                    error={formErrors.firstName}
                    required
                  />
                  <FormField
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleFormChange}
                    error={formErrors.lastName}
                    required
                  />
                </div>

                <FormField
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  error={formErrors.email}
                  required
                />

                <FormField
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
error={formErrors.phone}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="ID Type"
                  name="idType"
                  value={formData.idType}
                  onChange={handleFormChange}
                  placeholder="e.g. Passport, Driver's License"
                  error={formErrors.idType}
                  required
                />
                <FormField
                  label="ID Number"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleFormChange}
                  placeholder="Enter ID number"
                  error={formErrors.idNumber}
                  required
                />
              </div>

<div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Address</h3>
                
                <FormField
                  label="Street Address"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleFormChange}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="City"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleFormChange}
                  />
                  <FormField
                    label="State"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleFormChange}
                  />
                </div>

                <FormField
                  label="ZIP Code"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleFormChange}
                />
              </div>
              
              {/* VIP Status Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">VIP Status</h3>
                
                <FormField
                  label="VIP Status"
                  name="vipStatus"
                  type="select"
                  value={formData.vipStatus.toString()}
                  onChange={handleFormChange}
                >
                  <option value="false">Regular Guest</option>
                  <option value="true">VIP Guest</option>
                </FormField>
              </div>

              {/* Loyalty Program Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Loyalty Program</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Loyalty Tier"
                    name="loyaltyProgram.tier"
                    type="select"
                    value={formData.loyaltyProgram.tier}
                    onChange={handleFormChange}
                  >
                    <option value="">No Program</option>
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </FormField>
                  
                  <FormField
                    label="Loyalty Points"
                    name="loyaltyProgram.points"
                    type="number"
                    value={formData.loyaltyProgram.points}
                    onChange={handleFormChange}
                    min="0"
                  />
                </div>

                <FormField
                  label="Program Join Date"
                  name="loyaltyProgram.joinDate"
                  type="date"
                  value={formData.loyaltyProgram.joinDate}
                  onChange={handleFormChange}
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
                {selectedGuest ? "Update Guest" : "Create Guest"}
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
          <h1 className="text-2xl font-bold text-gray-900">Guests</h1>
          <p className="text-gray-600">Manage guest information and profiles</p>
        </div>
        <Button 
          onClick={handleCreateGuest}
          className="btn-gradient"
        >
          <ApperIcon name="UserPlus" size={16} className="mr-2" />
          Add Guest
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <SearchBar
          placeholder="Search by name, email, or phone number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Guests List */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        {filteredGuests.length === 0 ? (
          <Empty
            icon="Users"
            title="No guests found"
            description={
              searchQuery
                ? "No guests match your search criteria. Try adjusting your search terms."
                : "There are no guests registered yet. Add your first guest to get started."
            }
            actionLabel={searchQuery ? undefined : "Add First Guest"}
            onAction={searchQuery ? undefined : handleCreateGuest}
          />
        ) : (
          <>
            {/* Table Header */}
<div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
<div className="grid grid-cols-1 md:grid-cols-7 gap-4 text-sm font-medium text-gray-700">
                <div>Name</div>
                <div>Email</div>
                <div>Phone</div>
                <div>ID Info</div>
                <div>Location</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
            </div>

            {/* Table Body */}
{/* Table Body */}
            <div className="divide-y divide-gray-200">
              {filteredGuests.map((guest) => (
                <div key={guest.Id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                    <div>
                      <p className="font-medium text-gray-900">
                        {guest.firstName} {guest.lastName}
                        {guest.vipStatus && (
                          <span className="ml-2">
                            <ApperIcon name="Star" size={16} className="inline text-yellow-500" />
                          </span>
                        )}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-900">{guest.email}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-900">{guest.phone}</p>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium">{guest.idType}</div>
                      <div className="text-xs text-gray-500">{guest.idNumber}</div>
                    </div>
                    
                    <div>
                      <p className="text-gray-900">
                        {guest.address?.city && guest.address?.state 
                          ? `${guest.address.city}, ${guest.address.state}`
                          : "Not provided"
                        }
                      </p>
                    </div>
                    
                    <div className="flex flex-col space-y-1">
                      {guest.vipStatus && (
                        <Badge variant="vip" size="sm">
                          VIP Guest
                        </Badge>
                      )}
                      {guest.loyaltyProgram?.tier && (
                        <Badge 
                          variant={guest.loyaltyProgram.tier.toLowerCase()} 
                          size="sm"
                        >
                          {guest.loyaltyProgram.tier} ({guest.loyaltyProgram.points} pts)
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditGuest(guest)}
                      >
                        <ApperIcon name="Edit" size={14} className="mr-1" />
                        Edit
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteGuest(guest)}
                        className="text-error-600 hover:text-error-700 hover:bg-error-50"
                      >
                        <ApperIcon name="Trash2" size={14} />
                      </Button>
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

export default Guests;