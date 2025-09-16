import guestData from "@/services/mockData/guests.json";

class GuestService {
  constructor() {
    this.data = [...guestData];
    this.nextId = Math.max(...this.data.map(item => item.Id)) + 1;
  }

  async getAll() {
    await this.delay();
    return [...this.data];
  }

  async getById(id) {
    await this.delay();
    const guest = this.data.find(item => item.Id === id);
    if (!guest) throw new Error("Guest not found");
    return { ...guest };
  }

  async create(guestData) {
    await this.delay();
    const newGuest = {
      Id: this.nextId++,
      ...guestData,
      createdAt: new Date().toISOString(),
      stayHistory: []
    };
    this.data.push(newGuest);
    return { ...newGuest };
  }

  async update(id, updateData) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) throw new Error("Guest not found");
    
    this.data[index] = { ...this.data[index], ...updateData };
    return { ...this.data[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) throw new Error("Guest not found");
    
    const deleted = this.data.splice(index, 1)[0];
    return { ...deleted };
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }
}

export default new GuestService();