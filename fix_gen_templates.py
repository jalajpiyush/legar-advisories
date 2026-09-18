import re

with open("src/pages/Generator.tsx", "r") as f:
    content = f.read()

# I will replace the entire TEMPLATES list
# Let's find where it starts and ends
start_idx = content.find("const TEMPLATES: Template[] = [")
end_idx = content.find("];", start_idx) + 2

new_templates = """const TEMPLATES: Template[] = [
  {
    id: 'legal-notice', category: 'Litigation', title: 'Legal Notice',
    fields: [{ name: 'sender', label: 'Sender Name', placeholder: 'e.g. John Doe' }, { name: 'receiver', label: 'Receiver Name', placeholder: 'e.g. Acme Corp' }, { name: 'reason', label: 'Reason for Notice', placeholder: 'e.g. Breach of Contract' }]
  },
  {
    id: 'reply-legal-notice', category: 'Litigation', title: 'Reply to Legal Notice',
    fields: [{ name: 'sender', label: 'Sender Name', placeholder: 'e.g. Acme Corp' }, { name: 'receiver', label: 'Receiver Name', placeholder: 'e.g. John Doe' }, { name: 'originalDate', label: 'Original Notice Date', placeholder: 'e.g. 1st Jan 2026' }]
  },
  {
    id: 'complaint', category: 'Litigation', title: 'Complaint',
    fields: [{ name: 'complainant', label: 'Complainant Name', placeholder: '' }, { name: 'defendant', label: 'Defendant Name', placeholder: '' }, { name: 'jurisdiction', label: 'Jurisdiction', placeholder: '' }]
  },
  {
    id: 'affidavit', category: 'Documentation', title: 'Affidavit',
    fields: [{ name: 'deponent', label: 'Deponent Name', placeholder: '' }, { name: 'age', label: 'Age', placeholder: '' }, { name: 'address', label: 'Address', placeholder: '' }]
  },
  {
    id: 'agreement', category: 'Contracts', title: 'Agreement',
    fields: [{ name: 'party1', label: 'Party 1', placeholder: '' }, { name: 'party2', label: 'Party 2', placeholder: '' }, { name: 'purpose', label: 'Purpose of Agreement', placeholder: '' }]
  },
  {
    id: 'nda', category: 'Corporate', title: 'NDA',
    fields: [{ name: 'party1', label: 'Disclosing Party Name', placeholder: '' }, { name: 'party2', label: 'Receiving Party Name', placeholder: '' }, { name: 'jurisdiction', label: 'Jurisdiction', placeholder: '' }]
  },
  {
    id: 'rent-agreement', category: 'Property', title: 'Rent Agreement',
    fields: [{ name: 'landlord', label: 'Landlord Name', placeholder: '' }, { name: 'tenant', label: 'Tenant Name', placeholder: '' }, { name: 'rent', label: 'Monthly Rent', placeholder: '' }, { name: 'deposit', label: 'Security Deposit', placeholder: '' }]
  },
  {
    id: 'emp-agreement', category: 'HR', title: 'Employment Agreement',
    fields: [{ name: 'companyName', label: 'Company Name', placeholder: '' }, { name: 'employeeName', label: 'Employee Name', placeholder: '' }, { name: 'salary', label: 'Salary', placeholder: '' }]
  },
  {
    id: 'consumer-complaint', category: 'Consumer', title: 'Consumer Complaint',
    fields: [{ name: 'consumer', label: 'Consumer Name', placeholder: '' }, { name: 'company', label: 'Company Name', placeholder: '' }, { name: 'deficiency', label: 'Service Deficiency', placeholder: '' }]
  },
  {
    id: 'rti-application', category: 'Civic', title: 'RTI Application',
    fields: [{ name: 'applicant', label: 'Applicant Name', placeholder: '' }, { name: 'pio', label: 'PIO Details', placeholder: 'e.g. PIO, Dept of Revenue' }, { name: 'info', label: 'Information Required', placeholder: '' }]
  },
  {
    id: 'legal-email', category: 'Communication', title: 'Legal Email',
    fields: [{ name: 'recipient', label: 'Recipient Name', placeholder: '' }, { name: 'subject', label: 'Subject', placeholder: '' }, { name: 'context', label: 'Context', placeholder: '' }]
  }
];"""

content = content[:start_idx] + new_templates + content[end_idx:]

with open("src/pages/Generator.tsx", "w") as f:
    f.write(content)

