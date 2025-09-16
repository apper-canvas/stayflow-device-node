import roomData from "@/services/mockData/rooms.json";

class RoomService {
  constructor() {
    this.data = [...roomData];
    this.nextId = Math.max(...this.data.map(item => item.Id)) + 1;
  }

  async getAll() {
    await this.delay();
    return [...this.data];
  }

  async getById(id) {
    await this.delay();
    const room = this.data.find(item => item.Id === id);
    if (!room) throw new Error("Room not found");
    return { ...room };
  }

  async create(roomData) {
    await this.delay();
    const newRoom = {
      Id: this.nextId++,
      ...roomData,
      lastCleaned: new Date().toISOString()
    };
    this.data.push(newRoom);
    return { ...newRoom };
  }

  async update(id, updateData) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) throw new Error("Room not found");
    
    this.data[index] = { ...this.data[index], ...updateData };
    return { ...this.data[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) throw new Error("Room not found");
    
    const deleted = this.data.splice(index, 1)[0];
    return { ...deleted };
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }
}

export default new RoomService();