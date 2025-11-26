import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="mb-4 last:mb-0">
      {label && <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">{label}</label>}
      <input
        className={`w-full bg-dark-surface border ${error ? 'border-error' : 'border-dark-secondary'} rounded-md px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-error mt-1">{error}</span>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ label, children, error, className = '', ...props }) => {
  return (
     <div className="mb-4 last:mb-0">
      {label && <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">{label}</label>}
      <div className="relative">
        <select
          className={`w-full bg-dark-surface border ${error ? 'border-error' : 'border-dark-secondary'} rounded-md px-3 py-2.5 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none appearance-none transition-all cursor-pointer ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
      {error && <span className="text-xs text-error mt-1">{error}</span>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="mb-4 last:mb-0">
      {label && <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">{label}</label>}
      <textarea
        className={`w-full bg-dark-surface border ${error ? 'border-error' : 'border-dark-secondary'} rounded-md px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all min-h-[100px] custom-scrollbar ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-error mt-1">{error}</span>}
    </div>
  );
};