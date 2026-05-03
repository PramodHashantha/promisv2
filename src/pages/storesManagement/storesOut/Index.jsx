import React, { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { getStoreMaterialRequestByTrnByAndStatus } from "@/utils/api/api";
import Table from "@/components/shared/table/Table";
import SelectDropdown from "@/components/shared/SelectDropdown";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { useStatus } from "@/hooks/useStatus";
import { useNavigate } from "react-router-dom";
import SectionHeader from "@/components/shared/SectionHeader";

const Index = () => {
  const [status, setStatus] = useState("1"); // Default to strict "1" as string matches value
  const { data, loading, error, execute } = useApi(getStoreMaterialRequestByTrnByAndStatus, [status], false);
  const { statuses, loading: loadingStatuses, getLabel } = useStatus("StoreStatus", { include: [1, 5, 9, 10] });
  const { statuses: materialRequestTypes, loading: loadingMaterialRequestTypes, getLabel: getMaterialRequestTypeLabel } = useStatus("MaterialRequestType");
  const [statusOptions, setStatusOptions] = useState([]);

  const navigate = useNavigate();

  // Map statuses to options when loaded
  useEffect(() => {
    if (Array.isArray(statuses)) {
      const options = statuses.map(s => ({
        value: s.value.toString(),
        label: s.label,
        color: getStatusColor(s.value)
      }));
      setStatusOptions(options);
    }
  }, [statuses]);

  // Fetch data when status changes
  useEffect(() => {
    execute(status);
  }, [status, execute]);

  const handleStatusChange = (option) => {
    setStatus(option.value);
  };

  const getStatusColor = (statusVal) => {
    switch (statusVal) {
      case 1: return "#6c757d"; // Secondary
      case 5: return "#198754"; // Success
      case 9: return "#ffc107"; // Warning
      case 10: return "#0dcaf0"; // Info
      default: return "#0d6efd"; // Primary
    }
  }

  const getStatusBadgeClass = (statusVal) => {
    switch (statusVal) {
      case 1: return "secondary";
      case 5: return "success";
      case 9: return "warning";
      case 10: return "info";
      default: return "primary";
    }
  };

  const handleViewDetails = (mrNo) => {
    navigate("/storesout/view", { state: { mrNo } });
  };

  const columns = [
    {
      accessorKey: "view",
      header: () => "Action",
      cell: ({ row }) => (
        <button
          className="brand-btn-outline brand-btn-sm"
          onClick={() => handleViewDetails(row.original.mR_NO)}
          title="View Details"
        >
          <i className="bi bi-eye me-1"></i> View
        </button>
      ),
    },
    {
      accessorKey: "mR_NO",
      header: () => "Request No",
    },
    {
      id: "type",
      header: () => "Request Type",
      accessorFn: (row) => getMaterialRequestTypeLabel(row.type),  //serch by text
      sortingFn: (rowA, rowB) => rowA.original.type - rowB.original.type,
      cell: ({ row }) => getMaterialRequestTypeLabel(row.original.type)
    },
    {
      accessorKey: "createD_DATE",
      header: () => "Request Date",
      cell: ({ row }) => row.original.createD_DATE ? new Date(row.original.createD_DATE).toLocaleDateString() : "-",
    },
    {
      accessorKey: "requestPerson",
      header: () => "Request Person",
      accessorFn: (row) => row.title || row.createD_BY,
      cell: ({ row }) => row.original.title || row.original.createD_BY
    },
    {
      id: "mR_STATUS", // Changed from accessorKey to explicit id
      header: () => "Status",
      accessorFn: (row) => getLabel(row.mR_STATUS), // Returns "Pending" (Text) -> SEARCH WORKS
      sortingFn: (rowA, rowB) => rowA.original.mR_STATUS - rowB.original.mR_STATUS, // Sort by ID
      cell: ({ cell, row }) => (
        <span className={`badge-status-${getStatusBadgeClass(row.original.mR_STATUS)}`}>
          {cell.getValue()}
        </span>
      ),
    },
  ];

  return (
    <>
      {/* <PageHeader /> */}
      <div className="container-fluid p-4">
        <SectionHeader
          title="Stores Out"
          subtitle="Showing all stores out details"
          rightContent={
            <div className="w-64">
              <SelectDropdown
                options={statusOptions}
                selectedOption={statusOptions.find(opt => opt.value === status)}
                onSelectOption={handleStatusChange}
                defaultSelect={status}
                loading={loadingStatuses}
                placeholder="Filter by Status"
              />
            </div>
          }
        />


        <div className="card-body">
          {loading && (
            <TableSkeleton />
          )}

          {error && (
            <div className="alert alert-danger m-3">
              Error fetching data: {error.message}
            </div>
          )}

          {!loading && !error && (
            <Table
              columns={columns}
              data={data || []}
              pagination
              highlightOnHover
              striped
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Index;
