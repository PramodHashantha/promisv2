import React, { useState } from 'react';
import { PurchasingRequestCreateProvider } from '../../../context/PurchasingRequestCreateContext';
import Step1TitleDescription from '../../../components/purchase-request/create-purchase-request/Step1TitleDescription';
import Step2BudgetDetails from '../../../components/purchase-request/create-purchase-request/Step2BudgetDetails';
import Step3ItemList from '../../../components/purchase-request/create-purchase-request/Step3ItemList';
import Step4ProcurementDetails from '../../../components/purchase-request/create-purchase-request/Step4ProcurementDetails';
import Step5SupplierDetails from '../../../components/purchase-request/create-purchase-request/Step5SupplierDetails';
import Step6ReviewSubmit from '../../../components/purchase-request/create-purchase-request/Step6ReviewSubmit';

const STEPS = [
  { label: 'Title / Description' },
  { label: 'Budget Details' },
  { label: 'Item List' },
  { label: 'Procurement Details' },
  { label: 'Supplier Details' },
  { label: 'PR View' },
];

const PurchasingRequestPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [prType, setPrType] = useState('Q'); // 'Q' or 'T' — updated by Step1

  const goNext = () => {
    setCurrentStep((s) => {
      // Skip Step 5 (Supplier Details, index 4) when it's a Tender
      if (s === 3 && prType === 'T') return 5;
      return Math.min(s + 1, STEPS.length - 1);
    });
  };

  const goBack = () => {
    setCurrentStep((s) => {
      if (s === 5 && prType === 'T') return 3;
      return Math.max(s - 1, 0);
    });
  };

  const stepComponents = [
    <Step1TitleDescription key="s1" onNext={goNext} onPrTypeChange={setPrType} />,
    <Step2BudgetDetails key="s2" onNext={goNext} onBack={goBack} />,
    <Step3ItemList key="s3" onNext={goNext} onBack={goBack} />,
    <Step4ProcurementDetails key="s4" onNext={goNext} onBack={goBack} />,
    <Step5SupplierDetails key="s5" onNext={goNext} onBack={goBack} />,
    <Step6ReviewSubmit key="s6" onBack={goBack} />,
  ];

  return (
    <PurchasingRequestCreateProvider>
      <div className="min-h-screen bg-brand-background flex font-sans">
        <main className="flex-1 p-6 lg:p-10 overflow-auto relative">
          <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          <div className="max-w-5xl mx-auto relative z-10">
            {/* Page header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-brand-text">New Purchase Request</h1>
              <p className="text-sm text-brand-text-muted mt-1">
                Complete all steps to submit your purchasing request
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center mb-8 overflow-x-auto pb-2">
              {STEPS.map((step, idx) => {
                const isActive = idx === currentStep;
                const isDone = idx < currentStep;
                const isSkipped = idx === 4 && prType === 'T';

                return (
                  <React.Fragment key={idx}>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all
                          ${isActive ? 'bg-brand-primary text-brand-text-inverse' : ''}
                          ${isDone ? 'bg-brand-success text-brand-text-inverse' : ''}
                          ${!isActive && !isDone ? 'bg-brand-surface border border-brand-border-strong text-brand-text-muted' : ''}
                          ${isSkipped ? 'opacity-30' : ''}
                        `}
                      >
                        {isDone ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20,6 9,17 4,12" />
                          </svg>
                        ) : idx + 1}
                      </div>
                      <span className={`hidden sm:inline text-sm font-medium transition-colors
                        ${isActive ? 'text-brand-text' : 'text-brand-text-secondary'}
                        ${isSkipped ? 'opacity-30 line-through' : ''}
                      `}>
                        {step.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`flex-1 h-px mx-3 min-w-[20px] transition-colors ${isDone ? 'bg-brand-success' : 'bg-brand-border-strong'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Step content */}
            {stepComponents[currentStep]}
          </div>
        </main>
      </div>
    </PurchasingRequestCreateProvider>
  );
};

export default PurchasingRequestPage;