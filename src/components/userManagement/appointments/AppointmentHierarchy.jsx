import React, { useState, useMemo } from 'react';
import { FaPlusSquare, FaMinusSquare } from 'react-icons/fa';

const TreeNode = ({ node }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const hasChildren = node.children && node.children.length > 0;

  // Format the text similar to C# APPANDSECTION: usually AppointmentName + (SectionName)
  const displayText = `${node.appandsection}`.trim();

  return (
    <div style={{ marginLeft: '20px', marginTop: '4px', fontFamily: 'Arial, sans-serif' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', cursor: hasChildren ? 'pointer' : 'default' }}
        onClick={hasChildren ? toggleExpand : undefined}
      >
        {hasChildren ? (
          isExpanded ? (
            <FaMinusSquare className="text-secondary me-2" style={{ fontSize: '0.9em' }} />
          ) : (
            <FaPlusSquare className="text-secondary me-2" style={{ fontSize: '0.9em' }} />
          )
        ) : (
          <span style={{ display: 'inline-block', width: '1em', marginRight: '0.5rem' }}></span> // Spacer for alignment if no children
        )}
        <span style={{ color: '#007bff' }}>
          {displayText}
        </span>
      </div>

      {isExpanded && hasChildren && (
        <div style={{ paddingLeft: '8px', borderLeft: '1px dashed #ccc', marginLeft: '6px' }}>
          {node.children.map((childNode) => (
            <TreeNode key={childNode.appointmenT_ID} node={childNode} />
          ))}
        </div>
      )}
    </div>
  );
};

const AppointmentHierarchy = ({ appointments }) => {
  const treeData = useMemo(() => {
    if (!appointments || appointments.length === 0) return [];

    const tree = [];
    const map = {};

    // First pass: initialize the map
    appointments.forEach((item) => {
      // Use fallback properties for IDs if case difference exists
      const id = item.appointmenT_ID || item.appointmentId || item.id;
      if (id != null) {
        map[id] = { ...item, children: [] };
      }
    });

    // Second pass: build the hierarchy
    appointments.forEach((item) => {
      const id = item.appointmenT_ID || item.appointmentId || item.id;
      // Match the exact field name used in the API, e.g. parenT_APPOINTMENT_ID
      const rawParentId = item.parenT_APPOINTMENT_ID !== undefined ? item.parenT_APPOINTMENT_ID :
        item.partenT_APPOINTMENT_ID !== undefined ? item.partenT_APPOINTMENT_ID :
          item.parentAppointmentId;

      const parentId = String(rawParentId);

      // In the old C#, root nodes had PARENT_APPOINTMENT_ID = '0'
      if (parentId && parentId !== '0' && parentId !== 'null' && map[parentId] && id !== 1) { // Old code excluded ID=1
        map[parentId].children.push(map[id]);
      } else {
        if (id !== 1 && id !== '1' && map[id]) { // Following the `dr["APPOINTMENT_ID"].ToString() != "1"` from C#
          tree.push(map[id]);
        }
      }
    });

    return tree;
  }, [appointments]);

  if (!appointments || appointments.length === 0) {
    return <div className="text-muted p-3">No hierarchy data available.</div>;
  }

  return (
    <div className="card mt-4 shadow-sm">
      <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
        <h5 className="mb-0">Appointments Hierarchy</h5>
      </div>
      <div className="card-body pt-2">
        <div className="hierarchy-tree-container p-3 bg-light rounded" style={{ overflowX: 'auto', backgroundColor: '#fdfdfd' }}>
          {treeData.length > 0 ? (
            treeData.map((node) => <TreeNode key={node.appointmenT_ID} node={node} />)
          ) : (
            <span className="text-muted">No root appointments found. Make sure parent IDs are correctly mapped.</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentHierarchy;
