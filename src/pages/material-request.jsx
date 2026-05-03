import React from "react";
import PageHeader from "@/components/shared/pageHeader/PageHeader";
import UserHeader from "@/components/users/UserHeader";
import Footer from "@/components/shared/Footer";
import MaterialRequest from "@/components/material-request/materialRequest";

const materialRequest = () => {
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
      <Footer />
    </>
  );
};

export default materialRequest;
