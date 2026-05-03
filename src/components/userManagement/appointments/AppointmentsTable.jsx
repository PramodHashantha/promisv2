import React, { useEffect, useState } from "react";
import { appointmentAPI } from "../../../utils/api/appointment";
import Table from "@/components/shared/table/Table";
import LoadingSpinner from "@/components/loading/LoadingSpinner";
import Swal from "sweetalert2";
import { FaEdit } from "react-icons/fa";
import ModalBoxAppointments from "@/components/userManagement/appointments/ModalBoxAppointments";
import AppointmentHierarchy from "./AppointmentHierarchy";
import { useStatus } from "@/hooks/useStatus";

const AppointmentsTable = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const { getLabel: getCostCenterLabel } = useStatus("CostCenter");

  useEffect(() => {
    setLoading(true);
    appointmentAPI.getAppointments()
      .then((data) => {

        if (!Array.isArray(data)) {
          console.error("Expected an array from getAppointments, got:", data);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Invalid data format from server."
          });
          return;
        }
        setAppointments(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching appointments:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `Failed to fetch appointments. ${error.message}`
        });
        setLoading(false);
      });
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleSaveModal = async (formData) => {
    try {
      setLoading(true);
      await appointmentAPI.createAppointment(formData);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Appointment saved successfully."
      });
      setIsModalOpen(false);
      setSelectedAppointment(null);
      // Reload data
      const data = await appointmentAPI.getAppointments();
      setAppointments(data);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to save appointment. ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModal = async (appointment) => {
    try {
      setLoading(true);
      // Typically need the ID to delete
      const appointmentId = appointment.appointmenT_ID || appointment.appointmentId || appointment.id;
      await appointmentAPI.deleteAppointment(appointmentId);
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Appointment has been deleted."
      });
      setIsModalOpen(false);
      setSelectedAppointment(null);
      // Reload data
      const data = await appointmentAPI.getAppointments();
      setAppointments(data);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to delete appointment. ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      accessorKey: "appointmenT_ID",
      header: () => "Appointment ID"
    },
    {
      accessorKey: "appointmenT_NAME",
      header: () => "Appointment Name"
    },
    {
      accessorFn: (row) => `${row.appointmenT_NAME} (${row.sectioN_NAME})`,
      id: "appointmentSection",
      header: "Appointment (Section)"
    },
    {
      accessorKey: "sectioN_ID",
      header: () => "Section ID"
    },
    {
      id: "workS_QUOTATION_LIMIT",
      accessorFn: (row) => Number(row.workS_QUOTATION_LIMIT ?? 0).toFixed(2),
      header: () => "Quotation Limit (Works)"
    },
    {
      id: "servicE_AND_GOODS_QUOTATION_LIMIT",
      accessorFn: (row) => Number(row.servicE_AND_GOODS_QUOTATION_LIMIT ?? 0).toFixed(2),
      header: () => "Quotation Limit (Service & Goods)"
    },
    {
      id: "workS_TOTAL_MONTHLY_LIMIT",
      accessorFn: (row) => Number(row.workS_TOTAL_MONTHLY_LIMIT ?? 0).toFixed(2),
      header: () => "Total Monthly Limit (Works)"
    },
    {
      id: "servicE_AND_GOODS_TOTAL_MONTHLY_LIMIT",
      accessorFn: (row) => Number(row.servicE_AND_GOODS_TOTAL_MONTHLY_LIMIT ?? 0).toFixed(2),
      header: () => "Total Monthly Limit (Service & Goods)"
    },
    {
      accessorKey: "parenT_NAME",
      header: () => "Parent Appointment"
    },
    {
      accessorKey: "qty",
      header: () => "# Users"
    },
    {
      id: "cosT_CENTER",
      accessorFn: (row) => getCostCenterLabel(row.cosT_CENTER),
      header: () => "Cost Center"
    },
    {
      accessorKey: "edit",
      header: () => "Edit",
      cell: ({ row }) => (
        <button
          onClick={() => {
            console.log("Edit appointment:", row.original);
            setSelectedAppointment(row.original);
            setIsModalOpen(true);
          }}
          className="brand-btn-warning brand-btn-sm"
          style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", padding: "0" }}
        >
          <FaEdit />
        </button>
      )
    }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Appointments List</h3>
        <button
          className="brand-btn-primary px-4"
          onClick={() => {
            setSelectedAppointment(null);
            setIsModalOpen(true);
          }}
          style={{ height: "40px" }}
        >
          + Add New Appointment
        </button>
      </div>
      {loading ? (
        <LoadingSpinner
          size="large"
          variant="success"
          text="Loading appointments..."
        />
      ) : (
        <Table
          columns={columns}
          data={appointments}
          pagination
          highlightOnHover
          striped
        />
      )}

      {/* Appointment Hierarchy Tree */}
      <AppointmentHierarchy appointments={appointments} />

      {isModalOpen && (
        <ModalBoxAppointments
          isOpen={isModalOpen}
          appointment={selectedAppointment}
          onClose={handleCloseModal}
          onSave={handleSaveModal}
          onDelete={handleDeleteModal}
        />
      )}
    </div>
  );
};

export default AppointmentsTable;
