import { useEffect, useState } from "react";
import Table from "@/components/shared/table/Table";
import { GETStoreVerificationSheetDownloadDetails, GETStoreVerificationRackData, UpdateVerificationSheetDownloadingStartTime, UpdateVerificationSheetDownloadingEndTime, UpdateRackCountStartingStatus, UpdateRackCountEndingStatus } from "@/utils/api/api";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import useNotification from "@/hooks/useNotification";
import useConfirmation from "@/hooks/useConfirmation";
import getIcon from "@/utils/getIcon";

const VerificationRackManagement = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [racks, setRacks] = useState([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingRacks, setLoadingRacks] = useState(false);

  const { confirmAction } = useConfirmation();
  const notification = useNotification();

  // Fetch verification sheet download details on component mount
  useEffect(() => {
    loadVerificationSheetDetails();
    loadVerificationRackData();
  }, []);

  const loadVerificationSheetDetails = async () => {
    setLoadingWarehouses(true);
    try {
      const data = await GETStoreVerificationSheetDownloadDetails();
      
      const normalizedData = Array.isArray(data) 
        ? data.map(row => ({
            R_ID: row.w_ID ?? row.W_ID ?? row.w_id ?? '',
            R_CODE: row.R_CODE ?? row.r_code ?? row.RCode ?? row.w_ID ?? row.W_ID ?? '',
            W_ID: row.w_ID ?? row.W_ID ?? row.w_id ?? '',
            W_NAME: row.w_NAME ?? row.W_NAME ?? row.w_name ?? '',
            R_STATUS: row.sdD_STATUS ?? row.SDD_STATUS ?? row.sdd_status ?? 0,
            SVRC_ID: row.SVRC_ID ?? row.svrc_id ?? row.SVRCID ?? '',
            SDD_ID: row.SDD_ID ?? row.sdd_id ?? row.SDDID ?? row.sdD_ID ?? '',
            START_TIME: row.START_TIME ?? row.start_time ?? row.StartTime ?? '',
            END_TIME: row.END_TIME ?? row.end_time ?? row.EndTime ?? '',
          }))
        : [];
      
      setWarehouses(normalizedData);
    } catch (error) {
      console.error("Error loading verification sheet details:", error);
      notification.error("Failed to load verification sheet details");
      setWarehouses([]);
    } finally {
      setLoadingWarehouses(false);
    }
  };

  const loadVerificationRackData = async () => {
    setLoadingRacks(true);
    try {
      const data = await GETStoreVerificationRackData();
      
      const normalizedData = Array.isArray(data) 
        ? data.map(row => ({
            R_ID: row.r_ID ?? row.R_ID ?? row.r_id ?? row.RID ?? row.rid ?? '',
            R_CODE: row.r_CODE ?? row.r_code ?? row.RCode ?? row.R_CODE ?? '',
            W_NAME: row.w_NAME1 ?? row.W_NAME1 ?? row.w_name1 ?? row.WName1 ?? '',
            R_STATUS: row.r_STATUS ?? row.R_STATUS ?? row.r_status ?? row.RStatus ?? 0,
            SVRC_ID: row.svrC_ID ?? row.SVRC_ID ?? row.svrc_id ?? row.SVRCID ?? '',
            START_TIME: row.starT_TIME ?? row.START_TIME ?? row.start_time ?? row.StartTime ?? '',
            END_TIME: row.END_TIME ?? row.end_time ?? row.EndTime ?? '',
          }))
        : [];
      
      setRacks(normalizedData);
    } catch (error) {
      console.error("Error loading verification rack data:", error);
      notification.error("Failed to load verification rack data");
      setRacks([]);
    } finally {
      setLoadingRacks(false);
    }
  };

  const handleStartCounting = async (wId, rackCode) => {
    try {
      const confirmed = await confirmAction({
        title: 'Confirm Start Counting',
        text: `Are you sure you want to start counting for ${rackCode}?`,
        icon: 'question',
        confirmButtonText: 'Yes, start counting'
      });

      if (confirmed) {
        await UpdateVerificationSheetDownloadingStartTime(wId);
        notification.success(`Counting started for ${rackCode}`);
        loadVerificationSheetDetails();
        loadVerificationRackData();
      }
    } catch (error) {
      console.error("Error starting counting:", error);
      notification.error("Failed to start counting");
    }
  };

  const handleEndCounting = async (wId, sddId, rackCode) => {
    try {
      const confirmed = await confirmAction({
        title: 'Confirm End Counting',
        text: `Are you sure you want to end counting for ${rackCode}?`,
        icon: 'warning',
        confirmButtonText: 'Yes, end counting'
      });

      if (confirmed) {
        await UpdateVerificationSheetDownloadingEndTime(wId, sddId);
        notification.success(`Counting ended for ${rackCode}`);
        loadVerificationSheetDetails();
        loadVerificationRackData();
      }
    } catch (error) {
      console.error("Error ending counting:", error);
      notification.error("Failed to end counting");
    }
  };

  const handleRackStartCounting = async (rackId, rackCode) => {
    try {
      if (!rackId || rackId === '') {
        notification.error("Invalid rack ID. Please try again.");
        return;
      }

      const confirmed = await confirmAction({
        title: 'Confirm Start Counting',
        text: `Are you sure you want to start counting for rack ${rackCode}?`,
        icon: 'question',
        confirmButtonText: 'Yes, start counting'
      });

      if (confirmed) {
        await UpdateRackCountStartingStatus(rackId);
        notification.success(`Counting started for rack ${rackCode}`);
        loadVerificationSheetDetails();
        loadVerificationRackData();
      }
    } catch (error) {
      console.error("Error starting rack counting:", error);
      notification.error("Failed to start rack counting");
    }
  };

  const handleRackEndCounting = async (rackId, svrcId, rackCode) => {
    try {
      if (!rackId || rackId === '' || !svrcId || svrcId === '') {
        notification.error("Invalid rack ID or SVRC ID. Please try again.");
        return;
      }

      const confirmed = await confirmAction({
        title: 'Confirm End Counting',
        text: `Are you sure you want to end counting for rack ${rackCode}?`,
        icon: 'warning',
        confirmButtonText: 'Yes, end counting'
      });

      if (confirmed) {
        await UpdateRackCountEndingStatus(rackId, svrcId);
        notification.success(`Counting ended for rack ${rackCode}`);
        loadVerificationSheetDetails();
        loadVerificationRackData();
      }
    } catch (error) {
      console.error("Error ending rack counting:", error);
      notification.error("Failed to end rack counting");
    }
  };



  const warehouseColumns = [
    {
      accessorKey: "Warehouse",
      header: () => "Warehouse",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-brand-text font-medium">{row.original.W_NAME}</span>
        </div>
      )
    },
    {
      accessorKey: "Start Counting",
      header: () => "Start Counting",
      cell: ({ row }) => {
        const rStatus = row.original.R_STATUS ?? 0;
        
        if (rStatus === 0) {
          return (
            <button
              onClick={() => handleStartCounting(row.original.W_ID, row.original.R_CODE)}
              className="bg-success/10 text-success hover:bg-success hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-2 text-xs font-semibold whitespace-nowrap"
            >
              {getIcon("feather-check")}
              Start Counting
            </button>
          );
        }
        if (rStatus === 1 || rStatus === 5) {
          return (
            <button
              disabled
              className="bg-brand-muted text-brand-text-muted opacity-50 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-not-allowed"
            >
              {rStatus === 1 ? "On Progress" : "Completed"}
            </button>
          );
        }
        return null;
      }
    },
    {
      accessorKey: "End Counting",
      header: () => "End Counting",
      cell: ({ row }) => {
        const rStatus = row.original.R_STATUS ?? 0;
        
        if (rStatus === 0 || rStatus === 5) {
          return (
            <button
              disabled
              className="bg-brand-muted text-brand-text-muted opacity-50 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-not-allowed"
            >
              {rStatus === 5 ? "Completed" : "End Counting"}
            </button>
          );
        }
        if (rStatus === 1) {
          return (
            <button
              onClick={() => handleEndCounting(row.original.W_ID, row.original.SDD_ID, row.original.R_CODE)}
              className="bg-error/10 text-error hover:bg-error hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-2 text-xs font-semibold whitespace-nowrap"
            >
              {getIcon("feather-x")}
              End Counting
            </button>
          );
        }
        return null;
      }
    },
    {
      accessorKey: "Status",
      header: () => "Status",
      cell: ({ row }) => {
        const rStatus = Number(row.original.R_STATUS) ?? 0;
        if (rStatus === 0) {
          return <span className="badge-status-primary">Active</span>;
        }
        if (rStatus === 1) {
          return <span className="badge-status-warning">Counting On Progress</span>;
        }
        if (rStatus === 5) {
          return <span className="badge-status-success">Counting Completed</span>;
        }
        return <span className="badge-status-secondary">Unknown</span>;
      }
    }
  ];

  const rackColumns = [
    {
      accessorKey: "Rack",
      header: () => "Rack",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-brand-text font-medium">{row.original.R_CODE}</span>
          <span className="text-brand-text-secondary text-xs">{row.original.W_NAME}</span>
        </div>
      )
    },
    {
      accessorKey: "Start Counting",
      header: () => "Start Counting",
      cell: ({ row }) => {
        const rStatus = Number(row.original.R_STATUS) ?? 0;
        
        if (rStatus == 0) {
          return (
            <button
              onClick={() => handleRackStartCounting(row.original.R_ID, row.original.R_CODE)}
              className="bg-success/10 text-success hover:bg-success hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-2 text-xs font-semibold whitespace-nowrap"
            >
              {getIcon("feather-check")}
              Start Counting
            </button>
          );
        }
        if (rStatus == 1) {
          return (
            <button
              disabled
              className="bg-brand-muted text-brand-text-muted opacity-50 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-not-allowed"
            >
              On Progress
            </button>
          );
        }
        if (rStatus == 5) {
          return (
            <button
              disabled
              className="bg-brand-muted text-brand-text-muted opacity-50 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-not-allowed"
            >
              Completed
            </button>
          );
        }
        return null;
      }
    },
    {
      accessorKey: "End Counting",
      header: () => "End Counting",
      cell: ({ row }) => {
        const rStatus = Number(row.original.R_STATUS) ?? 0;
        
        if (rStatus == 0) {
          return (
            <button
              disabled
              className="bg-brand-muted text-brand-text-muted opacity-50 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-not-allowed"
            >
              End Counting
            </button>
          );
        }
        if (rStatus == 1) {
          return (
            <button
              onClick={() => handleRackEndCounting(row.original.R_ID, row.original.SVRC_ID, row.original.R_CODE)}
              className="bg-error/10 text-error hover:bg-error hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-2 text-xs font-semibold whitespace-nowrap"
            >
              {getIcon("feather-x")}
              End Counting
            </button>
          );
        }
        if (rStatus == 5) {
          return (
            <button
              disabled
              className="bg-brand-muted text-brand-text-muted opacity-50 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-not-allowed"
            >
              Completed
            </button>
          );
        }
        return null;
      }
    },
    {
      accessorKey: "Status",
      header: () => "Status",
      cell: ({ row }) => {
        const rStatus = Number(row.original.R_STATUS) ?? 0;
        if (rStatus === 0) {
          return <span className="badge-status-primary">Active</span>;
        }
        if (rStatus === 1) {
          return <span className="badge-status-warning">Counting On Progress</span>;
        }
        if (rStatus === 5) {
          return <span className="badge-status-success">Counting Completed</span>;
        }
        return <span className="badge-status-secondary">Unknown</span>;
      }
    }
  ];

  return (
    <div className="flex flex-col gap-8 p-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-brand-text font-bold text-2xl">Rack Management For Verification</h3>
        <p className="text-brand-text-secondary text-sm">Disable/Enable Racks While Downloading Verification Sheets</p>
      </div>

      {/* Verification Sheet Details Section */}
      <div className="bg-brand-surface rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-brand-border">
          <h4 className="text-brand-text font-semibold text-lg">
            Verification Sheet Download Details
          </h4>
        </div>
        <div className="p-6">
          {loadingWarehouses ? (
            <TableSkeleton columns={warehouseColumns} rows={5} />
          ) : (
            <Table
              columns={warehouseColumns}
              data={warehouses}
              pagination
              highlightOnHover
              striped
            />
          )}
        </div>
      </div>

      {/* Racks Section */}
      <div className="bg-brand-surface rounded-2xl border border-brand-border shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-brand-border">
          <h4 className="text-brand-text font-semibold text-lg">
            Dissable/Enable Racks In Verification Period
          </h4>
        </div>
        <div className="p-6">
          {loadingRacks ? (
            <TableSkeleton columns={rackColumns} rows={5} />
          ) : (
            <Table
              columns={rackColumns}
              data={racks}
              pagination
              highlightOnHover
              striped
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationRackManagement;

