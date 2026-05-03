import UserHeader from "@/components/users/UserHeader";
import PageHeader from "@/components/shared/pageHeader/PageHeader";
import MaterialRequestAllTable from "@/components/storesManagement/materialRequestAll/MaterialRequestAllTable";

const Index = () => {
  return (
    <>
      {/* <PageHeader>
        <UserHeader />
      </PageHeader> */}
      <div className="main-content">
        <div className="row">
          <MaterialRequestAllTable />
        </div>
      </div>
    </>
  )
}

export default Index