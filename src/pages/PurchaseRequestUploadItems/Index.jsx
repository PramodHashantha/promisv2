import React from "react";
import PageHeader from "@/components/shared/pageHeader/PageHeader";
import Footer from "@/components/shared/Footer";
import PurchaseRequestUploadItems from "@/components/purchaseRequestUploadItems/PurchaseRequestUploadItems";
import SectionHeader from "@/components/shared/SectionHeader";

const Index = () => {
  return (
    <>
      {/* <PageHeader>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "#1f2937" }}>
          Purchasing Request Upload Item List
        </h1>
      </PageHeader> */}
       

      <div className="main-content">
        <SectionHeader
                title="Purchasing Request Upload Item List"
                // subtitle="Monitor and manage all warehouse locations and inventory status"
                
              />
              <br></br>
        <PurchaseRequestUploadItems />
      </div>

      {/* <Footer /> */}
    </>
  );
};

export default Index;
