import React from 'react';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import PurchasingRequestViewFromInventory from '@/components/purchasingRequestFromInventory/PurchasingRequestViewFromInventory';

/**
 * Index.jsx — View Purchase Request From Inventory page
 *
 * Exact conversion of frmPurchasingRequestViewFromInventory.aspx.
 *
 * Page layout:
 *  ─ Top card  : Request List table (all inventory purchase requests)
 *                Filter radio: Show Recent | <dynamic statuses> | Show All
 *                View (👁) button → reveals detail panel below
 *                Select (✏) button → navigates to /PurchasingRequest?ID=...&MOD=1
 *  ─ Bottom card: Request List Details (shown when View button clicked)
 *                 Hidden by default — exact equivalent of old divView Visible=false
 *
 * No tabs, no forms, no approve/reject — pure read + navigate.
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
        <PurchasingRequestViewFromInventory />
      </div>

      <Footer />
    </>
  );
};

export default Index;