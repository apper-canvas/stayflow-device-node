class GuestService {
  constructor() {
    this.tableName = 'guest_c';
    this.apperClient = null;
  }

  getApperClient() {
    if (!this.apperClient) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
    return this.apperClient;
  }

  async getAll() {
    try {
      const client = this.getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "id_type_c"}},
          {"field": {"Name": "id_number_c"}},
          {"field": {"Name": "address_c"}},
          {"field": {"Name": "preferences_c"}},
          {"field": {"Name": "vip_status_c"}},
          {"field": {"Name": "loyalty_program_c"}},
          {"field": {"Name": "loyalty_points_c"}},
          {"field": {"Name": "account_type_c"}},
          {"field": {"Name": "company_name_c"}},
          {"field": {"Name": "company_registration_c"}},
          {"field": {"Name": "tax_id_c"}},
          {"field": {"Name": "billing_contact_c"}},
          {"field": {"Name": "credit_limit_c"}},
          {"field": {"Name": "payment_terms_c"}},
          {"field": {"Name": "corporate_discount_c"}},
          {"field": {"Name": "join_date_c"}}
        ]
      };
      
      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(`Error fetching guests: ${response.message}`);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching guests: ${error?.response?.data?.message || error}`);
      return [];
    }
  }

  async getById(id) {
    try {
      const client = this.getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "id_type_c"}},
          {"field": {"Name": "id_number_c"}},
          {"field": {"Name": "address_c"}},
          {"field": {"Name": "preferences_c"}},
          {"field": {"Name": "vip_status_c"}},
          {"field": {"Name": "loyalty_program_c"}},
          {"field": {"Name": "loyalty_points_c"}},
          {"field": {"Name": "account_type_c"}},
          {"field": {"Name": "company_name_c"}},
          {"field": {"Name": "company_registration_c"}},
          {"field": {"Name": "tax_id_c"}},
          {"field": {"Name": "billing_contact_c"}},
          {"field": {"Name": "credit_limit_c"}},
          {"field": {"Name": "payment_terms_c"}},
          {"field": {"Name": "corporate_discount_c"}},
          {"field": {"Name": "join_date_c"}}
        ]
      };
      
      const response = await client.getRecordById(this.tableName, id, params);
      
      if (!response.success) {
        console.error(`Error fetching guest ${id}: ${response.message}`);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching guest ${id}: ${error?.response?.data?.message || error}`);
      return null;
    }
  }

  async create(guestData) {
    try {
      const client = this.getApperClient();
      
      // Map UI field names to database field names - only Updateable fields
      const mappedData = {
        Name: `${guestData.firstName || ''} ${guestData.lastName || ''}`.trim(),
        first_name_c: guestData.firstName || '',
        last_name_c: guestData.lastName || '',
        email_c: guestData.email || '',
        phone_c: guestData.phone || '',
        id_type_c: guestData.idType || '',
        id_number_c: guestData.idNumber || '',
        address_c: guestData.address ? JSON.stringify(guestData.address) : '',
        preferences_c: Array.isArray(guestData.preferences) ? guestData.preferences.join(',') : '',
        vip_status_c: guestData.vipStatus || false,
        loyalty_program_c: guestData.loyaltyProgram?.tier || '',
        loyalty_points_c: guestData.loyaltyProgram?.points || 0,
        account_type_c: guestData.accountType || 'individual',
        company_name_c: guestData.companyName || '',
        company_registration_c: guestData.companyRegistration || '',
        tax_id_c: guestData.taxId || '',
        billing_contact_c: guestData.billingContact || '',
        credit_limit_c: guestData.creditLimit || 0,
        payment_terms_c: guestData.paymentTerms || 'net30',
        corporate_discount_c: guestData.corporateDiscount || 0,
        join_date_c: guestData.loyaltyProgram?.joinDate || new Date().toISOString().split('T')[0]
      };

      const params = {
        records: [mappedData]
      };
      
      const response = await client.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(`Error creating guest: ${response.message}`);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} guests:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        return successful.length > 0 ? successful[0].data : null;
      }
      
      return null;
    } catch (error) {
      console.error(`Error creating guest: ${error?.response?.data?.message || error}`);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const client = this.getApperClient();
      
      // Map UI field names to database field names - only Updateable fields
      const mappedData = {
        Id: id
      };

      if (updateData.firstName !== undefined || updateData.lastName !== undefined) {
        mappedData.Name = `${updateData.firstName || ''} ${updateData.lastName || ''}`.trim();
      }
      if (updateData.firstName !== undefined) mappedData.first_name_c = updateData.firstName;
      if (updateData.lastName !== undefined) mappedData.last_name_c = updateData.lastName;
      if (updateData.email !== undefined) mappedData.email_c = updateData.email;
      if (updateData.phone !== undefined) mappedData.phone_c = updateData.phone;
      if (updateData.idType !== undefined) mappedData.id_type_c = updateData.idType;
      if (updateData.idNumber !== undefined) mappedData.id_number_c = updateData.idNumber;
      if (updateData.address !== undefined) mappedData.address_c = JSON.stringify(updateData.address);
      if (updateData.preferences !== undefined) mappedData.preferences_c = Array.isArray(updateData.preferences) ? updateData.preferences.join(',') : '';
      if (updateData.vipStatus !== undefined) mappedData.vip_status_c = updateData.vipStatus;
      if (updateData.loyaltyProgram !== undefined) {
        mappedData.loyalty_program_c = updateData.loyaltyProgram?.tier || '';
        mappedData.loyalty_points_c = updateData.loyaltyProgram?.points || 0;
        if (updateData.loyaltyProgram?.joinDate) {
          mappedData.join_date_c = updateData.loyaltyProgram.joinDate;
        }
      }
      if (updateData.accountType !== undefined) mappedData.account_type_c = updateData.accountType;
      if (updateData.companyName !== undefined) mappedData.company_name_c = updateData.companyName;
      if (updateData.companyRegistration !== undefined) mappedData.company_registration_c = updateData.companyRegistration;
      if (updateData.taxId !== undefined) mappedData.tax_id_c = updateData.taxId;
      if (updateData.billingContact !== undefined) mappedData.billing_contact_c = updateData.billingContact;
      if (updateData.creditLimit !== undefined) mappedData.credit_limit_c = updateData.creditLimit;
      if (updateData.paymentTerms !== undefined) mappedData.payment_terms_c = updateData.paymentTerms;
      if (updateData.corporateDiscount !== undefined) mappedData.corporate_discount_c = updateData.corporateDiscount;

      const params = {
        records: [mappedData]
      };
      
      const response = await client.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(`Error updating guest: ${response.message}`);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} guests:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        return successful.length > 0 ? successful[0].data : null;
      }
      
      return null;
    } catch (error) {
      console.error(`Error updating guest: ${error?.response?.data?.message || error}`);
      throw error;
    }
  }

  async getCorporateAccounts() {
    try {
      const client = this.getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "account_type_c"}},
          {"field": {"Name": "company_name_c"}},
          {"field": {"Name": "company_registration_c"}},
          {"field": {"Name": "tax_id_c"}},
          {"field": {"Name": "billing_contact_c"}},
          {"field": {"Name": "credit_limit_c"}},
          {"field": {"Name": "payment_terms_c"}},
          {"field": {"Name": "corporate_discount_c"}}
        ],
        where: [{"FieldName": "account_type_c", "Operator": "EqualTo", "Values": ["corporate"]}]
      };
      
      const response = await client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(`Error fetching corporate accounts: ${response.message}`);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching corporate accounts: ${error?.response?.data?.message || error}`);
      return [];
    }
  }

  async getCorporateAccountById(id) {
    try {
      const guest = await this.getById(id);
      if (guest && guest.account_type_c === 'corporate') {
        return guest;
      }
      throw new Error("Corporate account not found");
    } catch (error) {
      console.error(`Error fetching corporate account ${id}: ${error?.response?.data?.message || error}`);
      throw error;
    }
  }

  async delete(id) {
    try {
      const client = this.getApperClient();
      const params = {
        RecordIds: [id]
      };
      
      const response = await client.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(`Error deleting guest: ${response.message}`);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} guests:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        return successful.length === 1;
      }
      
      return false;
    } catch (error) {
      console.error(`Error deleting guest: ${error?.response?.data?.message || error}`);
      throw error;
    }
  }
}

export default new GuestService();