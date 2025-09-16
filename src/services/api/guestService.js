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
      idType: guestData.idType || "",
      idNumber: guestData.idNumber || "",
      createdAt: new Date().toISOString(),
      stayHistory: [],
      vipStatus: guestData.vipStatus || false,
      loyaltyProgram: guestData.loyaltyProgram || {
        tier: "",
        points: 0,
        joinDate: ""
      }
    };
    this.data.push(newGuest);
    return { ...newGuest };
  }

async update(id, updateData) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) throw new Error("Guest not found");
    
    // Ensure all fields including ID fields are properly handled
    const updatedGuest = {
      ...this.data[index],
      ...updateData,
      idType: updateData.idType !== undefined ? updateData.idType : this.data[index].idType,
      idNumber: updateData.idNumber !== undefined ? updateData.idNumber : this.data[index].idNumber,
      vipStatus: updateData.vipStatus !== undefined ? updateData.vipStatus : this.data[index].vipStatus,
      loyaltyProgram: updateData.loyaltyProgram 
        ? { ...this.data[index].loyaltyProgram, ...updateData.loyaltyProgram }
        : this.data[index].loyaltyProgram
    };
    
    this.data[index] = updatedGuest;
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