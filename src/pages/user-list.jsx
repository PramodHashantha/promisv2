import React, { useEffect, useState } from "react";
import UserTable from "@/components/users/UserTable";
import UserHeader from "@/components/users/UserHeader";
import PageHeader from "@/components/shared/pageHeader/PageHeader";
const UserList = () => {
  return (
    <>
      <PageHeader>
        <UserHeader />
      </PageHeader>
      <div className="main-content">
        <div className="row">
          <UserTable />
        </div>
      </div>
    </>
  );
};

export default UserList;
