export type FieldType = 'text' | 'textarea' | 'date' | 'select' | 'boolean' | 'email' | 'tel';

export interface ValidationRule {
  pattern?: string;
  min?: number;
  max?: number;
  customError?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[]; // For select fields
  condition?: { field: string; value: any }; // Conditional logic for UI rendering
  section: string; // Grouping metadata for UI
  validation?: ValidationRule; // Field validation rules
}

export interface DocumentSchema {
  id: string;
  category: string;
  title: string;
  description: string;
  jurisdiction?: string;
  fields: FormField[];
}

class SchemaRegistry {
  private schemas: Map<string, DocumentSchema> = new Map();

  register(schema: DocumentSchema) {
    if (this.schemas.has(schema.id)) {
      console.warn(`Schema with id ${schema.id} is already registered. Overwriting.`);
    }
    this.schemas.set(schema.id, schema);
  }

  getSchema(id: string): DocumentSchema | undefined {
    return this.schemas.get(id);
  }

  getAllSchemas(): DocumentSchema[] {
    return Array.from(this.schemas.values());
  }

  getSchemasByCategory(category: string): DocumentSchema[] {
    return this.getAllSchemas().filter(schema => schema.category === category);
  }
}

export const documentRegistry = new SchemaRegistry();

// Pre-register core schemas
documentRegistry.register({
  id: 'gap-year-affidavit',
  category: 'Affidavits',
  title: 'Gap Year Affidavit',
  description: 'An affidavit explaining a gap in education, typically required for college or university admissions.',
  fields: [
    { id: 'fullName', label: 'Full Legal Name', type: 'text', required: true, section: 'Personal Details', placeholder: 'e.g., Rahul Kumar', validation: { min: 2, customError: "Name is too short" } },
    { id: 'isMinor', label: 'Is the applicant a minor?', type: 'boolean', section: 'Personal Details' },
    { id: 'guardianName', label: 'Father/Mother/Guardian Name', type: 'text', required: true, section: 'Personal Details', placeholder: 'e.g., Anil Kumar', condition: { field: 'isMinor', value: true } },
    { id: 'dob', label: 'Date of Birth', type: 'date', required: true, section: 'Personal Details' },
    { id: 'address', label: 'Current Address', type: 'textarea', required: true, section: 'Personal Details', placeholder: 'e.g., 123 ABC Road, New Delhi' },
    { id: 'phone', label: 'Phone Number', type: 'tel', section: 'Personal Details', validation: { pattern: "^\\+?[1-9]\\d{1,14}$", customError: "Invalid phone number format" } },
    { id: 'email', label: 'Email', type: 'email', section: 'Personal Details', validation: { pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", customError: "Invalid email format" } },
    { id: 'gapStart', label: 'Gap Start Date', type: 'date', required: true, section: 'Gap Period' },
    { id: 'gapEnd', label: 'Gap End Date', type: 'date', required: true, section: 'Gap Period' },
    { id: 'reason', label: 'Reason for Gap', type: 'textarea', required: true, section: 'Gap Period', placeholder: 'e.g., Preparing for JEE exams' },
    { id: 'activities', label: 'Activities During Gap', type: 'textarea', section: 'Gap Period' },
    { id: 'prevInstitution', label: 'Previous Institution', type: 'text', section: 'Education' },
    { id: 'prevCourse', label: 'Previous Course/Class', type: 'text', section: 'Education' },
    { id: 'isSpecificInstitution', label: 'Is this affidavit being submitted to a specific institution?', type: 'boolean', section: 'Education' },
    { id: 'intendedInstitution', label: 'Intended Institution', type: 'text', section: 'Education', condition: { field: 'isSpecificInstitution', value: true } },
    { id: 'intendedCourse', label: 'Intended Course', type: 'text', section: 'Education', condition: { field: 'isSpecificInstitution', value: true } },
    { id: 'executionCity', label: 'City of Execution', type: 'text', required: true, section: 'Affidavit Execution' },
    { id: 'executionState', label: 'State/Jurisdiction', type: 'text', required: true, section: 'Affidavit Execution' },
    { id: 'purpose', label: 'Purpose of Affidavit', type: 'text', required: true, section: 'Affidavit Execution' }
  ]
});

documentRegistry.register({
  id: 'nda',
  category: 'Agreements',
  title: 'Non-Disclosure Agreement (NDA)',
  description: 'A contract establishing a confidential relationship between parties to protect sensitive information.',
  fields: [
    { id: 'party1Name', label: 'Disclosing Party Name', type: 'text', required: true, section: 'Party Details' },
    { id: 'party1Address', label: 'Disclosing Party Address', type: 'textarea', required: true, section: 'Party Details' },
    { id: 'party2Name', label: 'Receiving Party Name', type: 'text', required: true, section: 'Party Details' },
    { id: 'party2Address', label: 'Receiving Party Address', type: 'textarea', required: true, section: 'Party Details' },
    { id: 'purpose', label: 'Purpose of Disclosure', type: 'textarea', required: true, section: 'Agreement Details', placeholder: 'e.g., For evaluating a potential business partnership' },
    { id: 'duration', label: 'Confidentiality Duration (Years)', type: 'select', options: ['1 Year', '2 Years', '3 Years', '5 Years', 'Indefinite'], required: true, section: 'Agreement Details' },
    { id: 'jurisdiction', label: 'Governing Law (State/Country)', type: 'text', required: true, section: 'Agreement Details' }
  ]
});

documentRegistry.register({
  id: 'legal-notice',
  category: 'Legal Notices',
  title: 'Payment Demand Notice',
  description: 'A formal legal notice demanding payment for an outstanding debt.',
  fields: [
    { id: 'senderName', label: 'Sender Name', type: 'text', required: true, section: 'Sender Details' },
    { id: 'senderAddress', label: 'Sender Address', type: 'textarea', required: true, section: 'Sender Details' },
    { id: 'recipientName', label: 'Recipient Name', type: 'text', required: true, section: 'Recipient Details' },
    { id: 'recipientAddress', label: 'Recipient Address', type: 'textarea', required: true, section: 'Recipient Details' },
    { id: 'amountOwed', label: 'Amount Owed', type: 'text', required: true, section: 'Debt Details' },
    { id: 'debtReason', label: 'Reason for Debt', type: 'textarea', required: true, section: 'Debt Details', placeholder: 'e.g., Unpaid invoices for freelance web development services' },
    { id: 'debtDate', label: 'Date Debt Incurred', type: 'date', required: true, section: 'Debt Details' },
    { id: 'deadlineDays', label: 'Deadline to Pay (Days)', type: 'select', options: ['7', '14', '15', '30'], required: true, section: 'Demand Details' }
  ]
});

// For backward compatibility during migration
export const documentSchemas = documentRegistry.getAllSchemas();
export type DocSchema = DocumentSchema;

