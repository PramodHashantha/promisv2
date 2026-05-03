import { createBrowserRouter } from "react-router-dom";
import { Navigate } from "react-router-dom";
import RootLayout from "../layout/root";
import Home from "../pages/dashboard/Index";
import Analytics from "../pages/analytics";
import ReportsSales from "../pages/reports-sales";
import ReportsLeads from "../pages/reports-leads";
import ReportsProject from "../pages/reports-project";
import AppsChat from "../pages/apps-chat";
import LayoutApplications from "../layout/layoutApplications";
import AppsEmail from "../pages/apps-email";
import ReportsTimesheets from "../pages/reports-timesheets";
import LoginCover from "../pages/login-cover";
import AppsTasks from "../pages/apps-tasks";
import AppsNotes from "../pages/apps-notes";
import AppsCalender from "../pages/apps-calender";
import AppsStorage from "../pages/apps-storage";
import Appointment from '../pages/userManagement/Appointment/Index'
import Proposalist from "../pages/proposal-list";
import CustomersList from "../pages/customers-list";
import UserSection from "../pages/userManagement/section/Index";
import UserAppointments from "../pages/user-appointmnets";
import UserList from "../pages/user-list";
import ProposalView from "../pages/proposal-view";
import ProposalEdit from "../pages/proposal-edit";
import LeadsList from "../pages/leadsList";
import CustomersView from "../pages/customers-view";
import CustomersCreate from "../pages/customers-create";
import ProposalCreate from "../pages/proposal-create";
import LeadsView from "../pages/leads-view";
import LeadsCreate from "../pages/leads-create";
import PaymentList from "../pages/payment-list";
import PaymentView from "../pages/payment-view/";
import PaymentCreate from "../pages/payment-create";
import ProjectsList from "../pages/projects-list";
import ProjectsView from "../pages/projects-view";
import ProjectsCreate from "../pages/projects-create";
import SettingsGaneral from "../pages/settings-ganeral";
import LayoutSetting from "../layout/layoutSetting";
import SettingsSeo from "../pages/settings-seo";
import SettingsTags from "../pages/settings-tags";
import SettingsEmail from "../pages/settings-email";
import SettingsTasks from "../pages/settings-tasks";
import SettingsLeads from "../pages/settings-leads";
import SettingsMiscellaneous from "../pages/settings-miscellaneous";
import SettingsRecaptcha from "../pages/settings-recaptcha";
import SettingsLocalization from "../pages/settings-localization";
import SettingsCustomers from "../pages/settings-customers";
import SettingsGateways from "../pages/settings-gateways";
import SettingsFinance from "../pages/settings-finance";
import SettingsSupport from "../pages/settings-support";
import LayoutAuth from "../layout/layoutAuth";
import LoginMinimal from "../pages/login-minimal";
import LoginCreative from "../pages/login-creative";
import LoginDevPage from "../pages/login-dev";
import RegisterCover from "../pages/register-cover";
import RegisterMinimal from "../pages/register-minimal";
import RegisterCreative from "../pages/register-creative";
import LoginFirstTimeReset from "../components/authentication/login-first-time-reset";
import ResetCover from "../pages/reset-cover";
import ResetMinimal from "../pages/reset-minimal";
import ResetCreative from "../pages/reset-creative";
import ErrorCover from "../pages/error-cover";
import ErrorCreative from "../pages/error-creative";
import ErrorMinimal from "../pages/error-minimal";
import OtpCover from "../pages/otp-cover";
import OtpMinimal from "../pages/otp-minimal";
import OtpCreative from "../pages/otp-creative";
import MaintenanceCover from "../pages/maintenance-cover";
import MaintenanceMinimal from "../pages/maintenance-minimal";
import MaintenanceCreative from "../pages/maintenance-creative";
import HelpKnowledgebase from "../pages/help-knowledgebase";
import WidgetsLists from "../pages/widgets-lists";
import WidgetsTables from "../pages/widgets-tables";
import WidgetsCharts from "../pages/widgets-charts";
import WidgetsStatistics from "../pages/widgets-statistics";
import WidgetsMiscellaneous from "../pages/widgets-miscellaneous";
import ManageWarehouse from "../pages/storesManagement/manageWarehouse/Index";
import WarehouseRackManagement from "../pages/storesManagement/manageWarehouse/WarehouseRackManagementIndex.jsx";
import ViewStores from "../pages/storesManagement/viewStores/Index";
import StoresOut from "../pages/storesManagement/storesOut/Index";
import MaterialRequest from "../pages/storesManagement/material-request/Index";
import MaterialRequestAll from "../pages/storesManagement/materialRequestAll/Index";
import StoresIn from "../pages/storesManagement/storesIn/Index";
import ViewMaterialRequest from "../pages/storesManagement/viewMaterialRequest/Index";
import LabStores from "../pages/storesManagement/labStores/Index";
import StoresOutFromInventory from "../pages/storesManagement/storeOutFromInventory/Index";
import StockManuallyEntry from "../pages/storesManagement/stockManuallyEntry/Index";
import StoreWarehouseDetailsView from "../pages/storesManagement/ManageWarehouseAdmin/StoreWarehouseDetailsView.jsx";
import StoreVerification from "../pages/storesManagement/StoreVerification/Index";
import AV4Form from "../pages/storesManagement/av4Form/Index";
import VerificationRackManagement from "../pages/storesManagement/verificationRackManagement/Index";
// import AccessControl from "../pages/userManagement/accessControl/Index";
import Level from "../pages/userManagement/level/Index";
import AppointmentUpdate from "../pages/userManagement/AppointmentUpdate/Index";
import StoresVerification from "../pages/storesManagement/storesVerification/Index";
import StoresVerificationPriceUpdate from "../pages/storesManagement/storesVerificationPriceUpdate/Index";
import ItemMove from "../pages/ItemMove.jsx";
import StoresVerificationManualIn from "../pages/storesManagement/storeVerificationManualIn/Index.jsx";
import StoreOutDetail from "../pages/storesManagement/storesOut/StoreOutDetail";
import ReturnMR from "../pages/storesManagement/returnMR/Index";
import ReturnMRRequest from "../pages/storesManagement/returnMRRequest/Index";
import PurchasingRequestViewFromInventory from "../pages/PurchasingRequestViewFromInventory/Index";
import PurchaseRequestUploadItems from "../pages/PurchaseRequestUploadItems/Index";
import QuotationReceivedDetails from "../pages/QuotationReceivedDetails/Index";
import ProtectedRoute from "./ProtectedRoute";
import Settings from "../pages/settings/navigation/Index";
import Timeline from "../pages/timeline/Index";
import PurchasingRequest from "../pages/purchase-request/create-purchase-request/index";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LayoutAuth />,
    children: [
      {
        path: "/",
        element: <Navigate to="/authentication/login/minimal" replace />
      },
      // ... (keep auth routes as is)
      {
        path: "/authentication/login/cover",
        element: <LoginCover />
      },
      {
        path: "/authentication/login/minimal",
        element: <LoginMinimal />
      },
      {
        path: "/authentication/login/creative",
        element: <LoginCreative />
      },
      {
        path: "/authentication/login/dev",
        element: <LoginDevPage />
      },
      {
        path: "/authentication/register/cover",
        element: <RegisterCover />
      },
      {
        path: "/authentication/register/minimal",
        element: <RegisterMinimal />
      },
      {
        path: "/authentication/register/creative",
        element: <RegisterCreative />
      },
      {
        path: "/authentication/reset/cover",
        element: <ResetCover />
      },
      {
        path: "/authentication/reset/minimal",
        element: <ResetMinimal />
      },
      {
        path: "/authentication/reset/creative",
        element: <ResetCreative />
      },
      {
        path: "/authentication/login/first-time-reset",
        element: <LoginFirstTimeReset />
      },
      {
        path: "/authentication/404/cover",
        element: <ErrorCover />
      },
      {
        path: "/authentication/404/minimal",
        element: <ErrorMinimal />
      },
      {
        path: "/authentication/404/creative",
        element: <ErrorCreative />
      },
      {
        path: "/authentication/verify/cover",
        element: <OtpCover />
      },
      {
        path: "/authentication/verify/minimal",
        element: <OtpMinimal />
      },
      {
        path: "/authentication/verify/creative",
        element: <OtpCreative />
      },
      {
        path: "/authentication/maintenance/cover",
        element: <MaintenanceCover />
      },
      {
        path: "/authentication/maintenance/minimal",
        element: <MaintenanceMinimal />
      },
      {
        path: "/authentication/maintenance/creative",
        element: <MaintenanceCreative />
      }
    ]
  },
  {
    path: "/",
    element: <ProtectedRoute />, // Wrap with ProtectedRoute
    children: [
      {
        path: "/",
        element: <RootLayout />,
        children: [
          {
            path: "/dashboard",
            element: <Home />
          },
          {
            path: "/purchasingrequest",
            element: <PurchasingRequest />
          },
          {
            path: "/dashboards/analytics",
            element: <Analytics />
          },
          {
            path: "/reports/sales",
            element: <ReportsSales />
          },
          {
            path: "/reports/leads",
            element: <ReportsLeads />
          },
          {
            path: "/reports/project",
            element: <ReportsProject />
          },
          {
            path: "/reports/timesheets",
            element: <ReportsTimesheets />
          },
          {
            path: "/proposal/list",
            element: <Proposalist />
          },
          {
            path: "/proposal/view",
            element: <ProposalView />
          },
          {
            path: "/proposal/edit",
            element: <ProposalEdit />
          },
          {
            path: "/proposal/create",
            element: <ProposalCreate />
          },
          {
            path: "/payment/list",
            element: <PaymentList />
          },
          {
            path: "/payment/view",
            element: <PaymentView />
          },
          {
            path: "/payment/create",
            element: <PaymentCreate />
          },
          {
            path: "/users",
            element: <UserList />
          },
          {
            path: "/section",
            element: <UserSection />
          },
          {
            path: "/customers/appointments",
            element: <UserAppointments />
          },
          {
            path: "/profile",
            element: <CustomersView />
          },
          {
            path: "/appointmentTable",
            element: <Appointment />
          },
          {
            path: "/customers/create",
            element: <CustomersCreate />
          },
          // {
          //   path: "/customers/AccessControl",
          //   element: <AccessControl />
          // },
          {
            path: "/customers/Level",
            element: <Level />
          },
          {
            path: "/customers/AppointmentUpdate",
            element: <AppointmentUpdate />
          },
          {
            path: "/stockWareHouse",
            element: <ManageWarehouse />
          },
          {
            path: "/stockWareHouse/warehouseRackManagement",
            element: <WarehouseRackManagement />
          },
          {
            path: "/stores/materialRequest",
            element: <MaterialRequest />
          },
          {
            path: "/stores/ItemMove",
            element: <ItemMove />
          },
          {
            path: "/quotationReceivedDetails",
            element: <QuotationReceivedDetails />
          },
          {
            path: "/storesout",
            element: <StoresOut />
          },
          {
            path: "/storesout/view",
            element: <StoreOutDetail />
          },
          {
            path: "/storesView",
            element: <ViewStores />
          },
          {
            path: "/labStore",
            element: <LabStores />
          },
          {
            path: "/manageWarehouseAdmin",
            element: <StoreWarehouseDetailsView />
            //path: "/stores/RequestViewAll",
            //element: <MaterialRequestAll />
          },
          {
            path: "/stockVerification",
            element: <StoresVerification />
          },
          {
            path: "/stores/StockVerificationStartAndEnd",
            element: <StoreVerification />
          },
          {
            path: "/stores/StockVerificationPriceUpdate",
            element: <StoresVerificationPriceUpdate />
          },
          {
            path: "/stores/StockVerificationManualIn",
            element: <StoresVerificationManualIn />
          },
          {
            path: "/stores/returnMR",
            element: <ReturnMR />
          },
          {
            path: "/stores/returnMRRequest",
            element: <ReturnMRRequest />
          },
          {
            path: "/stores/AV4formStore",
            element: <AV4Form />
          },
          {
            path: "/RequestViewAll",
            element: <MaterialRequestAll />
          },
          {
            path: "/stockIn",
            element: <StoresIn />
          },
          {
            path: "/RequestView",
            element: <ViewMaterialRequest />
          },
          {
            path: "/stores/stockManualEntry",
            element: <StockManuallyEntry />
          },
          {
            path: "/stores/verificationRackManagement",
            element: <VerificationRackManagement />
          },
          {
            path: "/stores/verificationRackManagement",
            element: <VerificationRackManagement />
          },
          {
            path: "/requestViewFromInventory",
            element: <PurchasingRequestViewFromInventory />
          },
          {
            path: "/purchaseRequestUploadItems",
            element: <PurchaseRequestUploadItems />
          },
          {
            path: "/stores/storeOutFromInventory",
            element: <StoresOutFromInventory />
          },
          {
            path: "/timeline",
            element: <Timeline />
          },
          {
            path: "/leads/list",
            element: <LeadsList />
          },
          {
            path: "/leads/view",
            element: <LeadsView />
          },
          {
            path: "/leads/create",
            element: <LeadsCreate />
          },
          {
            path: "/projects/list",
            element: <ProjectsList />
          },
          {
            path: "/projects/view",
            element: <ProjectsView />
          },
          {
            path: "/projects/create",
            element: <ProjectsCreate />
          },
          {
            path: "/widgets/lists",
            element: <WidgetsLists />
          },
          {
            path: "/widgets/tables",
            element: <WidgetsTables />
          },
          {
            path: "/widgets/charts",
            element: <WidgetsCharts />
          },
          {
            path: "/widgets/statistics",
            element: <WidgetsStatistics />
          },
          {
            path: "/widgets/miscellaneous",
            element: <WidgetsMiscellaneous />
          },
          {
            path: "/help/knowledgebase",
            element: <HelpKnowledgebase />
          },
          {
            path: "/settings",
            element: <Settings />
          },
        ]
      },
      {
        path: "/",
        element: <LayoutApplications />,
        children: [
          {
            path: "/applications/chat",
            element: <AppsChat />
          },
          {
            path: "/applications/email",
            element: <AppsEmail />
          },
          {
            path: "/applications/tasks",
            element: <AppsTasks />
          },
          {
            path: "/applications/notes",
            element: <AppsNotes />
          },
          {
            path: "/applications/calender",
            element: <AppsCalender />
          },
          {
            path: "/applications/storage",
            element: <AppsStorage />
          }
        ]
      },
      {
        path: "/",
        element: <LayoutSetting />,
        children: [
          {
            path: "/settings/ganeral",
            element: <SettingsGaneral />
          },
          {
            path: "/settings/seo",
            element: <SettingsSeo />
          },
          {
            path: "/settings/tags",
            element: <SettingsTags />
          },
          {
            path: "/settings/email",
            element: <SettingsEmail />
          },
          {
            path: "/settings/tasks",
            element: <SettingsTasks />
          },
          {
            path: "/settings/leads",
            element: <SettingsLeads />
          },
          {
            path: "/settings/Support",
            element: <SettingsSupport />
          },
          {
            path: "/settings/finance",
            element: <SettingsFinance />
          },
          {
            path: "/settings/gateways",
            element: <SettingsGateways />
          },
          {
            path: "/settings/customers",
            element: <SettingsCustomers />
          },
          {
            path: "/settings/localization",
            element: <SettingsLocalization />
          },
          {
            path: "/settings/recaptcha",
            element: <SettingsRecaptcha />
          },
          {
            path: "/settings/miscellaneous",
            element: <SettingsMiscellaneous />
          }
        ]
      }
    ]
  },
  {
    path: "*",
    element: <ErrorCover />
  }
]);
