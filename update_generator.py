import re

with open("src/pages/Generator.tsx", "r") as f:
    content = f.read()

# 1. Add errors state
state_block = """  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});"""

content = content.replace("  const [currentDocId, setCurrentDocId] = useState<string | null>(null);", state_block)

# 2. Add handleStartNew clear errors
content = content.replace("setGeneratedContent(\"\");", "setGeneratedContent(\"\");\n    setErrors({});")

# 3. Rewrite handleNextStep2
old_step_2 = """  const handleNextStep2 = () => {
    // Validate required visible fields
    const missing = visibleFields.filter(f => f.required && !formData[f.id]);
    if (missing.length > 0) {
      alert(`Please fill in required fields: ${missing.map(f => f.label).join(", ")}`);
      return;
    }
    setStep(3);
  };"""

new_step_2 = """  const handleNextStep2 = () => {
    const newErrors: Record<string, string> = {};
    let hasError = false;

    visibleFields.forEach(f => {
      const value = formData[f.id];

      // Required check
      if (f.required && (value === undefined || value === '' || value === null)) {
        newErrors[f.id] = `${f.label} is required`;
        hasError = true;
        return;
      }

      // Advanced Validation
      if (value && f.validation) {
        if (typeof value === 'string') {
          if (f.validation.min !== undefined && value.length < f.validation.min) {
            newErrors[f.id] = f.validation.customError || `Minimum length is ${f.validation.min} characters`;
            hasError = true;
            return;
          }
          if (f.validation.max !== undefined && value.length > f.validation.max) {
            newErrors[f.id] = f.validation.customError || `Maximum length is ${f.validation.max} characters`;
            hasError = true;
            return;
          }
          if (f.validation.pattern) {
            const regex = new RegExp(f.validation.pattern);
            if (!regex.test(value)) {
              newErrors[f.id] = f.validation.customError || `Invalid format`;
              hasError = true;
              return;
            }
          }
        } else if (typeof value === 'number') {
          if (f.validation.min !== undefined && value < f.validation.min) {
            newErrors[f.id] = f.validation.customError || `Minimum value is ${f.validation.min}`;
            hasError = true;
            return;
          }
          if (f.validation.max !== undefined && value > f.validation.max) {
            newErrors[f.id] = f.validation.customError || `Maximum value is ${f.validation.max}`;
            hasError = true;
            return;
          }
        }
      }
    });

    setErrors(newErrors);
    if (hasError) return;
    setStep(3);
  };"""

content = content.replace(old_step_2, new_step_2)

# 4. Update inputs rendering
old_inputs = """                        <label className="block text-[13px] font-medium text-gray-700 dark:text-neutral-300 mb-1.5">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea value={formData[field.id] || ''} onChange={e => setFormData({...formData, [field.id]: e.target.value})} placeholder={field.placeholder} className="w-full bg-gray-50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-800 rounded-lg px-4 py-2.5 text-[14px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c6a87c]/20 focus:border-[#c6a87c] transition-all min-h-[100px]" />
                        ) : field.type === 'select' ? (
                          <select value={formData[field.id] || ''} onChange={e => setFormData({...formData, [field.id]: e.target.value})} className="w-full bg-gray-50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-800 rounded-lg px-4 py-2.5 text-[14px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c6a87c]/20 focus:border-[#c6a87c] transition-all">
                            <option value="">Select option</option>
                            {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : field.type === 'boolean' ? (
                          <div className="flex items-center gap-3 h-10">
                            <button onClick={() => setFormData({...formData, [field.id]: true})} className={`px-4 py-1.5 rounded-md text-sm font-medium border ${formData[field.id] === true ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'bg-white text-gray-700 border-gray-200 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800'}`}>Yes</button>
                            <button onClick={() => setFormData({...formData, [field.id]: false})} className={`px-4 py-1.5 rounded-md text-sm font-medium border ${formData[field.id] === false ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'bg-white text-gray-700 border-gray-200 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800'}`}>No</button>
                          </div>
                        ) : (
                          <input type={field.type} value={formData[field.id] || ''} onChange={e => setFormData({...formData, [field.id]: e.target.value})} placeholder={field.placeholder} className="w-full bg-gray-50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-800 rounded-lg px-4 py-2.5 text-[14px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c6a87c]/20 focus:border-[#c6a87c] transition-all" />
                        )}"""

new_inputs = """                        <label className="block text-[13px] font-medium text-gray-700 dark:text-neutral-300 mb-1.5">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea value={formData[field.id] || ''} onChange={e => { setFormData({...formData, [field.id]: e.target.value}); if (errors[field.id]) setErrors({...errors, [field.id]: ''}); }} placeholder={field.placeholder} className={`w-full bg-gray-50 dark:bg-neutral-800/50 border rounded-lg px-4 py-2.5 text-[14px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all min-h-[100px] ${errors[field.id] ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-neutral-800 focus:ring-[#c6a87c]/20 focus:border-[#c6a87c]'}`} />
                        ) : field.type === 'select' ? (
                          <select value={formData[field.id] || ''} onChange={e => { setFormData({...formData, [field.id]: e.target.value}); if (errors[field.id]) setErrors({...errors, [field.id]: ''}); }} className={`w-full bg-gray-50 dark:bg-neutral-800/50 border rounded-lg px-4 py-2.5 text-[14px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${errors[field.id] ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-neutral-800 focus:ring-[#c6a87c]/20 focus:border-[#c6a87c]'}`}>
                            <option value="">Select option</option>
                            {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : field.type === 'boolean' ? (
                          <div className="flex items-center gap-3 h-10">
                            <button onClick={() => { setFormData({...formData, [field.id]: true}); if (errors[field.id]) setErrors({...errors, [field.id]: ''}); }} className={`px-4 py-1.5 rounded-md text-sm font-medium border ${formData[field.id] === true ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'bg-white text-gray-700 border-gray-200 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800'} ${errors[field.id] ? 'border-red-500' : ''}`}>Yes</button>
                            <button onClick={() => { setFormData({...formData, [field.id]: false}); if (errors[field.id]) setErrors({...errors, [field.id]: ''}); }} className={`px-4 py-1.5 rounded-md text-sm font-medium border ${formData[field.id] === false ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'bg-white text-gray-700 border-gray-200 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800'} ${errors[field.id] ? 'border-red-500' : ''}`}>No</button>
                          </div>
                        ) : (
                          <input type={field.type} value={formData[field.id] || ''} onChange={e => { setFormData({...formData, [field.id]: e.target.value}); if (errors[field.id]) setErrors({...errors, [field.id]: ''}); }} placeholder={field.placeholder} className={`w-full bg-gray-50 dark:bg-neutral-800/50 border rounded-lg px-4 py-2.5 text-[14px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${errors[field.id] ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 dark:border-neutral-800 focus:ring-[#c6a87c]/20 focus:border-[#c6a87c]'}`} />
                        )}
                        {errors[field.id] && <p className="text-red-500 text-[12px] mt-1.5 font-medium animate-in fade-in">{errors[field.id]}</p>}"""

content = content.replace(old_inputs, new_inputs)

with open("src/pages/Generator.tsx", "w") as f:
    f.write(content)

print("Done.")
