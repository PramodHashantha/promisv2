import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";

const ModalBox = ({
  isOpen,
  user,
  onClose,
  onSave,
  onResetPassword,
  onDelete
}) => {
  const [formData, setFormData] = useState({
    title: "",
    initials: "",
    surname: "",
    fullName: "",
    section: "",
    designation: "",
    phoneNumber: "",
    pfno: "",
    email: "",
    sex: "",
    profileImage: null,
    signatureImage: null
  });
  const [errors, setErrors] = useState({});
  const [previews, setPreviews] = useState({
    profile: null,
    signature: null
  });
  const modalRef = useRef(null);

  useEffect(() => {
    if (user && typeof user === "object") {
      setFormData({
        title: user.titles || "",
        initials: user.initial || "",
        surname: user.surname || "",
        fullName:
          user.fullname || `${user.initial || ""} ${user.surname || ""}`.trim(),
        section: user.appandsection || "",
        designation: user.designation || "",
        phoneNumber: user.phonE_NUMBER || "",
        pfno: user.pfno || "",
        email: user.email || "",
        sex: user.sex || ""
      });
      setErrors({});
    } else {
      console.warn("User is undefined or invalid:", user);
    }
  }, [user]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: "",
        initials: "",
        surname: "",
        fullName: "",
        section: "",
        designation: "",
        phoneNumber: "",
        pfno: "",
        email: "",
        sex: "",
        profileImage: null,
        signatureImage: null
      });
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
      const rect = modalRef.current.getBoundingClientRect();
      const container = modalRef.current.parentElement;
      const containerStyles = window.getComputedStyle(container);
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.initials) newErrors.initials = "Initials are required";
    if (!formData.surname) newErrors.surname = "Surname is required";
    if (!formData.fullName) newErrors.fullName = "Full Name is required";
    if (!formData.section) newErrors.section = "Section is required";
    if (!formData.designation)
      newErrors.designation = "Designation is required";
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber))
      newErrors.phoneNumber = "Phone number must be 10 digits";
    if (!formData.pfno) newErrors.pfno = "P.F No is required";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Valid email is required";
    if (!formData.sex) newErrors.sex = "Sex is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (name === "initials" || name === "surname") {
      setFormData((prev) => ({
        ...prev,
        fullName: `${prev.initials || ""} ${prev.surname || ""}`.trim()
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        ...formData,
        titles: formData.title,
        initial: formData.initials,
        appandsection: formData.section,
        phonE_NUMBER: formData.phoneNumber,
        fullname: formData.fullName
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
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete(user);
      }
    });
  };

  const handleResetPassword = () => {
    Swal.fire({
      title: "Reset Password?",
      text: "This will reset the user's password",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, reset it!"
    }).then((result) => {
      if (result.isConfirmed) {
        onResetPassword(user);
      }
    });
  };

  const validateImageDimensions = (file, callback) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      if (img.width === 144 && img.height === 50) {
        callback(true);
      } else {
        Swal.fire("Invalid Dimensions", "Image must be 144×50 pixels", "error");
        callback(false);
      }
    };
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/png")) {
      Swal.fire("Invalid Format", "Please upload PNG files only", "error");
      return;
    }

    validateImageDimensions(file, (isValid) => {
      if (isValid) {
        setFormData((prev) => ({ ...prev, [type]: file }));
        setPreviews((prev) => ({
          ...prev,
          [type === "profileImage" ? "profile" : "signature"]:
            URL.createObjectURL(file)
        }));
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
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        height: "100vh",
        width: "100vw",
        overflow: "hidden"
      }}
      role="dialog"
      aria-labelledby="modal-title"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        style={{
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          borderRadius: "0.5rem",
          maxWidth: "99rem",          
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 10px 15px rgba(0, 0, 0, 0.2)",
          position: "relative"
        }}
      >
        <button
          type="button"
          style={{
            position: "absolute",
            top: "0.5rem",
            right: "0.5rem",
            color: "#6B7280",
            fontSize: "1.25rem",
            cursor: "pointer",
            background: "none",
            border: "none"
          }}
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>
        <h2
          id="modal-title"
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            marginBottom: "1rem"
          }}
        >
          Edit User Details
        </h2>
        {Object.keys(errors).length > 0 && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.5rem",
              backgroundColor: "#FEE2E2",
              color: "#B91C1C",
              borderRadius: "0.25rem"
            }}
            role="alert"
            aria-live="assertive"
          >
            Please correct the following errors:
            <ul style={{ paddingLeft: "1.25rem", listStyleType: "disc" }}>
              {Object.values(errors).map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem"
              }}
            >
              <div
                style={{
                  display: "grid"
                }}
              >
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "500",
                      marginBottom: "0.25rem"
                    }}
                  >
                    Title
                  </label>
                  <select
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: errors.title
                        ? "1px solid #EF4444"
                        : "1px solid #D1D5DB",
                      borderRadius: "0.25rem"
                    }}
                    aria-invalid={!!errors.title}
                    aria-describedby={errors.title ? "title-error" : undefined}
                  >
                    <option value="">Select Title</option>
                    <option value="Eng">Eng</option>
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Ms">Ms</option>
                  </select>
                  {errors.title && (
                    <p
                      id="title-error"
                      style={{
                        color: "#EF4444",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem"
                      }}
                    >
                      {errors.title}
                    </p>
                  )}
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "500",
                      marginBottom: "0.25rem"
                    }}
                  >
                    Initials
                  </label>
                  <input
                    type="text"
                    name="initials"
                    value={formData.initials}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: errors.initials
                        ? "1px solid #EF4444"
                        : "1px solid #D1D5DB",
                      borderRadius: "0.25rem"
                    }}
                    aria-invalid={!!errors.initials}
                    aria-describedby={
                      errors.initials ? "initials-error" : undefined
                    }
                  />
                  {errors.initials && (
                    <p
                      id="initials-error"
                      style={{
                        color: "#EF4444",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem"
                      }}
                    >
                      {errors.initials}
                    </p>
                  )}
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "500",
                      marginBottom: "0.25rem"
                    }}
                  >
                    Surname
                  </label>
                  <input
                    type="text"
                    name="surname"
                    value={formData.surname}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: errors.surname
                        ? "1px solid #EF4444"
                        : "1px solid #D1D5DB",
                      borderRadius: "0.25rem"
                    }}
                    aria-invalid={!!errors.surname}
                    aria-describedby={
                      errors.surname ? "surname-error" : undefined
                    }
                  />
                  {errors.surname && (
                    <p
                      id="surname-error"
                      style={{
                        color: "#EF4444",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem"
                      }}
                    >
                      {errors.surname}
                    </p>
                  )}
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "500",
                      marginBottom: "0.25rem"
                    }}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    readOnly
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #D1D5DB",
                      borderRadius: "0.25rem",
                      backgroundColor: "#F3F4F6",
                      cursor: "not-allowed"
                    }}
                    aria-describedby={
                      errors.fullName ? "fullName-error" : undefined
                    }
                  />
                  {errors.fullName && (
                    <p
                      id="fullName-error"
                      style={{
                        color: "#EF4444",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem"
                      }}
                    >
                      {errors.fullName}
                    </p>
                  )}
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "500",
                      marginBottom: "0.25rem"
                    }}
                  >
                    Appointment :
                  </label>
                  <input
                    type="text"
                    name="Appointment "
                    value={formData.section}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: errors.section
                        ? "1px solid #EF4444"
                        : "1px solid #D1D5DB",
                      borderRadius: "0.25rem"
                    }}
                    aria-invalid={!!errors.section}
                    aria-describedby={
                      errors.section ? "section-error" : undefined
                    }
                  />
                  {errors.section && (
                    <p
                      id="section-error"
                      style={{
                        color: "#EF4444",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem"
                      }}
                    >
                      {errors.section}
                    </p>
                  )}
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "500",
                      marginBottom: "0.25rem"
                    }}
                  >
                    Designation
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: errors.designation
                        ? "1px solid #EF4444"
                        : "1px solid #D1D5DB",
                      borderRadius: "0.25rem"
                    }}
                    aria-invalid={!!errors.designation}
                    aria-describedby={
                      errors.designation ? "designation-error" : undefined
                    }
                  />
                  {errors.designation && (
                    <p
                      id="designation-error"
                      style={{
                        color: "#EF4444",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem"
                      }}
                    >
                      {errors.designation}
                    </p>
                  )}
                </div>
              </div>
              <div style={{ display: "grid" }}>
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "500",
                      marginBottom: "0.25rem"
                    }}
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: errors.phoneNumber
                        ? "1px solid #EF4444"
                        : "1px solid #D1D5DB",
                      borderRadius: "0.25rem"
                    }}
                    aria-invalid={!!errors.phoneNumber}
                    aria-describedby={
                      errors.phoneNumber ? "phoneNumber-error" : undefined
                    }
                  />
                  {errors.phoneNumber && (
                    <p
                      id="phoneNumber-error"
                      style={{
                        color: "#EF4444",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem"
                      }}
                    >
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>
                <div style={{ marginBottom: "0rem" }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "500",
                      marginBottom: "0rem"
                    }}
                  >
                    P.F No
                  </label>
                  <input
                    type="text"
                    name="pfno"
                    value={formData.pfno}
                    readOnly
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #D1D5DB",
                      borderRadius: "0.25rem",
                      backgroundColor: "#F3F4F6",
                      cursor: "not-allowed"
                    }}
                  />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "500",
                      marginBottom: "0.25rem"
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: errors.email
                        ? "1px solid #EF4444"
                        : "1px solid #D1D5DB",
                      borderRadius: "0.25rem"
                    }}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p
                      id="email-error"
                      style={{
                        color: "#EF4444",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem"
                      }}
                    >
                      {errors.email}
                    </p>
                  )}
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "500",
                      marginBottom: "0.25rem"
                    }}
                  >
                    Sex
                  </label>
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: errors.sex
                        ? "1px solid #EF4444"
                        : "1px solid #D1D5DB",
                      borderRadius: "0.25rem"
                    }}
                    aria-invalid={!!errors.sex}
                    aria-describedby={errors.sex ? "sex-error" : undefined}
                  >
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  {errors.sex && (
                    <p
                      id="sex-error"
                      style={{
                        color: "#EF4444",
                        fontSize: "0.875rem",
                        marginTop: "0.25rem"
                      }}
                    >
                      {errors.sex}
                    </p>
                  )}
                </div>

                {/* Image Uploads - Profile and Signature */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <h4
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "600",
                      marginBottom: "0.5rem"
                    }}
                  >
                    Uploads
                  </h4>
                  <div style={{ marginBottom: "1rem" }}>
                    <label
                      style={{
                        display: "block",
                        fontWeight: "500",
                        marginBottom: "0.25rem"
                      }}
                    >
                      Profile Image (144×50 pixels, PNG only)
                    </label>
                    <input
                      type="file"
                      accept=".png"
                      onChange={(e) => handleImageUpload(e, "profileImage")}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #D1D5DB",
                        borderRadius: "0.25rem",
                        backgroundColor: "#F9FAFB",
                        cursor: "pointer"
                      }}
                    />
                    {previews.profile && (
                      <img
                        src={previews.profile}
                        alt="Profile Preview"
                        style={{
                          marginTop: "0.5rem",
                          maxWidth: "144px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "0.25rem"
                        }}
                      />
                    )}
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label
                      style={{
                        display: "block",
                        fontWeight: "500",
                        marginBottom: "0.25rem"
                      }}
                    >
                      Signature Image (144×50 pixels, PNG only)
                    </label>
                    <input
                      type="file"
                      accept=".png"
                      onChange={(e) => handleImageUpload(e, "signatureImage")}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #D1D5DB",
                        borderRadius: "0.25rem",
                        backgroundColor: "#F9FAFB",
                        cursor: "pointer"
                      }}
                    />
                    {previews.signature && (
                      <img
                        src={previews.signature}
                        alt="Signature Preview"
                        style={{
                          marginTop: "0.5rem",
                          maxWidth: "144px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "0.25rem"
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "2rem",
                borderTop: "1px solid #E5E7EB",
                paddingTop: "1rem"
              }}
            >
              {/* Left side - Danger actions */}
              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  type="button"
                  onClick={handleDelete}
                  style={{
                    backgroundColor: "#DC2626",
                    color: "#ffffff",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.25rem",
                    cursor: "pointer",
                    border: "none"
                  }}
                >
                  Delete User
                </button>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  style={{
                    backgroundColor: "#F59E0B",
                    color: "#ffffff",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.25rem",
                    cursor: "pointer",
                    border: "none"
                  }}
                >
                  Reset Password
                </button>
              </div>

              {/* Right side - Save/Cancel */}
              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#3B82F6",
                    color: "#ffffff",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.25rem",
                    cursor: "pointer",
                    border: "none"
                  }}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    backgroundColor: "#6B7280",
                    color: "#ffffff",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.25rem",
                    cursor: "pointer",
                    border: "none"
                  }}
                >
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

export default ModalBox;
