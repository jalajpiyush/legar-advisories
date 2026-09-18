import re

with open("src/pages/Create.tsx", "r") as f:
    content = f.read()

old_templates = """const createTemplates = [
  { id: 1, title: "Rental Agreement", description: "Draft a legally binding rental agreement for residential or commercial properties.", icon: FileText, category: "Property", color: "text-blue-600", bg: "bg-blue-50" },
  { id: 2, title: "Non-Disclosure Agreement (NDA)", description: "Protect sensitive information with a comprehensive mutual or one-way NDA.", icon: FileCode, category: "Corporate", color: "text-amber-600", bg: "bg-amber-50" },
  { id: 3, title: "Employment Contract", description: "Create an employment agreement outlining terms, benefits, and obligations.", icon: Wand2, category: "HR", color: "text-purple-600", bg: "bg-purple-50" },
  { id: 4, title: "Partnership Agreement", description: "Draft a partnership contract detailing equity, roles, and dissolution.", icon: FileText, category: "Corporate", color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: 5, title: "Privacy Policy", description: "Generate a GDPR and IT Act compliant privacy policy for websites and apps.", icon: CheckCircle2, category: "Compliance", color: "text-blue-600", bg: "bg-blue-50" },
  { id: 6, title: "Terms & Conditions", description: "Draft standard terms of service for software, websites, or services.", icon: FileCode, category: "Compliance", color: "text-gray-600 dark:text-neutral-400", bg: "bg-gray-100 dark:bg-neutral-800" },
  { id: 7, title: "Legal Notice", description: "Draft a formal legal notice for breach of contract, defamation, or other civil issues.", icon: ArrowRight, category: "Litigation", color: "text-red-600", bg: "bg-red-50" },
];"""

new_templates = """const createTemplates = [
  { id: 1, title: "Legal Notice", description: "Draft a formal legal notice for breach of contract, defamation, or civil issues.", icon: FileText, category: "Litigation", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10" },
  { id: 2, title: "Reply to Legal Notice", description: "Draft a legally sound reply to a received legal notice.", icon: ArrowRight, category: "Litigation", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-500/10" },
  { id: 3, title: "Complaint", description: "Draft a formal legal complaint for civil or criminal matters.", icon: CheckCircle2, category: "Litigation", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10" },
  { id: 4, title: "Affidavit", description: "Create a sworn statement of facts for court or official use.", icon: FileCode, category: "Documentation", color: "text-gray-600 dark:text-neutral-400", bg: "bg-gray-100 dark:bg-neutral-800" },
  { id: 5, title: "Agreement", description: "Draft a general agreement or contract between two or more parties.", icon: FileText, category: "Contracts", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
  { id: 6, title: "NDA", description: "Protect sensitive information with a comprehensive Non-Disclosure Agreement.", icon: Wand2, category: "Corporate", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
  { id: 7, title: "Rent Agreement", description: "Draft a legally binding rent or lease agreement for properties.", icon: FileText, category: "Property", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  { id: 8, title: "Employment Agreement", description: "Create an employment contract outlining terms, benefits, and obligations.", icon: CheckCircle2, category: "HR", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10" },
  { id: 9, title: "Consumer Complaint", description: "Draft a complaint for the consumer forum against deficient services.", icon: FileText, category: "Consumer", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
  { id: 10, title: "RTI Application", description: "File a Right to Information (RTI) application to seek information from govt bodies.", icon: FileCode, category: "Civic", color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-500/10" },
  { id: 11, title: "Legal Email", description: "Draft professional and legally sound correspondence.", icon: ArrowRight, category: "Communication", color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-500/10" },
];"""

content = content.replace(old_templates, new_templates)

with open("src/pages/Create.tsx", "w") as f:
    f.write(content)

