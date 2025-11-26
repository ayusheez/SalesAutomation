import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', noPadding = false, ...props }) => {
  return (
    <div 
      className={`bg-[#1e1d3d]/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-card overflow-hidden transition-all duration-300 ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center ${className}`} {...props}>
    {children}
  </div>
);

export const CardBody: React.FC<CardProps> = ({ children, className = '', noPadding, ...props }) => (
  <div className={`${noPadding ? 'p-0' : 'p-6'} ${className}`} {...props}>
    {children}
  </div>
);