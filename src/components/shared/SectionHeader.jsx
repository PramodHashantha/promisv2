import React from 'react';

const SectionHeader = ({ title, subtitle, rightContent }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
      <div>
        <h3 className="text-2xl font-bold text-brand-text tracking-tight leading-none">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-brand-text-secondary mt-1 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {rightContent && (
        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
          {rightContent}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
