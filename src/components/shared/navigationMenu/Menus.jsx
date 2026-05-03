import React, { Fragment, useEffect, useState } from "react";
import { FiChevronRight } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import getIcon from "@/utils/getIcon";
import { useAuth } from "../../../context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

// Normalize a path for safe comparison — always ensures a leading slash
const normPath = (p) => {
  if (!p || p === "#" || p.includes(".aspx")) return null; // skip empty, hash, and legacy ASP paths
  const cleaned = p.toLowerCase().replace(/\/$/, ""); // strip trailing slash
  return cleaned.startsWith("/") ? cleaned : `/${cleaned}`; // ensure leading slash
};

// Get the navigation path with a leading slash for <Link to={}>
const navPath = (p) => {
  if (!p || p === "#" || p.includes(".aspx")) return "#";
  return p.startsWith("/") ? p : `/${p}`;
};

// Recursively find the item in the tree whose path matches the current URL
const findActiveItem = (items, pathName) => {
  const currentPath = pathName.toLowerCase().replace(/\/$/, "");

  for (const item of items) {
    const itemPath = normPath(item.path);

    // Check item itself (leaf items that navigate)
    if (itemPath && currentPath === itemPath) {
      return { item, parent: null, grandParent: null };
    }

    // Check dropdown children
    if (item.dropdownMenu?.length) {
      for (const child of item.dropdownMenu) {
        const childPath = normPath(child.path);

        if (childPath && currentPath === childPath) {
          return { item: child, parent: item, grandParent: null };
        }

        // Check sub-dropdown children
        if (child.subdropdownMenu?.length) {
          for (const grandChild of child.subdropdownMenu) {
            const grandChildPath = normPath(grandChild.path);
            if (grandChildPath && currentPath === grandChildPath) {
              return { item: grandChild, parent: child, grandParent: item };
            }
          }
        }
      }
    }
  }

  // Fallback: partial prefix match (longest match wins)
  let bestMatch = null;
  let bestMatchLength = 0;

  const checkPrefix = (item, parent, grandParent) => {
    const p = normPath(item.path);
    if (p && currentPath.startsWith(p) && p.length > bestMatchLength) {
      bestMatch = { item, parent, grandParent };
      bestMatchLength = p.length;
    }
  };

  for (const item of items) {
    checkPrefix(item, null, null);
    if (item.dropdownMenu?.length) {
      for (const child of item.dropdownMenu) {
        checkPrefix(child, item, null);
        if (child.subdropdownMenu?.length) {
          for (const grandChild of child.subdropdownMenu) {
            checkPrefix(grandChild, child, item);
          }
        }
      }
    }
  }

  return bestMatch;
};


const Menus = () => {
  const { menu } = useAuth();
  const [menuList, setMenuList] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openSubDropdown, setOpenSubDropdown] = useState(null);
  const [activeItemId, setActiveItemId] = useState(null);
  const [activeParentId, setActiveParentId] = useState(null);
  const [activeGrandParentId, setActiveGrandParentId] = useState(null);
  const pathName = useLocation().pathname;

  useEffect(() => {
    if (menu) {
      setMenuList(menu);
    }
  }, [menu]);

  // Sync active state from URL whenever path or menu changes
  useEffect(() => {
    if (menuList.length === 0) return;

    const result = findActiveItem(menuList, pathName);
    if (result) {
      const { item, parent, grandParent } = result;
      setActiveItemId(item.id);
      setActiveParentId(parent?.id ?? null);
      setActiveGrandParentId(grandParent?.id ?? null);

      // Keep parent dropdown open
      if (grandParent) {
        setOpenDropdown(grandParent.id);
        setOpenSubDropdown(parent.id);
      } else if (parent) {
        setOpenDropdown(parent.id);
        setOpenSubDropdown(null);
      } else {
        setOpenDropdown(null);
        setOpenSubDropdown(null);
      }
    }
  }, [pathName, menuList]);

  const handleMainMenu = (id) => {
    setOpenDropdown(prev => prev === id ? null : id);
  };

  const handleDropdownMenu = (e, id) => {
    e.stopPropagation();
    setOpenSubDropdown(prev => prev === id ? null : id);
  };

  // Listen for 'minimenu' class changes on document.documentElement (Sidebar collapse state)
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains("minimenu")) {
      setIsMinimized(true);
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          const minimized = document.documentElement.classList.contains("minimenu");
          setIsMinimized(minimized);
          if (minimized) {
            setOpenDropdown(null);
            setOpenSubDropdown(null);
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Listen for mouse enter/leave on the sidebar container
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  useEffect(() => {
    const sidebar = document.querySelector('.nxl-navigation');

    const handleMouseEnter = () => {
      if (document.documentElement.classList.contains('minimenu')) {
        setIsSidebarHovered(true);
      }
    };

    const handleMouseLeave = () => {
      setIsSidebarHovered(false);
      if (document.documentElement.classList.contains('minimenu')) {
        setOpenDropdown(null);
        setOpenSubDropdown(null);
      }
    };

    if (sidebar) {
      sidebar.addEventListener('mouseenter', handleMouseEnter);
      sidebar.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (sidebar) {
        sidebar.removeEventListener('mouseenter', handleMouseEnter);
        sidebar.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  const menuAnimation = {
    hidden: {
      height: 0,
      opacity: 0,
      overflow: "hidden",
      transition: {
        height: { duration: 0.3, ease: "easeInOut" },
        when: "afterChildren",
      },
    },
    show: {
      height: "auto",
      opacity: 1,
      overflow: "hidden",
      transition: {
        height: { type: "spring", bounce: 0, duration: 0.4 },
        when: "beforeChildren",
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20, transition: { duration: 0.2 } },
    show: { opacity: 1, x: 0, transition: { duration: 0.2 } },
  };

  const textVariants = {
    hidden: { opacity: 0, width: 0, display: "none", transition: { duration: 0 } },
    show: { opacity: 1, width: "auto", display: "inline-block", transition: { delay: 0.2, duration: 0.2 } },
  };

  return (
    <>
      {menuList.map((menuItem) => {
        const { id, name, path, icon, isLeaf, dropdownMenu } = menuItem;
        const hasChildren = dropdownMenu && dropdownMenu.length > 0;
        const isActive = activeItemId === id || activeParentId === id || activeGrandParentId === id;
        const isOpen = openDropdown === id;

        return (
          <li
            key={id}
            className={`nxl-item ${hasChildren ? "nxl-hasmenu" : ""} ${isActive ? "active nxl-trigger" : ""}`}
          >
            {/* Leaf items with no children — direct navigation link */}
            {isLeaf && !hasChildren ? (
              <Link to={navPath(path)} className="nxl-link text-capitalize">
                <span className="nxl-micon">{getIcon(icon)}</span>
                <motion.span
                  className="nxl-mtext"
                  style={{ paddingLeft: "2.5px", whiteSpace: "nowrap" }}
                  variants={textVariants}
                  initial="hidden"
                  animate={(!isMinimized || isSidebarHovered) ? "show" : "hidden"}
                >
                  {name}
                </motion.span>
              </Link>
            ) : (
              /* Non-leaf (group) — expand/collapse on click */
              <div
                className="nxl-link text-capitalize"
                style={{ cursor: "pointer" }}
                onClick={() => handleMainMenu(id)}
              >
                <span className="nxl-micon">{getIcon(icon)}</span>
                <motion.span
                  className="nxl-mtext"
                  style={{ paddingLeft: "2.5px", whiteSpace: "nowrap" }}
                  variants={textVariants}
                  initial="hidden"
                  animate={(!isMinimized || isSidebarHovered) ? "show" : "hidden"}
                >
                  {name}
                </motion.span>
                {(!isMinimized || isSidebarHovered) && (
                  <span
                    className="nxl-arrow fs-16"
                    style={{
                      transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.3s ease",
                      display: "inline-flex",
                    }}
                  >
                    <FiChevronRight />
                  </span>
                )}
              </div>
            )}

            {/* Dropdown submenu */}
            <AnimatePresence>
              {isOpen && hasChildren && (
                <motion.ul
                  className="nxl-submenu"
                  variants={menuAnimation}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                >
                  {dropdownMenu.map((child) => {
                    const childIsActive = activeItemId === child.id || activeParentId === child.id;
                    const childIsOpen = openSubDropdown === child.id;
                    const childHasSub = child.subdropdownMenu?.length > 0;

                    return (
                      <Fragment key={child.id}>
                        {childHasSub ? (
                          <motion.li
                            variants={itemVariants}
                            className={`nxl-item nxl-hasmenu ${childIsActive ? "active" : ""}`}
                          >
                            <div
                              className="nxl-link text-capitalize"
                              style={{ cursor: "pointer" }}
                              onClick={(e) => handleDropdownMenu(e, child.id)}
                            >
                              <span className="nxl-mtext">{child.name}</span>
                              <span className="nxl-arrow">
                                <i><FiChevronRight /></i>
                              </span>
                            </div>

                            <AnimatePresence>
                              {childIsOpen && (
                                <motion.ul
                                  className="nxl-submenu"
                                  variants={menuAnimation}
                                  initial="hidden"
                                  animate="show"
                                  exit="hidden"
                                >
                                  {child.subdropdownMenu.map((grandChild) => (
                                    <motion.li
                                      variants={itemVariants}
                                      key={grandChild.id}
                                      className={`nxl-item ${activeItemId === grandChild.id ? "active" : ""}`}
                                    >
                                      <Link className="nxl-link text-capitalize" to={navPath(grandChild.path)}>
                                        {grandChild.name}
                                      </Link>
                                    </motion.li>
                                  ))}
                                </motion.ul>
                              )}
                            </AnimatePresence>
                          </motion.li>
                        ) : (
                          <motion.li
                            variants={itemVariants}
                            className={`nxl-item ${activeItemId === child.id ? "active" : ""}`}
                          >
                            <Link className="nxl-link" to={navPath(child.path)}>
                              {child.name}
                            </Link>
                          </motion.li>
                        )}
                      </Fragment>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </>
  );
};

export default Menus;
