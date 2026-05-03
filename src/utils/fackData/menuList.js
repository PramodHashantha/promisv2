export const menuList = [
  {
    id: 0,
    name: "dashboards",
    path: "/dashboards/home",
    icon: "feather-airplay",
    dropdownMenu: [
      //   {
      //     id: 1,
      //     name: "CRM",
      //     path: "/CRM",
      //     subdropdownMenu: false
      //   },
      {
        id: 2,
        name: "Analytics",
        path: "/dashboards/analytics",
        subdropdownMenu: false
      }
    ]
  },
  {
    id: 1,
    name: "reports",
    path: "#",
    icon: "feather-cast",
    dropdownMenu: [
      {
        id: 1,
        name: "Sales Report",
        path: "/reports/sales",
        subdropdownMenu: false
      },
      {
        id: 2,
        name: "Leads Report",
        path: "/reports/leads",
        subdropdownMenu: false
      },
      {
        id: 3,
        name: "Project Report",
        path: "/reports/project",
        subdropdownMenu: false
      },
      {
        id: 4,
        name: "Timesheets Report",
        path: "/reports/timesheets",
        subdropdownMenu: false
      }
    ]
  },
  {
    id: 2,
    name: "applications",
    path: "#",
    icon: "feather-send",
    dropdownMenu: [
      {
        id: 1,
        name: "Chat",
        path: "/applications/chat",
        subdropdownMenu: false
      },
      {
        id: 2,
        name: "Email",
        path: "/applications/email",
        subdropdownMenu: false
      },
      {
        id: 3,
        name: "Tasks",
        path: "/applications/tasks",
        subdropdownMenu: false
      },
      {
        id: 4,
        name: "Notes",
        path: "/applications/notes",
        subdropdownMenu: false
      },
      {
        id: 5,
        name: "Storage",
        path: "/applications/storage",
        subdropdownMenu: false
      },
      {
        id: 6,
        name: "Calender",
        path: "/applications/calender",
        subdropdownMenu: false
      }
    ]
  },
  // {
  //     id: 3,
  //     name: "proposal",
  //     path: "#",
  //     icon: 'feather-sign',
  //     dropdownMenu: [
  //         {
  //             id: 1,
  //             name: "Proposal",
  //             path: "/proposal/list",
  //             subdropdownMenu: false
  //         },
  //         {
  //             id: 2,
  //             name: "Proposal View",
  //             path: "/proposal/view",
  //             subdropdownMenu: false
  //         },
  //         {
  //             id: 3,
  //             name: "Proposal Edit",
  //             path: "/proposal/edit",
  //             subdropdownMenu: false
  //         },
  //         {
  //             id: 4,
  //             name: "Proposal Create",
  //             path: "/proposal/create",
  //             subdropdownMenu: false
  //         },

  //     ],
  // },
  // {
  //     id: 4,
  //     name: "payment",
  //     path: "#",
  //     icon: 'feather-dollar-sign',
  //     dropdownMenu: [
  //         {
  //             id: 1,
  //             name: "Payment",
  //             path: "/payment/list",
  //             subdropdownMenu: false
  //         },
  //         {
  //             id: 2,
  //             name: "Invoice View",
  //             path: "/payment/view",
  //             subdropdownMenu: false
  //         },
  //         {
  //             id: 4,
  //             name: "Invoice Create",
  //             path: "/payment/create",
  //             subdropdownMenu: false
  //         }
  //     ]
  // },
  {
    id: 1,
    name: "Users",
    path: "#",
    icon: "feather-users",
    dropdownMenu: [
      {
        id: 1,
        name: "Users",
        path: "/customers/list",
        subdropdownMenu: false
      },
      {
        id: 2,
        name: "Users View",
        path: "/customers/view",
        subdropdownMenu: false
      },
      {
        id: 3,
        name: "Users Create",
        path: "/customers/create",
        subdropdownMenu: false
      },
      {
        id: 3,
        name: "Section",
        path: "/customers/section",
        subdropdownMenu: false
      },
      {
        id: 4,
        name: "Appointments",
        path: "/customers/appointments",
        subdropdownMenu: false
      },
      {
        id: 5,
        name: "Access Control",
        path: "/customers/accessControl",
        subdropdownMenu: false
      },
      {
        id: 6,
        name: "Level",
        path: "/customers/Level",
        subdropdownMenu: false
      },
      {
        id: 7,
        name: "Change My Head Person",
        path: "/customers/AppointmentUpdate",
        subdropdownMenu: false
      }
    ]
  },

  {
    id: 2,
    name: "Stores Management",
    path: "#",
    icon: "lu-warehouse",
    dropdownMenu: [
      {
        id: 1,
        name: "Manage Warehouse",
        path: "/stores/stockWareHouse",
        subdropdownMenu: false
      },
      {
        id: 2,
        name: "View Stores",
        path: "/stores/stockView",
        subdropdownMenu: false
      },
      {
        id: 3,
        name: "Stores Out",
        path: "/stores/stockOut",
        subdropdownMenu: false
      },
      {
        id: 4,
        name: "Lab Stores",
        path: "/stores/labStore",
        subdropdownMenu: false
      },
      {
        id: 5,
        name: "Material Request All",
        path: "/stores/RequestViewAll",
        subdropdownMenu: false
      },
      {
        id: 6,
        name: "Stores In",
        path: "/stores/stockIn",
        subdropdownMenu: false
      },
      {
        id: 7,
        name: "View Material Request",
        path: "/stores/RequestView",
        subdropdownMenu: false
      },
      {
        id: 8,
        name: "Manage Warehouse Admin",
        path: "/stores/ManageWarehouseAdmin",
        subdropdownMenu: false
      },
      {
        id: 9,
        name: "Material Request",
        path: "/stores/materialRequest"
      },
      {
        id: 10,
        name: "Store Verification",
        path: "/stores/StockVerification",
        subdropdownMenu: false
      },
      {
        id: 11,
        name: "Store Verification Management (Verification Period)",
        path: "/stores/StockVerificationStartAndEnd",
        subdropdownMenu: false
      },
      {
        id: 12,
        name: "Store Verification Manual In",
        path: "/stores/StockVerificationManualIn",
        subdropdownMenu: false
      },
      {
        id: 13,
        name: "Store Verification Price Update",
        path: "/stores/StockVerificationPriceUpdate",
        subdropdownMenu: false
      },
      {
        id: 14,
        name: "AV4 Stock Out",
        path: "/stores/AV4FormStore",
        subdropdownMenu: false
      },
      {
        id: 15,
        name: "Stock Manual Entry",
        path: "/stores/stockManualEntry",
        subdropdownMenu: false
      },
      {
        id: 16,
        name: "Enable/Disable Racks (Verification Period)",
        path: "/stores/verificationRackManagement",
        subdropdownMenu: false
      },
      { id: 17,
        name: "Return MR",
        path: "/stores/returnMR",
        subdropdownMenu: false
      },
      { id: 18,
        name: "Return MR Request",
        path: "/stores/returnMRRequest",
        subdropdownMenu: false
      },
    ]
  },
  // {
  //     id: 6,
  //     name: "leads",
  //     path: "#",
  //     icon: 'feather-alert-circle',
  //     dropdownMenu: [
  //         {
  //             id: 1,
  //             name: "Leads",
  //             path: "/leads/list",
  //             subdropdownMenu: false
  //         },
  //         {
  //             id: 2,
  //             name: "Leads View",
  //             path: "/leads/view",
  //             subdropdownMenu: false
  //         },
  //         {
  //             id: 3,
  //             name: "Leads Create",
  //             path: "/leads/create",
  //             subdropdownMenu: false
  //         }
  //     ]
  // },
  // {
  //     id: 7,
  //     name: "projects",
  //     path: "#",
  //     icon: 'feather-briefcase',
  //     dropdownMenu: [
  //         {
  //             id: 1,
  //             name: "Projects",
  //             path: "/projects/list",
  //             subdropdownMenu: false
  //         },
  //         {
  //             id: 2,
  //             name: "Projects View",
  //             path: "/projects/view",
  //             subdropdownMenu: false
  //         },
  //         {
  //             id: 3,
  //             name: "Projects Create",
  //             path: "/projects/create",
  //             subdropdownMenu: false
  //         }
  //     ]
  // },
  // {
  //     id: 8,
  //     name: "widgets",
  //     path: "#",
  //     icon: 'feather-layout',
  //     dropdownMenu: [
  //         {
  //             id: 1,
  //             name: "Lists",
  //             path: "/widgets/lists",
  //             subdropdownMenu: false
  //         },
  //         {
  //             id: 2,
  //             name: "Tables",
  //             path: "/widgets/tables",
  //             subdropdownMenu: false
  //         },
  //         {
  //             id: 3,
  //             name: "Charts",
  //             path: "/widgets/charts",
  //             subdropdownMenu: false
  //         },
  //         {
  //             id: 4,
  //             name: "Statistics",
  //             path: "/widgets/statistics",
  //             subdropdownMenu: false
  //         },
  //         {
  //             id: 5,
  //             name: "Miscellaneous",
  //             path: "/widgets/miscellaneous",
  //             subdropdownMenu: false
  //         },
  //     ]
  // },
  // {
  //     id: 9,
  //     name: "settings",
  //     path: "#",
  //     icon: 'feather-settings',
  //     dropdownMenu: [
  //         {
  //             id: 1,
  //             name: "Ganeral",
  //             path: "/settings/ganeral",
  //             subdropdownMenu: false
  //         },
  //         {
  //             id: 2,
  //             name: "SEO",
  //             path: "/settings/seo",
  //             subdropdownMenu: false
  //         },
  //         {
  //             id: 3,
  //             name: "Tags",
  //             path: "/settings/tags",
  //             subdropdownMenu: false
  //         },
  //         {
  //             id: 4,
  //             name: "Email",
  //             path: "/settings/email",
  //             subdropdownMenu: false
  //         },
  //         {
  //             id: 5,
  //             name: "Tasks",
  //             path: "/settings/tasks",
  //             subdropdownMenu: false
  //         },
  //         {
  //             id: 6,
  //             name: "Leads",
  //             path: "/settings/leads",
  //             subdropdownMenu: false
  //         },
  //         {
  //             id: 7,
  //             name: "Support",
  //             path: "/settings/Support",
  //             subdropdownMenu: false
  //         },
  //         {
  //             id: 8,
  //             name: "Finance",
  //             path: "/settings/finance",
  //             subdropdownMenu: false
  //         },
  //         {
  //             id: 9,
  //             name: "Gateways",
  //             path: "/settings/gateways",
  //             subdropdownMenu: false
  //         },
  //         {
  //             id: 10,
  //             name: "Customers",
  //             path: "/settings/customers",
  //             subdropdownMenu: false
  //         },
  //         {
  //             id: 11,
  //             name: "Localization",
  //             path: "/settings/localization",
  //             subdropdownMenu: false
  //         },
  //         {
  //             id: 12,
  //             name: "reCAPTCHA",
  //             path: "/settings/recaptcha",
  //             subdropdownMenu: false
  //         },
  //         {
  //             id: 13,
  //             name: "Miscellaneous",
  //             path: "/settings/miscellaneous",
  //             subdropdownMenu: false
  //         },
  //     ]
  // },
  {
    id: 10,
    name: "authentication",
    path: "/authentication/login/cover",
    icon: "feather-power",
    dropdownMenu: [
      // {
      //     id: 1,
      //     name: "login",
      //     path: "/authentication/login/cover",
      //     subdropdownMenu: [
      //         // {
      //         //     id: 1,
      //         //     name: "Cover",
      //         //     path: "/authentication/login/cover",
      //         // },
      //         // {
      //         //     id: 2,
      //         //     name: "Minimal",
      //         //     path: "/authentication/login/minimal",
      //         // },
      //         // {
      //         //     id: 3,
      //         //     name: "Creative",
      //         //     path: "/authentication/login/creative",
      //         // },
      //     ]
      // },
      // {
      //     id: 2,
      //     name: "register",
      //     path: "#",
      //     subdropdownMenu: [
      //         {
      //             id: 1,
      //             name: "Cover",
      //             path: "/authentication/register/cover",
      //         },
      //         {
      //             id: 2,
      //             name: "Minimal",
      //             path: "/authentication/register/minimal",
      //         },
      //         {
      //             id: 3,
      //             name: "Creative",
      //             path: "/authentication/register/creative",
      //         },
      //     ]
      // },
      //         {
      //             id: 3,
      //             name: "Error 404",
      //             path: "#",
      //             subdropdownMenu: [
      //                 {
      //                     id: 1,
      //                     name: "Cover",
      //                     path: "/authentication/404/cover",
      //                 },
      //                 {
      //                     id: 2,
      //                     name: "Minimal",
      //                     path: "/authentication/404/minimal",
      //                 },
      //                 {
      //                     id: 3,
      //                     name: "Creative",
      //                     path: "/authentication/404/creative",
      //                 },
      //             ]
      //         },
      //         {
      //             id: 4,
      //             name: "Reset Pass",
      //             path: "#",
      //             subdropdownMenu: [
      //                 {
      //                     id: 1,
      //                     name: "Cover",
      //                     path: "/authentication/reset/cover",
      //                 },
      //                 {
      //                     id: 2,
      //                     name: "Minimal",
      //                     path: "/authentication/reset/minimal",
      //                 },
      //                 {
      //                     id: 3,
      //                     name: "Creative",
      //                     path: "/authentication/reset/creative",
      //                 },
      //             ]
      //         },
      //         {
      //             id: 5,
      //             name: "Verify OTP",
      //             path: "#",
      //             subdropdownMenu: [
      //                 {
      //                     id: 1,
      //                     name: "Cover",
      //                     path: "/authentication/verify/cover",
      //                 },
      //                 {
      //                     id: 2,
      //                     name: "Minimal",
      //                     path: "/authentication/verify/minimal",
      //                 },
      //                 {
      //                     id: 3,
      //                     name: "Creative",
      //                     path: "/authentication/verify/creative",
      //                 },
      //             ]
      //         },
      //         {
      //             id: 6,
      //             name: "Maintenance",
      //             path: "#",
      //             subdropdownMenu: [
      //                 {
      //                     id: 1,
      //                     name: "Cover",
      //                     path: "/authentication/maintenance/cover",
      //                 },
      //                 {
      //                     id: 2,
      //                     name: "Minimal",
      //                     path: "/authentication/maintenance/minimal",
      //                 },
      //                 {
      //                     id: 3,
      //                     name: "Creative",
      //                     path: "/authentication/maintenance/creative",
      //                 },
      //             ]
      //         },
      //     ]
      // },
      // {
      //     id: 11,
      //     name: "Help Center",
      //     path: "#",
      //     icon: 'feather-life-buoy',
      //     dropdownMenu: [
      //         {
      //             id: 1,
      //             name: "Support",
      //             path: "https://themeforest.net/user/theme_ocean",
      //             subdropdownMenu: false
      //         },
      //         {
      //             id: 2,
      //             name: "KnowledgeBase",
      //             path: "/help/knowledgebase",
      //             subdropdownMenu: false
      //         },
      //         {
      //             id: 3,
      //             name: "Documentations",
      //             path: "/documentations",
      //             subdropdownMenu: false
      //         }
    ]
  }
];
