// import React, { useState, useEffect } from 'react';
// import Swal from 'sweetalert2';
// import { accessControlAPI } from '@/utils/api/accessControlApi';
// import PageHeader from '@/components/shared/pageHeader/PageHeader';
// import Footer from '@/components/shared/Footer';
// import LoadingSpinner from '@/components/loading/LoadingSpinner';
// import AppointmentSelector from '@/components/userManagement/accessControl/AppointmentSelector';
// import DefaultPermissionSelector from '@/components/userManagement/accessControl/DefaultPermissionSelector';
// import DefaultPermissionCreator from '@/components/userManagement/accessControl/DefaultPermissionCreator';
// import NavigationTree from '@/components/userManagement/accessControl/NavigationTree';

// const Index = () => {
//   const [appointments, setAppointments] = useState([]);
//   const [selectedAppointment, setSelectedAppointment] = useState('');
//   const [navigationTree, setNavigationTree] = useState([]);
//   const [defaultPermissions, setDefaultPermissions] = useState([]);
//   const [selectedDefault, setSelectedDefault] = useState('');
//   const [defaultPermissionName, setDefaultPermissionName] = useState('');
//   const [checkedNodes, setCheckedNodes] = useState(new Set());
//   const [loading, setLoading] = useState(false);
//   const [isAdmin, setIsAdmin] = useState(false);

//   useEffect(() => {
//     initialize();
//   }, []);

//   const initialize = async () => {
//     try {
//       setLoading(true);

//       // Check admin status
//       const adminStatus = await accessControlAPI.isAdmin();
//       setIsAdmin(adminStatus);

//       // Load appointments
//       const appointmentsData = await accessControlAPI.getAllAppointments();
//       setAppointments(appointmentsData || []);

//       // Load default permissions if admin
//       if (adminStatus) {
//         const defaultsData = await accessControlAPI.getDefaultPermissions();
//         setDefaultPermissions(defaultsData || []);
//       }
//     } catch (error) {
//       console.error('Error initializing:', error);
//       Swal.fire('Error', 'Failed to load initial data', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAppointmentChange = async (e) => {
//     const appointmentId = e.target.value;
//     setSelectedAppointment(appointmentId);
//     setSelectedDefault(''); // Clear radio button selection

//     if (appointmentId) {
//       await loadNavigationTree(parseInt(appointmentId), null);
//     } else {
//       setNavigationTree([]);
//       setCheckedNodes(new Set());
//     }
//   };

//   const handleDefaultChange = async (e) => {
//     const defaultName = e.target.value;
//     setSelectedDefault(defaultName);
//     setSelectedAppointment(''); // Clear dropdown selection

//     if (defaultName) {
//       await loadNavigationTree(null, defaultName);
//     } else {
//       setNavigationTree([]);
//       setCheckedNodes(new Set());
//     }
//   };

//   const loadNavigationTree = async (appointmentId, defaultName) => {
//     try {
//       setLoading(true);
//       const tree = await accessControlAPI.getNavigationTree(appointmentId, defaultName);

//       if (!tree || !Array.isArray(tree)) {
//         console.error('Invalid tree response:', tree);
//         setNavigationTree([]);
//         setCheckedNodes(new Set());
//         Swal.fire('Error', 'Invalid navigation tree data received', 'error');
//         return;
//       }

//       setNavigationTree(tree);

//       // Collect checked nodes - only from leaf nodes
//       const checked = new Set();
//       const collectChecked = (nodes) => {
//         if (!Array.isArray(nodes)) return;
//         nodes.forEach(node => {
//           if (!node) return;
//           // Only add if it's checked AND it's a leaf node (no children)
//           if (node.IsChecked && (!node.Children || node.Children.length === 0)) {
//             checked.add(node.NAV_ID);
//           }
//           if (node.Children && node.Children.length > 0) {
//             collectChecked(node.Children);
//           }
//         });
//       };
//       collectChecked(tree);
//       setCheckedNodes(checked);
//     } catch (error) {
//       console.error('Error loading navigation tree:', error);
//       console.error('Error details:', error.message, error.stack);
//       setNavigationTree([]);
//       setCheckedNodes(new Set());

//       // Show more detailed error message
//       const errorMessage = error.response?.data?.error || error.message || 'Failed to load navigation tree';
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: errorMessage,
//         footer: 'Check browser console for more details'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCheckChange = (nodeId, node, isChecked) => {
//     const newChecked = new Set(checkedNodes);

//     if (isChecked) {
//       // Add this node
//       newChecked.add(nodeId);

//       // Find and add parent (mimicking old code behavior)
//       const findParent = (nodes, targetId) => {
//         for (const n of nodes) {
//           if (n.Children) {
//             const found = n.Children.find(c => c.NAV_ID === targetId);
//             if (found) return n;
//             const parent = findParent(n.Children, targetId);
//             if (parent) return parent;
//           }
//         }
//         return null;
//       };

//       const parent = findParent(navigationTree, nodeId);
//       if (parent) {
//         newChecked.add(parent.NAV_ID);
//       }
//     } else {
//       // Uncheck this node and all children
//       newChecked.delete(nodeId);
//       const uncheckChildren = (n) => {
//         if (n.Children) {
//           n.Children.forEach(child => {
//             newChecked.delete(child.NAV_ID);
//             uncheckChildren(child);
//           });
//         }
//       };
//       uncheckChildren(node);
//     }

//     setCheckedNodes(newChecked);
//   };

//   const handleSave = async () => {
//     if (!selectedAppointment) {
//       Swal.fire('Warning', 'Please select an appointment', 'warning');
//       return;
//     }

//     if (checkedNodes.size === 0) {
//       Swal.fire('Warning', 'Please select at least one menu item', 'warning');
//       return;
//     }

//     try {
//       setLoading(true);
//       const result = await accessControlAPI.savePermissions(
//         parseInt(selectedAppointment),
//         Array.from(checkedNodes)
//       );

//       if (result.success) {
//         await Swal.fire('Success', result.message || 'Saved Successfully', 'success');
//         // Reload tree
//         await loadNavigationTree(parseInt(selectedAppointment), null);
//       }
//     } catch (error) {
//       console.error('Error saving permissions:', error);
//       Swal.fire('Error', 'Failed to save permissions', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveDefault = async () => {
//     if (!defaultPermissionName.trim()) {
//       Swal.fire('Warning', 'Permission name cannot be empty', 'warning');
//       return;
//     }

//     if (checkedNodes.size === 0) {
//       Swal.fire('Warning', 'Please select at least one menu item', 'warning');
//       return;
//     }

//     try {
//       setLoading(true);
//       const result = await accessControlAPI.saveDefaultPermissions(
//         defaultPermissionName,
//         Array.from(checkedNodes)
//       );

//       if (result.success) {
//         await Swal.fire('Success', result.message || 'Saved Successfully', 'success');
//         setDefaultPermissionName('');

//         // Reload default permissions list
//         const defaultsData = await accessControlAPI.getDefaultPermissions();
//         setDefaultPermissions(defaultsData || []);

//         // Clear the tree
//         setNavigationTree([]);
//         setCheckedNodes(new Set());
//       }
//     } catch (error) {
//       console.error('Error saving default permissions:', error);
//       Swal.fire('Error', 'Failed to save default permissions', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleClear = () => {
//     setSelectedAppointment('');
//     setSelectedDefault('');
//     setNavigationTree([]);
//     setCheckedNodes(new Set());
//   };

//   const handleClearDefaultName = () => {
//     setDefaultPermissionName('');
//   };

//   return (
//     <>
//       <PageHeader>
//         <h1 className="page-title">User Access Management</h1>
//       </PageHeader>

//       <div className="main-content">
//         <style>{`
//           .access-control-container {
//             padding: 20px;
//           }

//           .row {
//             display: flex;
//             gap: 20px;
//             flex-wrap: wrap;
//           }

//           .col-left {
//             flex: 0 0 33.333%;
//             max-width: 33.333%;
//           }

//           .col-right {
//             flex: 0 0 66.666%;
//             max-width: 66.666%;
//           }

//           @media (max-width: 768px) {
//             .col-left, .col-right {
//               flex: 0 0 100%;
//               max-width: 100%;
//             }
//           }

//           .card {
//             background: white;
//             border-radius: 8px;
//             box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
//             padding: 20px;
//             margin-bottom: 20px;
//           }

//           .card-title {
//             font-size: 16px;
//             font-weight: 600;
//             margin-bottom: 16px;
//             color: #1f2937;
//           }

//           .button-group {
//             display: flex;
//             gap: 10px;
//             justify-content: flex-end;
//             margin-top: 20px;
//           }

//           .btn {
//             padding: 10px 20px;
//             border: none;
//             border-radius: 6px;
//             font-weight: 600;
//             cursor: pointer;
//             transition: all 0.3s ease;
//             font-size: 14px;
//           }

//           .btn:disabled {
//             opacity: 0.6;
//             cursor: not-allowed;
//           }

//           .btn-primary {
//             background: #fbbf24;
//             color: #000;
//           }

//           .btn-primary:hover:not(:disabled) {
//             background: #f59e0b;
//             transform: translateY(-2px);
//             box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
//           }

//           .btn-secondary {
//             background: #6b7280;
//             color: white;
//           }

//           .btn-secondary:hover:not(:disabled) {
//             background: #4b5563;
//           }

//           .empty-state {
//             text-align: center;
//             padding: 40px;
//             color: #9ca3af;
//           }
//         `}</style>

//         <div className="access-control-container">
//           {loading && (
//             <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
//               <LoadingSpinner text="Loading..." />
//             </div>
//           )}

//           {!loading && (
//             <div className="row">
//               <div className="col-left">
//                 <div className="card">
//                   <AppointmentSelector
//                     appointments={appointments}
//                     selectedAppointment={selectedAppointment}
//                     onAppointmentChange={handleAppointmentChange}
//                     disabled={loading}
//                   />

//                   {isAdmin && (
//                     <DefaultPermissionSelector
//                       defaultPermissions={defaultPermissions}
//                       selectedDefault={selectedDefault}
//                       onDefaultChange={handleDefaultChange}
//                       disabled={loading}
//                     />
//                   )}

//                   <div className="button-group">
//                     <button
//                       className="btn btn-secondary"
//                       onClick={handleClear}
//                       disabled={loading}
//                     >
//                       Clear
//                     </button>
//                     <button
//                       className="btn btn-primary"
//                       onClick={handleSave}
//                       disabled={loading || !selectedAppointment}
//                     >
//                       Save
//                     </button>
//                   </div>
//                 </div>

//                 {isAdmin && (
//                   <DefaultPermissionCreator
//                     permissionName={defaultPermissionName}
//                     onPermissionNameChange={(e) => setDefaultPermissionName(e.target.value)}
//                     onSave={handleSaveDefault}
//                     onClear={handleClearDefaultName}
//                     disabled={loading}
//                   />
//                 )}
//               </div>

//               <div className="col-right">
//                 <div className="card">
//                   <h3 className="card-title">Navigation Menu Permissions</h3>
//                   {navigationTree.length > 0 ? (
//                     <NavigationTree
//                       nodes={navigationTree}
//                       checkedNodes={checkedNodes}
//                       onCheckChange={handleCheckChange}
//                     />
//                   ) : (
//                     <div className="empty-state">
//                       <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📋</div>
//                       <p>Select an appointment or default permission to view menu items</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       <Footer />
//     </>
//   );
// };

// export default Index;
