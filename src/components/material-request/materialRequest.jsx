import React, { useState, useCallback, useEffect } from "react";
import AsyncSelect from "react-select/async";
import Swal from "sweetalert2";
import LoadingSpinner from "@/components/loading/LoadingSpinner";
import { getItems } from "../../utils/api/Items";
import { debounce } from "lodash";
import SearchableDropdown from "@/components/dropdown/SearchableDropdown";
import { warehouseAPI } from "../../utils/api/storeView";
import { getAllCostCodesByW_ID_SECTION_AND_TYPE } from "../../utils/api/costCode";
import { getAllWarehousesNEW } from "../../utils/api/storeView";
import { ca } from "date-fns/locale";
import { InsertMaterialRequest } from "../../utils/api/materialRequest";
import { Navigation } from "react-calendar";

const MaterialRequest = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectLoading, setSelectLoading] = useState(false);
  const [requestedItems, setRequestedItems] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [costCodes, setCostCodes] = useState([]);
  const [selectedCostCode, setSelectedCostCode] = useState(null);
  const [costCodesLoading, setCostCodesLoading] = useState(false);

  const [type, setType] = useState("");
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    description: "",
    section: "",
    jobId: "",
    costCode: ""
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const mapToOptions = (items) =>
    items.map((item) => ({
      label: (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: "bold" }}>{item.iteM_NUMBER}</span>
          <span style={{ fontSize: "0.85rem", color: "#666" }}>
            {item.description}
          </span>
          <span
            style={{ fontSize: "0.85rem", fontWeight: "600", color: "#2e8b57" }}
          >
            [Availability: {item.availablE_QTY}]
          </span>
        </div>
      ),
      value: item.iteM_NUMBER,
      ...item
    }));

  const loadOptions = useCallback(
    (inputValue) =>
      new Promise((resolve) => {
        if (!inputValue || inputValue.trim().length < 2) {
          resolve([]);
          return;
        }

        const run = debounce(async () => {
          try {
            setSelectLoading(true);
            const data = await getItems(inputValue);
            if (!Array.isArray(data)) {
              throw new Error("Server did not return an array");
            }
            resolve(mapToOptions(data));
          } catch (err) {
            console.error(err);
            Swal.fire("Error", err.message || "Failed to fetch items", "error");
            resolve([]);
          } finally {
            setSelectLoading(false);
          }
        }, 400);

        run();
      }),
    []
  );

  const handleItemSelect = (item) => {
    if (!item) {
      setSelectedItem(null);
      return;
    }

    const itemExists = requestedItems.some(
      (reqItem) => reqItem.iteM_NUMBER === item.iteM_NUMBER
    );

    if (itemExists) {
      Swal.fire("Info", "This item is already in your request", "info");
      setSelectedItem(null);
      return;
    }

    setRequestedItems([
      ...requestedItems,
      {
        ...item,
        requestQuantity: 0,
        id: `${item.iteM_NUMBER}-${Date.now()}`
      }
    ]);

    setSelectedItem(null);
  };

  const updateRequestQuantity = (id, quantity) => {
    const numQuantity = parseFloat(quantity) || 0;
    const item = requestedItems.find((i) => i.id === id);

    if (numQuantity > item.availablE_QTY) {
      Swal.fire(
        "Warning",
        "Request quantity cannot exceed available quantity",
        "warning"
      );
      return;
    }

    setRequestedItems(
      requestedItems.map((i) =>
        i.id === id ? { ...i, requestQuantity: numQuantity } : i
      )
    );
  };

  const deleteItem = (id) => {
    setRequestedItems(requestedItems.filter((item) => item.id !== id));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e) => {
    const value = e.target.value;
    setType(value);
    if (value !== "2" && value !== "4") {
      setFormData((prev) => ({ ...prev, jobId: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      const first = Object.values(errors)[0];
      Swal.fire("Validation Error", first, "error");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Submitting material request...");

      await InsertMaterialRequest(buildRequestBody());
      console.log("Material request submitted successfully:");
      console.log({ ...formData, type, requestedItems });

      Swal.fire("Success", "Material request successfully created!", "success");

      // Optional reset
      setRequestedItems([]);
      setFormData({
        from: "",
        to: "",
        description: "",
        section: "",
        jobId: "",
        costCode: ""
      });
      handleItemSelect(null);
      loadOptions(null);
      setSelectLoading(false);
      handleWarehouseChange(null);
      handleCostCodeChange(null);
      setType("");

      // Clear form errors
      setFormErrors({});

      setSelectedItem(null);
      setSelectedWarehouse(null);
      setSelectedCostCode(null);
      setCostCodes([]);

      //Navigation("./materialRequest.jsx");
      window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Failed to submit request", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    const errs = {};
    const { from, to, description, section } = formData;
    if (!from) errs.from = "Please select a source warehouse.";
    //if (!to || to.trim().length === 0) errs.to = "Please enter a destination.";
    if (!description || description.trim().length === 0)
      errs.description = "Please enter a description.";
    if (!section) errs.section = "Please select a section.";
    if (!type) errs.type = "Please select a request type.";
    if (
      (type === "2" || type === "4") &&
      (!formData.jobId || formData.jobId.trim() === "")
    ) {
      errs.jobId = "Job ID is required for selected maintenance type.";
    }
    if (requestedItems.length === 0)
      errs.items = "Please add at least one item to request.";
    requestedItems.forEach((it, idx) => {
      if (!it.requestQuantity || Number(it.requestQuantity) <= 0) {
        errs[`item_${idx}`] =
          `Request quantity for item ${it.iteM_NUMBER} must be greater than 0.`;
      } else if (Number(it.requestQuantity) > Number(it.availablE_QTY)) {
        errs[`item_${idx}`] =
          `Request quantity for item ${it.iteM_NUMBER} exceeds availability.`;
      }
    });
    return errs;
  };

  const handleWarehouseChange = (option) => {
    setSelectedWarehouse(option);
    setFormData((prev) => ({ ...prev, from: option ? option.label : "" }));
  };

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllWarehousesNEW();
      setWarehouses(data || []);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      setError("Failed to load warehouses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const warehouseOptions = warehouses.map((item) => ({
    value: item.w_ID,
    label: `${item.w_CODE} - ${item.w_NAME}`,
    data: item
  }));

  const loadCostCodes = async (W_id, section, type) => {
    if (!W_id || !section || !type) return;
    setCostCodesLoading(true);
    try {
      const costCodesData = await getAllCostCodesByW_ID_SECTION_AND_TYPE(
        W_id,
        section,
        type
      );
      setCostCodes(costCodesData || []);
      setSelectedCostCode(null);
    } catch (error) {
      console.error("Error fetching cost codes:", error);
      Swal.fire("Error", "Failed to load cost codes", "error");
    } finally {
      setCostCodesLoading(false);
    }
  };

  const handleCostCodeChange = (option) => {
    setSelectedCostCode(option);
    setFormData((prev) => ({
      ...prev,
      costCode: option ? option.label : ""
    }));
  };

  const buildRequestBody = () => {
    const now = new Date().toISOString();

    return {
      materialRequest: {
        mR_ID: 0, // Backend generate
        mR_NO: "", // Backend generate
        sK_NO: "", // Assign Sk PFNo In Backend
        type: Number(type),
        reF_NO: "", // Assign RefNo Using JobId
        cosT_CENTER: 0, // int (Convert.ToInt32(rEF_User.COST_CENTER))
        approveD_BY: "", // Get Head person using Appointed Id in backend
        aproveD_STATUS: 0, // leave for now
        status: 1, // hardcoded as 1 (for Now)
        createD_BY: "", // handle in backend using logged in user
        createD_DATE: now,
        modifieD_BY: "",
        modifieD_DATE: now,
        w_ID: selectedWarehouse?.value || 0,
        cosT_CODE: selectedCostCode?.value || "", //Check this
        description: formData.description,
        nO_OF_ISSUE: requestedItems.length,
        comment: "",
        section: formData.section,
        emargencY_CREATED: "", // rEF_User.PFNO (backend handle this)
        trN_BY: "", // rEF_User.PFNO (backend handle this)
        joB_ID: formData.jobId
      },

      userTransaction: {
        reF_NO: "", // backend sets MR_ID later
        senD_ID: "", // rEF_User.PFNO (backend handle this)
        received: "", // GetApprovalPerson(rEF_User.APPOINTMENT_ID)
        status: 1, // hardcoded as 1 (for Now)
        trN_DATE: now,
        notI_STATUS: 0 // hardcoded as 0 (for Now)
      },

      materialRequestDetails: requestedItems.map((item) => ({
        mR_NO: "",
        iteM_NUMBER: item.iteM_NUMBER,
        qty: Number(item.requestQuantity),
        status: 1,
        trN_BY: "", // rEF_User.PFNO (backend handle this)
        description: item.description,
        mR_ID: 0,
        uom: item.uoM_ID
      }))
    };
  };

  const menu = JSON.parse(localStorage.getItem("menu"));
  console.log("Menu in ItemMove:", menu);

  return (
    <>
      <style jsx>{`
        .container {
          min-height: 70vh;
          background-color: #f5f5f5;
          padding: 4px 4px;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }

        @media (min-width: 768px) {
          .container {
            padding: 2rem 1rem;
          }
        }

        .card {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .header {
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          color: white;
          padding: 10px 10px;
          text-align: center;
          height: 80px;
        }

        @media (min-width: 768px) {
          .header {
            padding: 2rem;
          }
        }

        .header h3 {
          font-size: 1.5rem;
          font-weight: bold;
        }

        @media (min-width: 768px) {
          .header h3 {
            font-size: 2rem;
          }
        }

        .content {
          padding: 1rem;
        }

        @media (min-width: 768px) {
          .content {
            padding: 2rem;
          }
        }

        .form-group {
          margin-bottom: 1.5rem;
          width: 100%;
        }

        .label {
          display: block;
          font-size: 0.95rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        @media (min-width: 768px) {
          .label {
            font-size: 1.1rem;
          }
        }

        .required {
          color: #dc2626;
        }

        .input,
        .textarea {
          width: 100%;
          padding: 0.75rem 0.875rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        @media (min-width: 768px) {
          .input,
          .textarea {
            padding: 0.85rem 1rem;
          }
        }

        .input:focus,
        .textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }

        .textarea {
          min-height: 100px;
          resize: vertical;
        }

        @media (min-width: 768px) {
          .textarea {
            min-height: 120px;
          }
        }

        .radio-group {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        @media (min-width: 480px) {
          .radio-group {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
          }
        }

        @media (min-width: 768px) {
          .radio-group {
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          }
        }

        .radio-item {
          display: flex;
          align-items: center;
          font-size: 0.9rem;
          cursor: pointer;
        }

        @media (min-width: 768px) {
          .radio-item {
            font-size: 1rem;
          }
        }

        .radio-item input {
          margin-right: 0.5rem;
          transform: scale(1.1);
          cursor: pointer;
          min-width: 20px;
        }

        @media (min-width: 768px) {
          .radio-item input {
            margin-right: 0.75rem;
            transform: scale(1.2);
          }
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 1.5rem 0 1rem;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }

        @media (min-width: 768px) {
          .section-title {
            font-size: 1.3rem;
            margin: 2rem 0 1rem;
          }
        }

        .table-container {
          overflow-x: auto;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          margin-top: 1.5rem;
          -webkit-overflow-scrolling: touch;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }

        @media (min-width: 768px) {
          table {
            font-size: 1rem;
          }
        }

        th {
          background-color: #f3f4f6;
          padding: 0.75rem 0.5rem;
          text-align: center;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #4b5563;
          white-space: nowrap;
        }

        @media (min-width: 768px) {
          th {
            padding: 1rem;
            font-size: 0.9rem;
          }
        }

        td {
          padding: 0.75rem 0.5rem;
          border-top: 1px solid #e5e7eb;
        }

        @media (min-width: 768px) {
          td {
            padding: 1rem;
          }
        }

        tr:hover {
          background-color: #f9fafb;
        }

        .qty-input {
          width: 70px;
          padding: 0.4rem;
          text-align: center;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.85rem;
        }

        @media (min-width: 768px) {
          .qty-input {
            width: 100px;
            padding: 0.5rem;
            font-size: 1rem;
          }
        }

        .delete-btn {
          background: #dc2626;
          color: white;
          border: none;
          padding: 0.4rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.8rem;
          transition: all 0.2s;
        }

        @media (min-width: 768px) {
          .delete-btn {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
          }
        }

        .delete-btn:hover {
          background: #b91c1c;
          transform: scale(1.05);
        }

        .submit-btn {
          width: 100%;
          height: 65px;
          background: #2563eb;
          color: white;
          font-size: 1rem;
          font-weight: bold;
          padding: 4px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          margin-top: 1.5rem;
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
          transition: all 0.3s;
        }

        @media (min-width: 768px) {
          .submit-btn {
            font-size: 1.2rem;
            padding: 1.2rem;
            margin-top: 2rem;
          }
        }

        .submit-btn:hover:not(:disabled) {
          background: #1d4ed8;
          transform: translateY(-2px);
        }

        .submit-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }

        .error-alert {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #991b1b;
          padding: 0.875rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          justify-content: space-between;
          align-items: stretch;
        }

        @media (min-width: 480px) {
          .error-alert {
            flex-direction: row;
            align-items: center;
            gap: 1rem;
          }
        }

        .retry-btn {
          background: #dc2626;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        @media (min-width: 480px) {
          .retry-btn {
            width: auto;
            flex-shrink: 0;
          }
        }

        .retry-btn:hover {
          background: #b91c1c;
        }

        .empty-state {
          text-align: center;
          padding: 2rem 1rem;
          background: #f9fafb;
          border-radius: 10px;
          color: #6b7280;
          font-size: 0.95rem;
        }

        @media (min-width: 768px) {
          .empty-state {
            padding: 3rem;
            font-size: 1.1rem;
          }
        }

        .items-search-container {
          max-width: 100%;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 768px) {
          .items-search-container {
            max-width: 500px;
            margin-bottom: 2rem;
          }
        }

        .overlay {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 40;
          border-radius: 12px;
        }
      `}</style>

      <div className="container">
        <div className="card">
          <div className="header">
            <h3 style={{ color: "#DBE3FF", marginBottom: 20 }}>
              Material Request
            </h3>
          </div>

          <div className="content">
            {(loading || isSubmitting) && (
              <div className="overlay">
                <LoadingSpinner
                  size="large"
                  text={isSubmitting ? "Submitting..." : "Loading..."}
                />
              </div>
            )}
            {error && (
              <div className="error-alert">
                <span>{error}</span>
                <button onClick={fetchWarehouses} className="retry-btn">
                  Retry
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Warehouse From - Full Width */}
              <div className="form-group">
                <label className="label">
                  From Warehouse <span className="required">*</span>
                </label>
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <SearchableDropdown
                    options={warehouseOptions}
                    value={selectedWarehouse}
                    onChange={(option) => {
                      handleWarehouseChange(option);
                      loadCostCodes(
                        option?.value || "",
                        formData.section,
                        type
                      );
                    }}
                    placeholder="Select a warehouse..."
                    isLoading={loading}
                    isDisabled={isSubmitting}
                  />
                )}
                {formErrors.from && (
                  <div style={{ color: "#b91c1c", marginTop: 6 }}>
                    {formErrors.from}
                  </div>
                )}
              </div>

              {/* To */}
              <div>
                <label className="label">
                  To <span className="required">*</span>
                </label>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="label">
                  Description <span className="required">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="textarea"
                  placeholder="Describe the purpose of this material request..."
                />
                {formErrors.description && (
                  <div style={{ color: "#b91c1c", marginTop: 6 }}>
                    {formErrors.description}
                  </div>
                )}
              </div>

              {/* Section */}
              <div className="form-group">
                <label className="label">
                  Section <span className="required">*</span>
                </label>
                <div className="radio-group">
                  {[
                    { label: "Unit 1", value: "Unit1" },
                    { label: "Unit 2", value: "Unit2" },
                    { label: "Unit 3", value: "Unit3" },
                    { label: "BOP", value: "BOP" },
                    { label: "Coal Handling", value: "Coal_Handling" },
                    { label: "Civil", value: "Civil" },
                    { label: "Ancillary Service", value: "Ancillary_Service" },
                    { label: "Other", value: "Other" }
                  ].map((section) => (
                    <label key={section.value} className="radio-item">
                      <input
                        type="radio"
                        name="section"
                        value={section.value}
                        checked={formData.section === section.value}
                        onChange={(e) => {
                          handleChange(e);
                          loadCostCodes(
                            selectedWarehouse?.value || "",
                            e.target.value,
                            type
                          );
                        }}
                        required
                        disabled={!selectedWarehouse || isSubmitting}
                      />
                      {section.label}
                    </label>
                  ))}
                </div>
                {formErrors.section && (
                  <div style={{ color: "#b91c1c", marginTop: 6 }}>
                    {formErrors.section}
                  </div>
                )}
              </div>

              {/* Type */}
              <div className="form-group">
                <label className="label">
                  Request Type <span className="required">*</span>
                </label>
                <div style={{ display: "grid", gap: "0.8rem" }}>
                  {[
                    { label: "Personal", value: "1" },
                    { label: "Routine Maintenance", value: "2" },
                    { label: "Special Maintenance (Shutdown)", value: "4" },
                    { label: "Overhaul", value: "3" },
                    { label: "Office Use", value: "5" }
                  ].map((t) => (
                    <label key={t.value} className="radio-item">
                      <input
                        type="radio"
                        name="type"
                        value={t.value}
                        checked={type === t.value}
                        onChange={(e) => {
                          handleTypeChange(e);
                          loadCostCodes(
                            selectedWarehouse?.value || "",
                            formData.section,
                            e.target.value
                          );
                        }}
                        required
                        disabled={!selectedWarehouse || !formData.section}
                      />
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Job ID - Conditional */}
              {(type === "2" || type === "4") && (
                <div className="form-group">
                  <label className="label">
                    Job ID <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="jobId"
                    value={formData.jobId}
                    onChange={handleChange}
                    required
                    className="input"
                    placeholder="Enter Job/Work Order ID"
                  />
                </div>
              )}

              {/* Cost Code */}
              <div className="form-group">
                <label className="label">Cost Code (Optional)</label>
                <SearchableDropdown
                  options={costCodes.map((item) => ({
                    value: item.A_AND_E_CODE || item.a_AND_E_CODE,
                    label: item.DESCRIPTION || item.codE_AND_DEC || "Unknown",
                    data: item
                  }))}
                  value={selectedCostCode}
                  onChange={handleCostCodeChange}
                  placeholder="Search and select cost code..."
                  isLoading={costCodesLoading}
                  isDisabled={isSubmitting}
                />
              </div>

              {/* Add Items */}
              <div className="section-title">Add Items to Request</div>
              <div className="items-search-container">
                <AsyncSelect
                  cacheOptions
                  defaultOptions={false}
                  placeholder="Search items by code or description (min. 2 chars)..."
                  loadOptions={loadOptions}
                  onChange={handleItemSelect}
                  isClearable
                  isLoading={selectLoading}
                  isDisabled={isSubmitting}
                  loadingMessage={() => "Searching items..."}
                  noOptionsMessage={() => "No items found"}
                />
              </div>

              {/* Items Table */}
              {requestedItems.length > 0 ? (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Item Number</th>
                        <th>Description</th>
                        <th>Available Qty</th>
                        <th>Received Qty</th>
                        <th>Net Available</th>
                        <th>UOM</th>
                        <th>Last Price</th>
                        <th>Request Qty</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requestedItems.map((item) => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: "600" }}>
                            {item.iteM_NUMBER}
                          </td>
                          <td>{item.description}</td>
                          <td style={{ textAlign: "center" }}>
                            {item.availablE_QTY}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {item.totaL_TO_BE_ISSUED_QTY || 0}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              fontWeight: "bold",
                              color: "#2e8b57"
                            }}
                          >
                            {Math.max(
                              0,
                              item.availablE_QTY -
                                (item.totaL_TO_BE_ISSUED_QTY || 0)
                            )}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {item.uom || "-"}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {item.lasT_PRICE || "-"}
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={item.requestQuantity}
                              onChange={(e) =>
                                updateRequestQuantity(item.id, e.target.value)
                              }
                              className="qty-input"
                            />
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => deleteItem(item.id)}
                              className="delete-btn"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  No items added yet. Use the search box above to add items to
                  your request.
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={requestedItems.length === 0 || isSubmitting}
                className="submit-btn"
              >
                {isSubmitting ? "Submitting..." : "Request Material"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default MaterialRequest;
