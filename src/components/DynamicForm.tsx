import React, { useState } from 'react';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'date';
}

interface FormSchema {
  title: string;
  fields: FormField[];
}

export const DynamicForm = ({ schema, onSubmit, disabled }: { schema: FormSchema, onSubmit: (data: string) => void, disabled?: boolean }) => {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedStr = "Here are the details you requested:\n" + Object.entries(formData)
      .map(([key, value]) => {
        const field = schema.fields.find(f => f.id === key);
        return `- ${field?.label || key}: ${value}`;
      })
      .join('\n');
    onSubmit(formattedStr);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 rounded-xl w-full">
      <h3 className="font-semibold text-[15px] mb-4 text-gray-900 dark:text-white border-b border-gray-100 dark:border-neutral-800 pb-2">{schema.title}</h3>
      <div className="space-y-4">
        {schema.fields.map(field => (
          <div key={field.id}>
            <label className="block text-xs font-medium text-gray-700 dark:text-neutral-300 mb-1.5">{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                required
                disabled={disabled}
                className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50 px-3 py-2.5 text-[14px] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-shadow text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-neutral-500"
                onChange={e => setFormData({...formData, [field.id]: e.target.value})}
              />
            ) : (
              <input
                type={field.type === 'date' ? 'date' : 'text'}
                required
                disabled={disabled}
                className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50 px-3 py-2.5 text-[14px] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-shadow text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-neutral-500"
                onChange={e => setFormData({...formData, [field.id]: e.target.value})}
              />
            )}
          </div>
        ))}
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="mt-5 w-full bg-black dark:bg-white text-white dark:text-black py-2.5 rounded-lg text-[14px] font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50"
      >
        {disabled ? 'Submitted' : 'Submit Details'}
      </button>
    </form>
  );
}
