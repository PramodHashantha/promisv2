import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import '../../../../public/assets/scss/themes/components/_modal.scss'

const ModalBoxSection = ({
  isOpen,
  section,
  onClose,
  onSave,
  onResetPassword,
  onDelete,
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const modalRef = useRef(null);

  useEffect(() => {
    if (section && typeof section === "object") {
      setFormData({
        sectionName: section.sectioN_NAME || "",
      });
      setErrors({});
    } else {
      console.warn("Section is undefined or invalid:", section);
    }
  }, [section]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        sectionName: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.sectionName) newErrors.sectionName = "Section Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        sectionName: formData.sectionName,
      });
    }
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
        onDelete(section);
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
    <div className="modal-overlay-new" role="dialog" aria-labelledby="modal-title" aria-modal="true">
      <div ref={modalRef} className="modal-content-new">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close modal">
          ✕
        </button>
        <h2 id="modal-title" className="modal-title">
          Enter Section Details
        </h2>
        {Object.keys(errors).length > 0 && (
          <div className="modal-errors" role="alert" aria-live="assertive">
            Please correct the following errors:
            <ul>
              {Object.values(errors).map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="sectionName">Section Name</label>
                <input
                  type="text"
                  id="sectionName"
                  name="sectionName"
                  value={formData.sectionName || ""}
                  onChange={handleInputChange}
                  aria-invalid={!!errors.sectionName}
                  aria-describedby={errors.sectionName ? "sectionName-error" : undefined}
                />
                {errors.sectionName && (
                  <p id="sectionName-error" className="error-message">
                    {errors.sectionName}
                  </p>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <div className="danger-actions">
                <button type="button" onClick={handleDelete} className="brand-btn-danger">
                  Delete Section
                </button>
              </div>
              <div className="save-actions">
                <button type="submit" className="brand-btn-primary">
                  Save Changes
                </button>
                <button type="button" onClick={onClose} className="brand-btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ModalBoxSection;