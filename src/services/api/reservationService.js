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
    const newReservation = {
      Id: this.nextId++,
      ...reservationData,
      createdAt: new Date().toISOString()
    };
    this.data.push(newReservation);
    return { ...newReservation };
  }

  async update(id, updateData) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) throw new Error("Reservation not found");
    
    this.data[index] = { ...this.data[index], ...updateData };
    return { ...this.data[index] };
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