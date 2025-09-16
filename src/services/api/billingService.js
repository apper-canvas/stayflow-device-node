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
    
    // Calculate taxes if not provided
    const taxRate = billData.taxRate || this.getDefaultTaxRate();
    const subtotal = (billData.roomCharges || 0) + 
                    (billData.additionalCharges || []).reduce((sum, charge) => sum + charge, 0);
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;
    
    const newBill = {
      Id: this.nextId++,
      ...billData,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      paymentHistory: [],
      adjustments: [],
      refunds: [],
      invoiceNumber: this.generateInvoiceNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.data.push(newBill);
    return { ...newBill };
  }

  async update(id, updateData) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) throw new Error("Bill not found");
    
    const updatedBill = { 
      ...this.data[index], 
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    // Recalculate taxes if charges changed
    if (updateData.roomCharges !== undefined || updateData.additionalCharges !== undefined) {
      const taxRate = updatedBill.taxRate || this.getDefaultTaxRate();
      const subtotal = (updatedBill.roomCharges || 0) + 
                      (updatedBill.additionalCharges || []).reduce((sum, charge) => sum + charge, 0);
      const taxAmount = subtotal * (taxRate / 100);
      updatedBill.subtotal = subtotal;
      updatedBill.taxAmount = taxAmount;
      updatedBill.totalAmount = subtotal + taxAmount;
    }
    
    this.data[index] = updatedBill;
    return { ...updatedBill };
  }

  async delete(id) {
    await this.delay();
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) throw new Error("Bill not found");
    
    const deleted = this.data.splice(index, 1)[0];
    return { ...deleted };
  }

  async processPayment(id, paymentData) {
    await this.delay();
    const bill = await this.getById(id);
    
    const payment = {
      id: Date.now(),
      amount: paymentData.amount,
      method: paymentData.method,
      transactionId: paymentData.transactionId || `TXN-${Date.now()}`,
      processedAt: new Date().toISOString(),
      status: 'completed'
    };
    
    const paymentHistory = [...(bill.paymentHistory || []), payment];
    const totalPaid = paymentHistory.reduce((sum, p) => sum + p.amount, 0);
    
    const paymentStatus = totalPaid >= bill.totalAmount ? 'Paid' : 
                         totalPaid > 0 ? 'Partial' : 'Pending';
    
    return this.update(id, {
      paymentHistory,
      paymentStatus,
      paymentMethod: paymentData.method,
      paidAt: paymentStatus === 'Paid' ? new Date().toISOString() : bill.paidAt
    });
  }

  async processRefund(id, refundData) {
    await this.delay();
    const bill = await this.getById(id);
    
    const refund = {
      id: Date.now(),
      amount: refundData.amount,
      reason: refundData.reason,
      method: refundData.method || 'Original Payment Method',
      processedAt: new Date().toISOString(),
      status: 'processed'
    };
    
    const refunds = [...(bill.refunds || []), refund];
    const totalRefunded = refunds.reduce((sum, r) => sum + r.amount, 0);
    const totalPaid = (bill.paymentHistory || []).reduce((sum, p) => sum + p.amount, 0);
    const netAmount = totalPaid - totalRefunded;
    
    const paymentStatus = netAmount <= 0 ? 'Refunded' :
                         netAmount >= bill.totalAmount ? 'Paid' : 'Partial';
    
    return this.update(id, {
      refunds,
      paymentStatus,
      refundedAmount: totalRefunded
    });
  }

  async addAdjustment(id, adjustmentData) {
    await this.delay();
    const bill = await this.getById(id);
    
    const adjustment = {
      id: Date.now(),
      type: adjustmentData.type, // 'discount', 'fee', 'correction'
      amount: adjustmentData.amount,
      reason: adjustmentData.reason,
      appliedBy: adjustmentData.appliedBy || 'System',
      appliedAt: new Date().toISOString()
    };
    
    const adjustments = [...(bill.adjustments || []), adjustment];
    const adjustmentTotal = adjustments.reduce((sum, adj) => {
      return adj.type === 'discount' ? sum - adj.amount : sum + adj.amount;
    }, 0);
    
    const newSubtotal = bill.subtotal + adjustmentTotal;
    const taxAmount = newSubtotal * (bill.taxRate / 100);
    const totalAmount = newSubtotal + taxAmount;
    
    return this.update(id, {
      adjustments,
      subtotal: newSubtotal,
      taxAmount,
      totalAmount
    });
  }

  getDefaultTaxRate() {
    return 10; // 10% default tax rate
  }

  generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const sequence = String(this.nextId).padStart(4, '0');
    return `INV-${year}${month}${day}-${sequence}`;
  }

  async getTaxReport(startDate, endDate) {
    await this.delay();
    const bills = this.data.filter(bill => {
      const billDate = new Date(bill.createdAt);
      return billDate >= new Date(startDate) && billDate <= new Date(endDate) && 
             bill.paymentStatus === 'Paid';
    });
    
    return {
      totalTaxCollected: bills.reduce((sum, bill) => sum + (bill.taxAmount || 0), 0),
      totalRevenue: bills.reduce((sum, bill) => sum + (bill.subtotal || 0), 0),
      billCount: bills.length,
      averageTaxRate: bills.length > 0 ? 
        bills.reduce((sum, bill) => sum + (bill.taxRate || 0), 0) / bills.length : 0,
      bills: bills.map(bill => ({
        Id: bill.Id,
        invoiceNumber: bill.invoiceNumber,
        guestName: bill.guestName,
        subtotal: bill.subtotal,
        taxRate: bill.taxRate,
        taxAmount: bill.taxAmount,
        totalAmount: bill.totalAmount,
        createdAt: bill.createdAt
      }))
    };
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }
}

export default new BillingService();