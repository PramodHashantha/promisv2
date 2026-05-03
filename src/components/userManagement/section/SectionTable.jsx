import  { useEffect, useState } from "react";
import Table from "@/components/shared/table/Table";
import ModalBoxSection from "@/components/userManagement/section/ModalBoxSection";
import Swal from "sweetalert2";
import { getAllSections } from "@/utils/api/api";
import TableSkeleton from "@/components/skeletons/TableSkeleton"
//import withReactContent from "sweetalert2-react-content";

//const MySwal = withReactContent(Swal);

const SectionTable = () => {
  const [sections, setSections] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      console.log("Fetching sections...");
      setLoading(true);
      getAllSections()
      .then((data) => {
        console.log("API Response:", data); // Debug: Log API response
        if (!Array.isArray(data)) {
            console.error("Expected an array from getAllSections, got:", data);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Invalid data format from server."
          });
          return;
        }
        // Map Sections to include onEdit function
          const updatedSections = data
          .map((section, index) => {
              if (!section || typeof section !== "object") {
                  console.warn(`Invalid user data at index ${index}:`, section);
              return null;
            }
            return {
                ...section,
              onEdit: () => {
                  console.log("Edit clicked for user:", section); // Debug: Log user data
                  setSelectedSection(section);
                setIsModalOpen(true);
              }
            };
          })
              .filter((section) => section !== null); // Remove invalid users
        setSections(updatedSections);
        setLoading(false);
      })
      .catch((error) => {
          console.error("Error fetching sections:", error);
          setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `Failed to fetch sections. ${error.message}`
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
      accessorKey: "sectioN_ID",
      header: () => "SECTION ID"
    },
    {
      accessorKey: "sectioN_NAME",
      header: () => "SECTION NAME"
    },
    {
      accessorKey: "qty",
      header: () => "APPOINTMENTS"
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
    setSelectedSection(null);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedSection(null);
  };


  const handleDelete = async (section) => {
    try {
      // Call your API to delete user
      // const response = await deleteUser(user.pfno);
      setSections(sections.filter((u) => u.section_id !== section.section_id));
      Swal.fire("Deleted!", "Section has been deleted", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to delete section", error);
    }
  };

  return (
    <div>
      <h3>Plant Sections</h3>
      {loading ? (
        <TableSkeleton columns={columns} rows={10} />
      ) : (
        <Table
          columns={columns}
          data={sections}
          pagination
          highlightOnHover
          striped
        />
      )}
      <ModalBoxSection
        isOpen={isModalOpen}
        section={selectedSection}
        onClose={handleClose}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default SectionTable;
