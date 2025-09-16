import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import SearchBar from "@/components/molecules/SearchBar";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import billingService from "@/services/api/billingService";
import reservationService from "@/services/api/reservationService";
import { format } from "date-fns";

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [billToUpdate, setBillToUpdate] = useState(null);
  const [formData, setFormData] = useState({
    reservationId: "",
    roomCharges: "",
    additionalCharges: "",
    paymentMethod: ""
  });
  const [formErrors, setFormErrors] = useState({});

  const paymentMethods = ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "Check"];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterBills();
  }, [bills, searchQuery, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [billsData, reservationsData] = await Promise.all([
        billingService.getAll(),
        reservationService.getAll()
      ]);
      setBills(billsData);
      setReservations(reservationsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterBills = () => {
    let filtered = [...bills];

    if (statusFilter !== "all") {
      filtered = filtered.filter(bill => bill.paymentStatus === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bill =>
        bill.guestName?.toLowerCase().includes(query) ||
        bill.roomNumber?.toString().includes(query) ||
        bill.Id.toString().includes(query)
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    setFilteredBills(filtered);
  };

  const resetForm = () => {
    setFormData({
      reservationId: "",
      roomCharges: "",
      additionalCharges: "",
      paymentMethod: ""
    });
    setFormErrors({});
  };

  const handleCreateBill = () => {
    resetForm();
    setSelectedBill(null);
    setShowForm(true);
  };

  const handleProcessPayment = (bill) => {
    setBillToUpdate(bill);
    setShowPaymentModal(true);
  };

  const handlePaymentUpdate = async (paymentMethod) => {
    if (!billToUpdate) return;

    try {
      await billingService.update(billToUpdate.Id, {
        ...billToUpdate,
        paymentStatus: "Paid",
        paymentMethod: paymentMethod,
        paidAt: new Date().toISOString()
      });
      
      toast.success("Payment processed successfully!");
      setShowPaymentModal(false);
      setBillToUpdate(null);
      loadData();
    } catch (error) {
      toast.error("Failed to process payment");
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

    if (!formData.reservationId) errors.reservationId = "Reservation is required";
    if (!formData.roomCharges) errors.roomCharges = "Room charges are required";
    else if (isNaN(formData.roomCharges) || parseFloat(formData.roomCharges) < 0) {
      errors.roomCharges = "Room charges must be a valid number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateTotal = () => {
    const roomCharges = parseFloat(formData.roomCharges) || 0;
    const additionalCharges = formData.additionalCharges
      .split(",")
      .map(charge => {
        const amount = parseFloat(charge.trim());
        return isNaN(amount) ? 0 : amount;
      })
      .reduce((sum, amount) => sum + amount, 0);
    
    return roomCharges + additionalCharges;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const reservation = reservations.find(r => r.Id === parseInt(formData.reservationId));
      if (!reservation) {
        toast.error("Invalid reservation selected");
        return;
      }

      const additionalChargesArray = formData.additionalCharges
        ? formData.additionalCharges.split(",").map(charge => {
            const amount = parseFloat(charge.trim());
            return isNaN(amount) ? 0 : amount;
          }).filter(amount => amount > 0)
        : [];

      const billData = {
        reservationId: parseInt(formData.reservationId),
        guestName: reservation.guestName,
        roomNumber: reservation.roomNumber,
        roomCharges: parseFloat(formData.roomCharges),
        additionalCharges: additionalChargesArray,
        totalAmount: calculateTotal(),
        paymentStatus: "Pending",
        paymentMethod: "",
        createdAt: new Date().toISOString()
      };

      await billingService.create(billData);
      toast.success("Bill created successfully!");
      setShowForm(false);
      loadData();
    } catch (error) {
      toast.error("Failed to create bill");
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message="Failed to load billing data" description={error} onRetry={loadData} />;

  if (showForm) {
    const unpaidReservations = reservations.filter(reservation => 
      reservation.status === "Checked Out" || reservation.status === "Checked In"
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Bill</h1>
            <p className="text-gray-600">Generate a new bill for a reservation</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Billing Details</h3>
                
                <FormField
                  label="Reservation"
                  type="select"
                  name="reservationId"
                  value={formData.reservationId}
                  onChange={handleFormChange}
                  error={formErrors.reservationId}
                  required
                >
                  <option value="">Select a reservation</option>
                  {unpaidReservations.map(reservation => (
                    <option key={reservation.Id} value={reservation.Id}>
                      {reservation.guestName} - Room {reservation.roomNumber} ({reservation.status})
                    </option>
                  ))}
                </FormField>

                <FormField
                  label="Room Charges"
                  type="number"
                  name="roomCharges"
                  value={formData.roomCharges}
                  onChange={handleFormChange}
                  error={formErrors.roomCharges}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />

                <FormField
                  label="Additional Charges"
                  name="additionalCharges"
                  value={formData.additionalCharges}
                  onChange={handleFormChange}
                  placeholder="10.50, 25.00, 5.75 (comma separated amounts)"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Room Charges:</span>
                    <span>${(parseFloat(formData.roomCharges) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Additional Charges:</span>
                    <span>
                      ${formData.additionalCharges
                        ? formData.additionalCharges
                            .split(",")
                            .map(charge => parseFloat(charge.trim()) || 0)
                            .reduce((sum, amount) => sum + amount, 0)
                            .toFixed(2)
                        : "0.00"
                      }
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total Amount:</span>
                      <span className="text-primary-600">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
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
                Create Bill
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
          <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
          <p className="text-gray-600">Manage guest bills and payments</p>
        </div>
        <Button 
          onClick={handleCreateBill}
          className="btn-gradient"
        >
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Create Bill
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search by guest name, room number, or bill ID..."
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
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bills List */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        {filteredBills.length === 0 ? (
          <Empty
            icon="CreditCard"
            title="No bills found"
            description={
              searchQuery || statusFilter !== "all"
                ? "No bills match your current filters. Try adjusting your search criteria."
                : "There are no bills created yet. Create your first bill to get started."
            }
            actionLabel={searchQuery || statusFilter !== "all" ? undefined : "Create First Bill"}
            onAction={searchQuery || statusFilter !== "all" ? undefined : handleCreateBill}
          />
        ) : (
          <>
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 text-sm font-medium text-gray-700">
                <div>Bill ID</div>
                <div>Guest</div>
                <div>Room</div>
                <div>Amount</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {filteredBills.map((bill) => (
                <div key={bill.Id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                    <div>
                      <p className="font-medium text-gray-900">#{bill.Id}</p>
                      <p className="text-sm text-gray-600">
                        {bill.createdAt && format(new Date(bill.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900">{bill.guestName}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900">Room {bill.roomNumber}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900">${bill.totalAmount.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">
                        Room: ${bill.roomCharges.toFixed(2)}
                        {bill.additionalCharges && bill.additionalCharges.length > 0 && (
                          <>, Extras: ${bill.additionalCharges.reduce((sum, charge) => sum + charge, 0).toFixed(2)}</>
                        )}
                      </p>
                    </div>
                    
                    <div>
                      <Badge 
                        variant={
                          bill.paymentStatus === "Paid" ? "success" :
                          bill.paymentStatus === "Overdue" ? "error" :
                          "pending"
                        }
                      >
                        {bill.paymentStatus}
                      </Badge>
                      {bill.paymentMethod && (
                        <p className="text-xs text-gray-600 mt-1">{bill.paymentMethod}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {bill.paymentStatus === "Pending" && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleProcessPayment(bill)}
                        >
                          <ApperIcon name="CreditCard" size={14} className="mr-1" />
                          Pay
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.print()}
                      >
                        <ApperIcon name="Printer" size={14} className="mr-1" />
                        Print
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && billToUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Process Payment
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ApperIcon name="X" size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                Guest: <span className="font-medium">{billToUpdate.guestName}</span>
              </p>
              <p className="text-gray-600 mb-2">
                Room: <span className="font-medium">{billToUpdate.roomNumber}</span>
              </p>
              <p className="text-gray-900 text-lg font-semibold">
                Total Amount: ${billToUpdate.totalAmount.toFixed(2)}
              </p>
            </div>
            
            <p className="text-gray-600 mb-4">Select payment method:</p>
            
            <div className="grid grid-cols-1 gap-2">
              {paymentMethods.map((method) => (
                <Button
                  key={method}
                  variant="outline"
                  onClick={() => handlePaymentUpdate(method)}
                  className="justify-start"
                >
                  <ApperIcon 
                    name={
                      method === "Cash" ? "Banknote" :
                      method === "Credit Card" ? "CreditCard" :
                      method === "Debit Card" ? "CreditCard" :
                      method === "Bank Transfer" ? "Building2" : "FileText"
                    } 
                    size={16} 
                    className="mr-2" 
                  />
                  {method}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;