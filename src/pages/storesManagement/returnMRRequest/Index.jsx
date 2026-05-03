import React from 'react';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import HeadPersonApproval from '@/components/storesManagement/returnMRRequest/HeadPersonApproval';

/**
 * Index.jsx — Return MR Request page
 *
 * Exact conversion of frmReturnMRRequest.aspx.
 * This page is purely the head person approval/reject workflow.
 * No tabs, no Excel, no SK approval, no creator view.
 */

const Index = () => {
  return (
    <>
      <PageHeader>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#1f2937' }}>
          Return MR Request
        </h1>
      </PageHeader>

      <div className="main-content">
        <HeadPersonApproval />
      </div>

      <Footer />
    </>
  );
};

export default Index;