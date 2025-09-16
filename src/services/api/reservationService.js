import reservationData from "@/services/mockData/reservations.json";

class ReservationService {
  constructor() {
    this.data = [...reservationData];
    this.nextId = Math.max(...this.data.map(item => item.Id)) + 1;
  }

  async getAll() {
    await this.delay();
    return [...this.data];
  }

  async getById(id) {
    await this.delay();
    const reservation = this.data.find(item => item.Id === id);
    if (!reservation) throw new Error("Reservation not found");
    return { ...reservation };
  }

async create(reservationData) {
    await this.delay();
    
    // Handle group booking creation
    if (reservationData.isGroupBooking && reservationData.groupRooms) {
      const groupReservations = [];
      const groupId = `GRP-${Date.now()}`;
      
      for (const roomData of reservationData.groupRooms) {
        const newReservation = {
          Id: this.nextId++,
          ...reservationData,
          ...roomData,
          groupId,
          isGroupBooking: true,
          groupSize: reservationData.groupRooms.length,
          createdAt: new Date().toISOString(),
          modificationHistory: [],
          cancellationPolicy: reservationData.cancellationPolicy || 'standard',
          corporateAccount: reservationData.corporateAccount || null
        };
        this.data.push(newReservation);
        groupReservations.push({ ...newReservation });
      }
      
      return groupReservations;
    }
    
    // Handle single reservation creation
    const newReservation = {
      Id: this.nextId++,
      ...reservationData,
      createdAt: new Date().toISOString(),
      modificationHistory: [],
      cancellationPolicy: reservationData.cancellationPolicy || 'standard',
      corporateAccount: reservationData.corporateAccount || null,
      groupId: null,
      isGroupBooking: false
    };
    this.data.push(newReservation);
    return { ...newReservation };
  }

async update(id, updateData) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) throw new Error("Reservation not found");
    
    const originalReservation = { ...this.data[index] };
    
    // Track modification history
    const modification = {
      timestamp: new Date().toISOString(),
      changes: this.getChanges(originalReservation, updateData),
      modifiedBy: updateData.modifiedBy || 'System',
      reason: updateData.modificationReason || 'Update'
    };
    
    const updatedReservation = {
      ...originalReservation,
      ...updateData,
      modificationHistory: [
        ...(originalReservation.modificationHistory || []),
        modification
      ],
      lastModified: new Date().toISOString()
    };
    
    this.data[index] = updatedReservation;
    return { ...this.data[index] };
  }

  getChanges(original, updates) {
    const changes = {};
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'modificationReason' && key !== 'modifiedBy' && original[key] !== value) {
        changes[key] = { from: original[key], to: value };
      }
    }
    return changes;
  }

async cancelWithRefund(id, cancellationReason, refundAmount = 0) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) throw new Error("Reservation not found");

    const reservation = this.data[index];
    
    // Calculate refund amount based on cancellation policy if not provided
    if (refundAmount === 0) {
      const checkInDate = new Date(reservation.checkIn);
      const now = new Date();
      const daysUntilCheckIn = Math.ceil((checkInDate - now) / (1000 * 60 * 60 * 24));
      
      // Simple cancellation policy logic
      if (daysUntilCheckIn >= 7) {
        refundAmount = reservation.totalAmount; // Full refund
      } else if (daysUntilCheckIn >= 3) {
        refundAmount = reservation.totalAmount * 0.5; // 50% refund
      } else {
        refundAmount = 0; // No refund
      }
    }
    
    const cancellation = {
      cancelledAt: new Date().toISOString(),
      reason: cancellationReason,
      refundAmount,
      refundProcessed: refundAmount > 0,
      cancellationPolicy: reservation.cancellationPolicy || 'standard',
      daysBeforeCheckIn: Math.ceil((new Date(reservation.checkIn) - new Date()) / (1000 * 60 * 60 * 24))
    };

    return this.update(id, {
      status: 'Cancelled',
      cancellation,
      modificationReason: `Cancelled: ${cancellationReason}`,
      refundAmount
    });
  }

  async getGroupReservations(groupId) {
    await this.delay();
    return this.data.filter(reservation => reservation.groupId === groupId);
  }

  async delete(id) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) throw new Error("Reservation not found");
    
    const deleted = this.data.splice(index, 1)[0];
    return { ...deleted };
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }
}

export default new ReservationService();