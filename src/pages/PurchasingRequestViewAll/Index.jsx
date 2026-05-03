import React from 'react';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import PurchasingRequestViewAll from '@/components/purchasingRequestViewAll/PurchasingRequestViewAll';

/**
 * Index.jsx — Purchasing Request View All page
 * Exact conversion of frmPurchasingRequestViewAll.aspx
 */

const Index = () => {
  return (
    <>
      <PageHeader>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#1f2937' }}>
          Purchasing Request View
        </h1>
      </PageHeader>

      <div className="main-content">
        <PurchasingRequestViewAll />
      </div>

      <Footer />
    </>
  );
};

export default Index;