import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import { FaTimes, FaTrash, FaSave, FaCheck } from "react-icons/fa";
import '../../../../public/assets/scss/themes/components/_modal.scss';
import { appointmentAPI } from "../../../utils/api/appointment";
import SearchableDropdown from "../../shared/SearchableDropdown";
import { useStatus } from "@/hooks/useStatus";
import { levelAPI } from "@/utils/api/level";
import { getAllSections } from "@/utils/api/api";
import TableSkeleton from "@/components/skeletons/TableSkeleton";

const ModalBoxAppointments = ({
  isOpen,
  appointment,
  onClose,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [levelsList, setLevelsList] = useState([]);
  const [sectionsList, setSectionsList] = useState([]);
  const [loading, setLoading] = useState(false);

  const modalRef = useRef(null);

  useEffect(() => {
    if (!appointment) {
      setFormData({
        isSubAppointment: true,
        COST_CENTER: "",
        APPOINTMENT_NAME: "",
        SECTION_ID: "",
        PARTENT_APPOINTMENT_ID: "",
        LEVEL_ID: "",
        users: "",
        appandsection: "",

      });
      setErrors({});
      return;
    }

    const appId = appointment.appointmenT_ID || appointment.APPOINTMENT_ID;

    setFormData({
      isSubAppointment: !!appointment.parenT_NAME,
      COST_CENTER: appointment.cosT_CENTER || "",
      APPOINTMENT_NAME: appointment.appointmenT_NAME || "",
      SECTION_ID: appointment.sectioN_ID || "",
      PARTENT_APPOINTMENT_ID: appointment.partenT_APPOINTMENT_ID || "",
      LEVEL_ID: appointment.leveL_ID,
      // users: appointment.qty || "",
      appandsection: appointment.appandsection || "",
      users: "" // Reset users briefly until fetched
    });
    setErrors({});
  }, [appointment]);

  console.log("Modal received appointment:", appointment);

  useEffect(() => {
    if (!isOpen) {
      setFormData({});
      setErrors({});
      setAppointmentsList([]);
      setLevelsList([]);
      setSectionsList([]);
    } else {
      const fetchData = async () => {
        setLoading(true);
        try {
          const appId = appointment?.appointmenT_ID || appointment?.APPOINTMENT_ID;
          
          const promises = [
            appointmentAPI.getAppointments(),
            levelAPI.getAllLevels(),
            getAllSections()
          ];

          if (appId) {
            promises.push(appointmentAPI.GetUserByAppointmentID(appId));
          }

          const results = await Promise.all(promises);
          
          const appointmentsData = results[0];
          const levelsData = results[1];
          const sectionsData = results[2];
          const usersData = appId ? results[3] : null;

          setAppointmentsList(appointmentsData || []);
          setLevelsList(levelsData || []);
          setSectionsList(sectionsData || []);

          if (usersData) {
            console.log("Fetched users:", usersData);
            const userArray = Array.isArray(usersData) ? usersData : [usersData];
            if (userArray.length > 0) {
              const userString = userArray
                .map(u => `${u.pfno || ""} ${u.fullname || ""}`.trim())
                .filter(Boolean)
                .join("\n");
              setFormData(prev => ({ ...prev, users: userString }));
            }
          }
        } catch (error) {
          console.error("Failed to fetch data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, appointment]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  const parentAppointmentOptions = appointmentsList.map((app) => ({
    id: app.appointmenT_ID,
    title: app.appandsection || app.appointmenT_NAME
  }));

  if (appointment && formData.PARTENT_APPOINTMENT_ID && !appointmentsList.some(a => String(a.appointmenT_ID) === String(formData.PARTENT_APPOINTMENT_ID))) {
    parentAppointmentOptions.unshift({
      id: formData.PARTENT_APPOINTMENT_ID,
      title: appointment?.appandsection || formData.PARTENT_APPOINTMENT_ID
    });
  }

  const sectionOptions = sectionsList.map((section) => ({
    id: section.sectioN_ID ?? section.id ?? section.sectionId,
    title: section.sectioN_NAME ?? section.name ?? section.sectionName ?? (section.sectioN_ID ?? section.id ?? section.sectionId)
  }));

  if (formData.SECTION_ID && !sectionsList.some(s => String(s.sectioN_ID ?? s.id ?? s.sectionId) === String(formData.SECTION_ID))) {
    sectionOptions.unshift({
      id: formData.SECTION_ID,
      title: String(formData.SECTION_ID)
    });
  }

  const { getLabel: getStoreStatusLabel, statuses: storeStatuses } = useStatus("CostCenter");
  console.log("storeStatuses", storeStatuses);

  const statusOptions = [
    ...(storeStatuses || []).map(s => ({ id: s.value, title: s.label }))
  ];

  const handleDropdownChange = (name, value) => {
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };

      // If parent appointment changes, auto-set level to Parent Level + 1
      if (name === "PARTENT_APPOINTMENT_ID" && value) {
        const selectedParent = appointmentsList.find(
          (app) => String(app.appointmenT_ID) === String(value)
        );
        if (selectedParent) {
          const parentLevel = parseInt(selectedParent.leveL_ID || 0);
          updatedData.LEVEL_ID = String(parentLevel + 1);
        }
      }

      return updatedData;
    });
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Construct DTO payload matching C# backend casing
    const payload = {
      APPOINTMENT_ID: appointment ? (appointment.appointmenT_ID || 0) : 0,
      APPOINTMENT_NAME: formData.APPOINTMENT_NAME || "",
      LEVEL_ID: parseInt(formData.LEVEL_ID),
      PARTENT_APPOINTMENT_ID: formData.isSubAppointment ? (parseInt(formData.PARTENT_APPOINTMENT_ID)) || 0 : 0,
      SECTION_ID: parseInt(formData.SECTION_ID),
      COST_CENTER: formData.COST_CENTER || ""
    };

    console.log("Saving appointment payload:", payload);
    onSave && onSave(payload);
  };

  const handleDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete && onDelete(appointment);
      }
    });
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay-new" role="dialog" aria-modal="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>
        {`
          .modal-content-new .dropdown-menu {
            max-height: 250px !important;
          }
          .modal-content-new .options-list {
            max-height: 200px !important;
          }
        `}
      </style>
      <div ref={modalRef} className="modal-content-new" style={{ maxWidth: "800px", width: "100%", padding: "20px", overflow: "visible" }}>
        <h5 id="modal-title" className="mb-4" style={{ fontWeight: '500' }}>
          Enter Appointments Details
        </h5>

        {loading ? (
          <TableSkeleton rows={5} columns={2} />
        ) : (
          <form onSubmit={handleSubmit}>
          <div className="row">
            {/* Left Column */}
            <div className="col-md-6 pe-md-4">
              <div className="mb-4">
                <label className="form-label d-block text-muted" style={{ fontWeight: "500" }}>Select :</label>
                <div className="d-flex align-items-center" style={{ cursor: "pointer" }} onClick={() => setFormData(prev => ({ ...prev, isSubAppointment: !prev.isSubAppointment }))}>
                  {formData.isSubAppointment ? (
                    <FaCheck className="text-success me-2" style={{ fontSize: "1.2rem" }} />
                  ) : (
                    <div className="border rounded-circle me-2" style={{ width: "16px", height: "16px", display: "inline-block" }}></div>
                  )}
                  <span className="text-muted" style={{ fontWeight: "500" }}>Is Sub Appointment :</span>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="COST_CENTER" className="form-label text-muted" style={{ fontWeight: "500" }}>Cost Center :</label>
                <select
                  id="COST_CENTER"
                  name="COST_CENTER"
                  className="form-select shadow-none"
                  value={formData.COST_CENTER || ""}
                  onChange={handleInputChange}
                >
                  <option value="">Select Cost Center</option>
                  {statusOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.title}
                    </option>
                  ))}
                  {/* Fallback option if current value is not in statusOptions */}
                  {formData.COST_CENTER && !statusOptions.some(opt => String(opt.id) === String(formData.COST_CENTER)) && (
                    <option value={formData.COST_CENTER} className="d-none">
                      {formData.COST_CENTER}
                    </option>
                  )}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="APPOINTMENT_NAME" className="form-label text-muted" style={{ fontWeight: "500" }}>Appointment Name :</label>
                <input
                  type="text"
                  id="APPOINTMENT_NAME"
                  name="APPOINTMENT_NAME"
                  className="form-control shadow-none border-0 border-bottom rounded-0"
                  value={formData.APPOINTMENT_NAME || ""}
                  onChange={handleInputChange}
                  style={{ borderColor: "#ced4da" }}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="SECTION_ID" className="form-label text-muted" style={{ fontWeight: "500" }}>Section Name :</label>
                <SearchableDropdown
                  id="SECTION_ID"
                  options={sectionOptions}
                  value={formData.SECTION_ID || ""}
                  onChange={(val) => handleDropdownChange('SECTION_ID', val)}
                  placeholder="Select Section Name"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="col-md-6 ps-md-4">
              {formData.isSubAppointment && (
                <>
                  <div className="mb-4 mt-3 mt-md-0">
                    <label htmlFor="PARTENT_APPOINTMENT_ID" className="form-label text-muted" style={{ fontWeight: "500" }}>Parent Appointment :</label>
                    <SearchableDropdown
                      id="PARTENT_APPOINTMENT_ID"
                      options={parentAppointmentOptions}
                      value={formData.PARTENT_APPOINTMENT_ID || ""}
                      onChange={(val) => handleDropdownChange('PARTENT_APPOINTMENT_ID', val)}
                      placeholder="Select Parent Appointment"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="LEVEL_ID" className="form-label text-muted" style={{ fontWeight: "500" }}>Level :</label>
                    <select
                      id="LEVEL_ID"
                      name="LEVEL_ID"
                      className="form-select shadow-none"
                      value={formData.LEVEL_ID || ""}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Level</option>
                      {levelsList.map(level => {
                        const id = level.LEVEL_ID;
                        const name = level.LEVEL_ID;
                        return (
                          <option key={id} value={id}>
                            {name}
                          </option>
                        );
                      })}
                      {/* Fallback option if current value is not in levelsList */}
                      {formData.LEVEL_ID && !levelsList.some(l => String(l.LEVEL_ID ?? l.id ?? l.LEVEL_ID) === String(formData.LEVEL_ID)) && (
                        <option value={formData.LEVEL_ID} className="d-none">
                          {formData.LEVEL_ID}
                        </option>
                      )}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="users" className="form-label text-muted" style={{ fontWeight: "500" }}>Users :</label>
                    <textarea
                      id="users"
                      name="users"
                      readOnly
                      className="form-control shadow-none rounded-0 px-0"
                      value={formData.users || ""}
                      onChange={handleInputChange}
                      rows="2"
                      style={{
                        borderTop: "none",
                        borderLeft: "none",
                        borderRight: "none",
                        borderBottom: "2px solid #00a8ff",
                        resize: "none",
                        background: "transparent"
                      }}
                    ></textarea>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="d-flex justify-content-end align-items-center mt-5 gap-2">
            <button
              type="button"
              className="brand-btn-secondary d-flex align-items-center px-4"
              onClick={onClose}
            >
              <FaTimes className="me-2" /> Close
            </button>
            {appointment && (
              <button
                id="deletebtn"
                type="button"
                className="brand-btn-danger d-flex align-items-center px-4"
                onClick={handleDelete}
              >
                <FaTrash className="me-2" /> Delete
              </button>
            )}
            <button
              type="submit"
              className="brand-btn-primary d-flex align-items-center px-4"
            >
              <FaSave className="me-2" /> Save
            </button>
          </div>
        </form>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ModalBoxAppointments;
