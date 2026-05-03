import PageHeader from "@/components/shared/pageHeader/PageHeader";
import UserHeader from "@/components/users/UserHeader";
import Footer from "@/components/shared/Footer";
import MaterialRequest from "@/components/material-request/materialRequest";
//import React from "react";

const Index = () => {
  return (
    <>
      <PageHeader>
        <UserHeader />
      </PageHeader>
      <div className="main-content">
        <div className="row">
          <MaterialRequest />
        </div>
      </div>
    </>
  );
};
export default Index;
