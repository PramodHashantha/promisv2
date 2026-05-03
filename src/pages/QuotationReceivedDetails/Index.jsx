import React from "react";

import SectionHeader from "@/components/shared/SectionHeader";
import QuotationReceivedDetails from "@/components/QuotationReceivedDetails/QuotationReceivedDetails";

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
                    title="Quotation Received Details"
                // subtitle="Monitor and manage all warehouse locations and inventory status"

                />
                <br></br>
                <QuotationReceivedDetails />
            </div>

            {/* <Footer /> */}
        </>
    );
};

export default Index;
