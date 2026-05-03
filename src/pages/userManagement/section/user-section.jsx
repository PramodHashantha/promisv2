import React, { useEffect, useState } from "react";
import UserTable from "@/components/users/UserTable";
import UserHeader from "@/components/users/UserHeader";
import PageHeader from "@/components/shared/pageHeader/PageHeader";
import Footer from "@/components/shared/Footer";
import SectionTable from "@/components/userManagement/section/SectionTable";
const UserSection = () => {
  return (
    <>
      <PageHeader>
        <UserHeader />
      </PageHeader>
      <div className="main-content">
        <div className="row">
          <SectionTable />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserSection;
