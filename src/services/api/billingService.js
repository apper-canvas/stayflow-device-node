import billingData from "@/services/mockData/billing.json";

class BillingService {
  constructor() {
    this.data = [...billingData];
    this.nextId = Math.max(...this.data.map(item => item.Id)) + 1;
  }

  async getAll() {
    await this.delay();
    return [...this.data];
  }

  async getById(id) {
    await this.delay();
    const bill = this.data.find(item => item.Id === id);
    if (!bill) throw new Error("Bill not found");
    return { ...bill };
  }

  async create(billData) {
    await this.delay();
    const newBill = {
      Id: this.nextId++,
      ...billData,
      createdAt: new Date().toISOString()
    };
    this.data.push(newBill);
    return { ...newBill };
  }

  async update(id, updateData) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) throw new Error("Bill not found");
    
    this.data[index] = { ...this.data[index], ...updateData };
    return { ...this.data[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) throw new Error("Bill not found");
    
    const deleted = this.data.splice(index, 1)[0];
    return { ...deleted };
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }
}

export default new BillingService();