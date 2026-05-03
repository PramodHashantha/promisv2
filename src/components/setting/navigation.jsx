import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import SectionHeader from "@/components/shared/SectionHeader";
import {
  getNavigationById,
  getNavigationManagementItems,
  getNavigationParents,
  saveNavigationItem,
} from "@/utils/api/api";

const INITIAL_FORM = {
  navId: 0,
  hasParent: "0",
  navParentId: "",
  navName: "",
  redirectTo: "",
  navFaIcon: "zmdi zmdi-assignment",
  status: "1",
};

const buildTree = (items) => {
  const map = new Map();
  const roots = [];

  items.forEach((item) => {
    map.set(item.navId, { ...item, children: [] });
  });

  map.forEach((node) => {
    const parentId = Number(node.navParentId || 0);
    if (parentId > 0 && map.has(parentId)) {
      map.get(parentId).children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortByName = (a, b) => a.navName.localeCompare(b.navName);
  const sortRecursive = (nodes) => {
    nodes.sort(sortByName);
    nodes.forEach((node) => sortRecursive(node.children));
  };

  sortRecursive(roots);
  return roots;
};

const collectExpandableIds = (nodes) => {
  const ids = [];
  const walk = (list) => {
    list.forEach((node) => {
      if (node.children?.length > 0) {
        ids.push(node.navId);
        walk(node.children);
      }
    });
  };
  walk(nodes);
  return ids;
};

const Navigation = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [items, setItems] = useState([]);
  const [parents, setParents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const tree = useMemo(() => buildTree(items), [items]);
  const showParent = form.hasParent === "1";

  const normalizeRedirect = (value) =>
    value.toLowerCase().endsWith(".aspx") ? value.slice(0, -5) : value;

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setSelectedId(null);
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [allItems, parentItems] = await Promise.all([
        getNavigationManagementItems(),
        getNavigationParents(),
      ]);
      setItems(Array.isArray(allItems) ? allItems : []);
      setParents(Array.isArray(parentItems) ? parentItems : []);
    } catch (error) {
      await Swal.fire("Error", error.message || "Failed to load navigation data.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    setExpandedIds(new Set(collectExpandableIds(tree)));
  }, [tree]);

  const handleSelectNode = async (navId) => {
    try {
      const data = await getNavigationById(navId);
      console.log("Selected navigation data:", data);
      const parentId = Number(data?.navParentId || 0);
      setForm({
        navId: data?.navId || 0,
        hasParent: parentId > 0 ? "1" : "0",
        navParentId: parentId > 0 ? String(parentId) : "",
        navName: data?.navName || "",
        redirectTo: normalizeRedirect(data?.redirectTo || ""),
        navFaIcon: data?.navFaIcon || "zmdi zmdi-assignment",
        status: String(data?.status ?? 1),
      });
      setSelectedId(navId);
    } catch (error) {
      await Swal.fire("Error", error.message || "Unable to load selected menu item.", "error");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.navName.trim()) {
      await Swal.fire("Validation", "Menu item name is required.", "warning");
      return;
    }

    if (showParent && !form.redirectTo.trim()) {
      await Swal.fire("Validation", "Redirect page name is required.", "warning");
      return;
    }

    if (showParent && !form.navParentId) {
      await Swal.fire("Validation", "Please select a parent menu.", "warning");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        NavId: form.navId,
        NavName: form.navName.trim(),
        RedirectTo: showParent ? form.redirectTo.trim() : null,
        NavFaIcon: showParent ? null : form.navFaIcon.trim(),
        NavParentId: showParent ? Number(form.navParentId) : 0,
        Status: Number(form.status),
      };

      await saveNavigationItem(payload);
      await Swal.fire("Success", "Navigation saved successfully.", "success");
      await loadInitialData();
      resetForm();
    } catch (error) {
      await Swal.fire("Error", error.message || "Failed to save navigation item.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleNode = (navId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(navId)) {
        next.delete(navId);
      } else {
        next.add(navId);
      }
      return next;
    });
  };

  const renderNode = (node, level = 0) => (
    <li key={node.navId} className="mb-1">
      <div className="d-flex align-items-center" style={{ paddingLeft: `${level * 20}px` }}>
        {node.children?.length > 0 ? (
          <button
            type="button"
            onClick={() => toggleNode(node.navId)}
            className="btn btn-link p-0 me-2 text-decoration-none text-dark"
            style={{ width: "12px", fontSize: "11px", lineHeight: 1 }}
          >
            {expandedIds.has(node.navId) ? "⊟" : "⊞"}
          </button>
        ) : (
          <span className="me-2" style={{ width: "12px", color: "#444" }}>
            ◦
          </span>
        )}

        <button
          type="button"
          onClick={() => handleSelectNode(node.navId)}
          className="btn btn-link p-0 text-start text-decoration-none"
          style={{
            color: selectedId === node.navId ? "#111" : "#222",
            backgroundColor: selectedId === node.navId ? "#d9d9d9" : "transparent",
            padding: "2px 6px",
            borderRadius: "2px",
            fontWeight: selectedId === node.navId ? 500 : 400,
          }}
        >
          {node.navName}
        </button>
      </div>

      {node.children?.length > 0 && expandedIds.has(node.navId) && (
        <ul className="list-unstyled mt-1">{node.children.map((child) => renderNode(child, level + 1))}</ul>
      )}
    </li>
  );

  return (
    <div className="col-12">
      <SectionHeader title="Site Navigation Management" />
      <div className="row g-3">
        <div className="col-xl-5">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSave}>
                <div className="mb-3">
                  <label className="form-label">Is your new menu item has a parent item?</label>
                  <select
                    className="form-select"
                    value={form.hasParent}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        hasParent: e.target.value,
                        navParentId: e.target.value === "1" ? prev.navParentId : "",
                      }))
                    }
                  >
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </div>

                {showParent && (
                  <div className="mb-3">
                    <label className="form-label">Select Your Parent</label>
                    <select
                      className="form-select"
                      value={form.navParentId}
                      onChange={(e) => setForm((prev) => ({ ...prev, navParentId: e.target.value }))}
                    >
                      <option value="">Select parent</option>
                      {parents.map((p) => (
                        <option key={p.navId} value={p.navId}>
                          {p.navName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Menu Item Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.navName}
                    onChange={(e) => setForm((prev) => ({ ...prev, navName: e.target.value }))}
                  />
                </div>

                {showParent && (
                <div className="mb-3">
                  <label className="form-label">This will redirect to..(Page Name)</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={form.redirectTo}
                      onChange={(e) => setForm((prev) => ({ ...prev, redirectTo: e.target.value }))}
                    />
                    {/* <span className="input-group-text">.jsx</span> */}
                  </div>
                </div>
                )}

                {!showParent && (
                  <div className="mb-3">
                    <label className="form-label">Menu Item Icon</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.navFaIcon}
                      onChange={(e) => setForm((prev) => ({ ...prev, navFaIcon: e.target.value }))}
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="0">Disabled</option>
                    <option value="1">Enabled</option>
                  </select>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Clear
                  </button>
                  <button type="submit" className="btn btn-primary px-4" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-xl-7">
          <div className="card">
            <div className="card-body">
              {isLoading ? (
                <div className="text-muted">Loading navigation tree...</div>
              ) : (
                <ul className="list-unstyled mb-0 text-xl">
                  {tree.map((node) => renderNode(node))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;