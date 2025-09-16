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
      },
      // Corporate account fields
      accountType: guestData.accountType || 'individual',
      companyName: guestData.companyName || "",
      companyRegistration: guestData.companyRegistration || "",
      taxId: guestData.taxId || "",
      billingContact: guestData.billingContact || "",
      creditLimit: guestData.creditLimit || 0,
      paymentTerms: guestData.paymentTerms || "net30",
      corporateDiscount: guestData.corporateDiscount || 0
    };
    this.data.push(newGuest);
    return { ...newGuest };
  }

async update(id, updateData) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) throw new Error("Guest not found");
    
    // Ensure all fields including ID fields and corporate fields are properly handled
    const updatedGuest = {
      ...this.data[index],
      ...updateData,
      idType: updateData.idType !== undefined ? updateData.idType : this.data[index].idType,
      idNumber: updateData.idNumber !== undefined ? updateData.idNumber : this.data[index].idNumber,
      vipStatus: updateData.vipStatus !== undefined ? updateData.vipStatus : this.data[index].vipStatus,
      loyaltyProgram: updateData.loyaltyProgram 
        ? { ...this.data[index].loyaltyProgram, ...updateData.loyaltyProgram }
        : this.data[index].loyaltyProgram,
      // Handle corporate account fields
      accountType: updateData.accountType !== undefined ? updateData.accountType : this.data[index].accountType,
      companyName: updateData.companyName !== undefined ? updateData.companyName : this.data[index].companyName,
      companyRegistration: updateData.companyRegistration !== undefined ? updateData.companyRegistration : this.data[index].companyRegistration,
      taxId: updateData.taxId !== undefined ? updateData.taxId : this.data[index].taxId,
      billingContact: updateData.billingContact !== undefined ? updateData.billingContact : this.data[index].billingContact,
      creditLimit: updateData.creditLimit !== undefined ? updateData.creditLimit : this.data[index].creditLimit,
      paymentTerms: updateData.paymentTerms !== undefined ? updateData.paymentTerms : this.data[index].paymentTerms,
      corporateDiscount: updateData.corporateDiscount !== undefined ? updateData.corporateDiscount : this.data[index].corporateDiscount
    };
    
    this.data[index] = updatedGuest;
    return { ...this.data[index] };
  }

  async getCorporateAccounts() {
    await this.delay();
    return this.data.filter(guest => guest.accountType === 'corporate');
  }

  async getCorporateAccountById(id) {
    await this.delay();
    const account = this.data.find(guest => guest.Id === id && guest.accountType === 'corporate');
    if (!account) throw new Error("Corporate account not found");
    return { ...account };
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