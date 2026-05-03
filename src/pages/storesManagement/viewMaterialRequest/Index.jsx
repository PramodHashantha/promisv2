import React from 'react'
import PageHeader from "@/components/shared/pageHeader/PageHeader";
import UserHeader from "@/components/users/UserHeader";
import ViewMaterialRequestTable from '@/components/storesManagement/viewMaterialRequest/ViewMaterialRequestTable';

const Index = () => {
  return (
    <>
      <PageHeader>
        <UserHeader />
      </PageHeader>
      <div className="main-content">
        <div className="row">
          <ViewMaterialRequestTable />
        </div>
      </div>
    </>
  )
}

export default Index