import React, { useEffect, useState } from "react";
import { getAllUsers } from "../../utils/api/user";
import Table from "@/components/shared/table/Table";
import ModalBox from "@/components/users/ModalBox";
import LoadingSpinner from "@/components/loading/LoadingSpinner";
import Swal from "sweetalert2";

const MaterialRequestsTable = () => {
const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("Fetching users...");
    setLoading(true);
    getAllUsers()
      .then((data) => {
        console.log("API Response:", data); // Debug: Log API response
        if (!Array.isArray(data)) {
          console.error("Expected an array from getAllUsers, got:", data);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Invalid data format from server."
          });
          return;
        }
        // Map users to include onEdit function
        const updatedUsers = data
          .map((user, index) => {
            if (!user || typeof user !== "object") {
              console.warn(`Invalid user data at index ${index}:`, user);
              return null;
            }
            return {
              ...user,
              onEdit: () => {
                console.log("Edit clicked for user:", user); // Debug: Log user data
                setSelectedUser(user);
                setIsModalOpen(true);
              }
            };
          })
          .filter((user) => user !== null); // Remove invalid users
        setUsers(updatedUsers);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `Failed to fetch users. ${error.message}`
        });
      });
  }, []);

  const columns = [
    {
      accessorKey: "edit",
      header: () => "Edit",
      cell: ({ row }) => (
        <button
          onClick={() => {
            //console.log("Button clicked for row:", row.original);
            row.original.onEdit();
          }}
          className="brand-btn-primary brand-btn-sm"
        >
          Edit
        </button>
      )
    },
    {
      accessorKey: "pfno",
      header: () => "PFNO"
    },
    {
      accessorKey: "initial",
      header: () => "Initials"
    },
    {
      accessorKey: "surname",
      header: () => "Surname"
    },
    {
      accessorKey: "fullname",
      header: () => "Full Name"
    },
    {
      accessorKey: "titles",
      header: () => "Title"
    },
    {
      accessorKey: "email",
      header: () => "Email"
    },
    {
      accessorKey: "phonE_NUMBER",
      header: () => "Phone Number"
    },
    {
      accessorKey: "appandsection",
      header: () => "Section"
    },
    {
      accessorKey: "designation",
      header: () => "Designation"
    },
    {
      accessorKey: "creatE_DATE",
      header: () => "Creation Date"
    }
  ];

  const handleSave = (formData) => {
    // Implement API call to save updated user data
    console.log("Form Data:", formData);
    // Example: updateUser(selectedUser.id, formData).then(() => {
    //   setUsers(updatedUsers);
    //   setIsModalOpen(false);
    // });
    alert("User details saved successfully!");
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };
  const handleResetPassword = async (user) => {
    try {
      // Call your API to reset password
      // const response = await resetUserPassword(user.pfno);
      Swal.fire("Success", "Password has been reset", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to reset password", "error");
    }
  };

  const handleDelete = async (user) => {
    try {
      // Call your API to delete user
      // const response = await deleteUser(user.pfno);
      setUsers(users.filter((u) => u.pfno !== user.pfno));
      Swal.fire("Deleted!", "User has been deleted", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to delete user", "error");
    }
  };

  return (
    <div>
      <h3>Material Requests</h3>
      {loading ? (
        <LoadingSpinner
          size="large"
          variant="success"
          text="Loading users..."
        />
      ) : (
        <Table
          columns={columns}
          data={users}
          pagination
          highlightOnHover
          striped
        />
      )}
      <ModalBox
        isOpen={isModalOpen}
        user={selectedUser}
        onClose={handleClose}
        onSave={handleSave}
        onResetPassword={handleResetPassword}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default MaterialRequestsTable