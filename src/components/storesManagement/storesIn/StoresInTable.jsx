import { useEffect, useState } from "react";
import Table from "@/components/shared/table/Table";
import Swal from "sweetalert2";
import { getAllStoresInByTrnBy, getPaymentItemsByGrnNo } from "@/utils/api/api";
import TableSkeleton from "@/components/skeletons/TableSkeleton"
import ModalBoxStoresIn from "./ModalBoxStoresIn";
import ModalBoxMaterialRequestAllSkeleton from "@/components/skeletons/MaterialRequestAll/ModalBoxMaterialRequestAllSkeleton";
import SectionHeader from "@/components/shared/SectionHeader";
import CopyCell from "@/components/shared/CopyCell";

const StoresInTable = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isSkeletonOpen, setIsSkeletonOpen] = useState(false);

  useEffect(() => {
    const loadStoreList = async () => {
      setLoading(true);
      try {
        const data = await getAllStoresInByTrnBy();
        if (!Array.isArray(data)) throw new Error("Invalid data from server.");

        const normalized = data.map((r) => ({
          ...r,
          grn_NO: r.grN_NO,
          typeName: r.typename,
          sup_NAME: r.suP_NAME,
          prno: r.prno,
          title: r.title,
          skno: r.skno,
        }));

        // Attach per-row view handler
        const withHandlers = normalized.map((r) => ({
          ...r,
          onView: async () => {
            try {
              setIsSkeletonOpen(true);

              // Fetch items for this GRN
              let items = [];
              if (r.grn_NO) {
                try {
                  items = await getPaymentItemsByGrnNo(r.grn_NO);
                } catch (itemError) {
                  console.warn(`Could not fetch items for GRN ${r.grn_NO}:`, itemError);
                  // Continue without items if the API is not available yet
                }
              }

              const details = {
                header: {
                  grnNo: r.grn_NO,
                  typeName: r.typeName,
                  supplierName: r.sup_NAME,
                  prNo: r.prno,
                  title: r.title,
                  skno: r.skno,
                },
                items: items
              };
              console.log("Store details with items:", details);
              setSelected(details);
              setIsSkeletonOpen(false);
              setIsModalOpen(true);
            } catch (e) {
              setIsSkeletonOpen(false);
              Swal.fire({
                icon: "error",
                title: "Error",
                text: e?.message || "Failed to load store details"
              });
            }
          },
        }));

        setRows(withHandlers);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `Failed to fetch store list. ${err.message}`
        });
      } finally {
        setLoading(false);
      }
    };

    loadStoreList();
  }, []);

  const columns = [
    {
      accessorKey: "view",
      header: () => "Action",
      cell: ({ row }) => (
        <button
          onClick={() => row.original.onView()}
          className="brand-btn-primary brand-btn-sm"
        >
          View
        </button>
      ),
    },
    {
      accessorKey: "grn_NO",
      header: () => "GRN Number",
      cell: ({ row }) => <CopyCell value={row.original.grn_NO} />
    },
    {
      accessorKey: "typeName",
      header: () => "Type"
    },
    {
      accessorKey: "sup_NAME",
      header: () => "Supplier Name"
    },
    {
      accessorKey: "prno",
      header: () => "PR Number",
      cell: ({ row }) => <CopyCell value={row.original.prno} />
    },
    {
      accessorKey: "title",
      header: () => "Title"
    },
  ];

  return (
    <div>
      <SectionHeader
        title="Stores In"
        subtitle="Showing store records for your assigned warehouses"
      />

      {loading ? (
        <TableSkeleton columns={columns} rows={10} />
      ) : (
        <Table
          columns={columns}
          data={rows}
          pagination
          highlightOnHover
          striped
        />
      )}

      <ModalBoxMaterialRequestAllSkeleton
        isOpen={isSkeletonOpen}
        onClose={() => setIsSkeletonOpen(false)}
      />

      <ModalBoxStoresIn
        isOpen={isModalOpen}
        storeRecord={selected}
        onClose={() => {
          setIsModalOpen(false);
          setSelected(null);
        }}
        logoUrl="/assets/images/CEB.png"
      />
    </div>
  );
};

export default StoresInTable;
