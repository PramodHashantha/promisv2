import React from 'react';

const NavigationTree = ({ nodes, checkedNodes, onCheckChange }) => {
  const renderNode = (node, level = 0) => {
    const isChecked = checkedNodes.has(node.NAV_ID);
    const hasChildren = node.Children && node.Children.length > 0;

    const handleCheckboxChange = (e) => {
      e.stopPropagation();
      onCheckChange(node.NAV_ID, node, e.target.checked);
    };

    return (
      <div key={node.NAV_ID} style={{ marginLeft: level * 20 + 'px' }}>
        <div
          style={{
            padding: '10px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            background: level === 0 ? '#f9fafb' : 'white',
          }}
        >
          {/* Only show checkbox for leaf nodes (nodes without children) */}
          {!hasChildren && (
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxChange}
              style={{
                marginRight: '10px',
                width: '18px',
                height: '18px',
                cursor: 'pointer'
              }}
            />
          )}
          {/* Show folder icon for parent nodes */}
          {hasChildren && (
            <span style={{ marginRight: '10px', width: '18px', display: 'inline-block' }}>
              📁
            </span>
          )}
          <span
            style={{
              fontWeight: level === 0 ? 600 : 400,
              color: level === 0 ? '#1f2937' : '#374151',
              fontSize: level === 0 ? '14px' : '13px'
            }}
          >
            {node.NAV_NAME}
          </span>
        </div>
        {hasChildren && (
          <div>
            {node.Children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="navigation-tree">
      <style>{`
        .navigation-tree {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          max-height: 600px;
          overflow-y: auto;
          background: white;
        }

        .navigation-tree::-webkit-scrollbar {
          width: 8px;
        }

        .navigation-tree::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .navigation-tree::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }

        .navigation-tree::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
      {nodes && nodes.length > 0 ? (
        nodes.map(node => renderNode(node, 0))
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📋</div>
          <p>No navigation items found</p>
        </div>
      )}
    </div>
  );
};

export default NavigationTree;