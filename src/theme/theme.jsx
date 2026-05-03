const theme = {
  light: {
    name: "light",
    colors: {
      primary: "#38bdf8",
      primaryHover: "#0ea5e9",
      primaryActive: "#0284c7",
      secondary: "#6b7280",
      secondaryHover: "#4b5563",
      secondaryActive: "#374151",
      background: "#ffffff",
      backgroundAlt: "#f9fafb",
      surface: "#f9fafb",
      surfaceHover: "#f3f4f6",
      text: "#111827",
      textSecondary: "#6b7280",
      textTertiary: "#9ca3af",
      border: "#e5e7eb",
      borderHover: "#d1d5db",
      divider: "#e5e7eb",
      success: "#22c55e",
      successLight: "#dcfce7",
      successDark: "#166534",
      warning: "#facc15",
      warningLight: "#fef9c3",
      warningDark: "#92400e",
      error: "#ef4444",
      errorLight: "#fee2e2",
      errorDark: "#991b1b",
      info: "#38bdf8",
      infoLight: "#e0f2fe",
      infoDark: "#075985",
      disabled: "#d1d5db",
      disabledText: "#9ca3af",
      overlay: "rgba(0, 0, 0, 0.5)",
      focus: "#38bdf8"
    },
    components: {
      button: {
        default: {
          background: "#38bdf8",
          color: "#ffffff",
          hover: "#0ea5e9",
          active: "#0284c7",
          disabled: "#93c5fd",
          disabledColor: "#ffffff",
          shadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
          shadowHover: "0 4px 6px rgba(0, 0, 0, 0.1)"
        },
        secondary: {
          background: "#6b7280",
          color: "#ffffff",
          hover: "#4b5563",
          active: "#374151",
          disabled: "#d1d5db",
          disabledColor: "#ffffff"
        },
        outline: {
          background: "transparent",
          color: "#38bdf8",
          border: "#38bdf8",
          hover: "#38bdf8",
          hoverColor: "#ffffff",
          active: "#0284c7",
          activeColor: "#ffffff",
          disabled: "#93c5fd",
          disabledColor: "#93c5fd"
        },
        ghost: {
          background: "transparent",
          color: "#38bdf8",
          hover: "#f0f9ff",
          active: "#e0f2fe",
          disabled: "transparent",
          disabledColor: "#93c5fd"
        },
        danger: {
          background: "#ef4444",
          color: "#ffffff",
          hover: "#dc2626",
          active: "#b91c1c",
          disabled: "#fca5a5",
          disabledColor: "#ffffff"
        },
        success: {
          background: "#22c55e",
          color: "#ffffff",
          hover: "#16a34a",
          active: "#15803d",
          disabled: "#86efac",
          disabledColor: "#ffffff"
        }
      },
      notification: {
        success: {
          background: "#dcfce7",
          border: "#22c55e",
          color: "#166534",
          icon: "#22c55e"
        },
        warning: {
          background: "#fef9c3",
          border: "#facc15",
          color: "#92400e",
          icon: "#facc15"
        },
        error: {
          background: "#fee2e2",
          border: "#ef4444",
          color: "#991b1b",
          icon: "#ef4444"
        },
        info: {
          background: "#e0f2fe",
          border: "#38bdf8",
          color: "#075985",
          icon: "#38bdf8"
        }
      },
      input: {
        background: "#ffffff",
        border: "#d1d5db",
        borderHover: "#9ca3af",
        borderFocus: "#38bdf8",
        text: "#111827",
        placeholder: "#9ca3af",
        disabled: "#f3f4f6",
        disabledText: "#9ca3af",
        error: "#ef4444",
        success: "#22c55e",
        shadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
        shadowFocus: "0 0 0 3px rgba(56, 189, 248, 0.1)"
      },
      card: {
        background: "#ffffff",
        border: "#e5e7eb",
        shadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        shadowHover: "0 4px 6px rgba(0, 0, 0, 0.1)",
        headerBackground: "#f9fafb",
        headerBorder: "#e5e7eb"
      },
      modal: {
        background: "#ffffff",
        overlay: "rgba(0, 0, 0, 0.5)",
        border: "#e5e7eb",
        shadow: "0 20px 25px rgba(0, 0, 0, 0.15)",
        headerBackground: "#f9fafb",
        headerBorder: "#e5e7eb",
        footerBackground: "#f9fafb",
        footerBorder: "#e5e7eb"
      },
      dropdown: {
        background: "#ffffff",
        border: "#e5e7eb",
        shadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
        itemHover: "#f3f4f6",
        itemActive: "#e0f2fe",
        itemDisabled: "#f9fafb",
        itemDisabledText: "#9ca3af"
      },
      navbar: {
        background: "#ffffff",
        border: "#e5e7eb",
        text: "#111827",
        textHover: "#38bdf8",
        textActive: "#0ea5e9",
        shadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
      },
      sidebar: {
        background: "#f9fafb",
        border: "#e5e7eb",
        itemHover: "#e5e7eb",
        itemActive: "#e0f2fe",
        itemActiveText: "#0ea5e9",
        text: "#6b7280",
        textActive: "#0ea5e9"
      },
      link: {
        color: "#38bdf8",
        hover: "#0ea5e9",
        active: "#0284c7",
        visited: "#7c3aed",
        disabled: "#93c5fd"
      },
      badge: {
        default: {
          background: "#e5e7eb",
          color: "#374151"
        },
        primary: {
          background: "#dbeafe",
          color: "#1e40af"
        },
        success: {
          background: "#dcfce7",
          color: "#166534"
        },
        warning: {
          background: "#fef9c3",
          color: "#92400e"
        },
        error: {
          background: "#fee2e2",
          color: "#991b1b"
        },
        info: {
          background: "#e0f2fe",
          color: "#075985"
        }
      },
      tooltip: {
        background: "#111827",
        color: "#ffffff",
        shadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      },
      progress: {
        background: "#e5e7eb",
        fill: "#38bdf8",
        text: "#6b7280"
      },
      skeleton: {
        base: "#e5e7eb",
        highlight: "#f3f4f6"
      },
      divider: {
        color: "#e5e7eb",
        text: "#6b7280"
      },
      table: {
        headerBackground: "#f9fafb",
        headerText: "#111827",
        headerBorder: "#e5e7eb",
        rowBorder: "#e5e7eb",
        rowHover: "#f9fafb",
        rowStriped: "#f9fafb"
      },
      tab: {
        background: "transparent",
        border: "#e5e7eb",
        text: "#6b7280",
        hover: "#f3f4f6",
        active: "#ffffff",
        activeText: "#38bdf8",
        activeBorder: "#38bdf8"
      },
      chip: {
        background: "#e5e7eb",
        color: "#374151",
        hover: "#d1d5db",
        deleteHover: "#9ca3af"
      },
      switch: {
        background: "#d1d5db",
        backgroundChecked: "#38bdf8",
        thumb: "#ffffff",
        disabled: "#e5e7eb"
      },
      checkbox: {
        border: "#d1d5db",
        background: "#ffffff",
        checked: "#38bdf8",
        checkmark: "#ffffff",
        disabled: "#f3f4f6",
        disabledBorder: "#e5e7eb"
      },
      radio: {
        border: "#d1d5db",
        background: "#ffffff",
        checked: "#38bdf8",
        dot: "#ffffff",
        disabled: "#f3f4f6",
        disabledBorder: "#e5e7eb"
      },
      slider: {
        track: "#e5e7eb",
        fill: "#38bdf8",
        thumb: "#38bdf8",
        thumbBorder: "#ffffff",
        disabled: "#d1d5db"
      },
      accordion: {
        background: "#ffffff",
        border: "#e5e7eb",
        headerBackground: "#f9fafb",
        headerHover: "#f3f4f6",
        headerActive: "#e0f2fe"
      },
      breadcrumb: {
        text: "#6b7280",
        textHover: "#38bdf8",
        textActive: "#111827",
        separator: "#9ca3af"
      },
      pagination: {
        background: "#ffffff",
        border: "#e5e7eb",
        text: "#6b7280",
        hover: "#f3f4f6",
        active: "#38bdf8",
        activeText: "#ffffff",
        disabled: "#f3f4f6",
        disabledText: "#d1d5db"
      },
      alert: {
        success: {
          background: "#dcfce7",
          border: "#22c55e",
          text: "#166534",
          icon: "#22c55e"
        },
        warning: {
          background: "#fef9c3",
          border: "#facc15",
          text: "#92400e",
          icon: "#facc15"
        },
        error: {
          background: "#fee2e2",
          border: "#ef4444",
          text: "#991b1b",
          icon: "#ef4444"
        },
        info: {
          background: "#e0f2fe",
          border: "#38bdf8",
          text: "#075985",
          icon: "#38bdf8"
        }
      },
      spinner: {
        primary: "#38bdf8",
        secondary: "#e5e7eb"
      }
    },
    shadows: {
      none: "none",
      xs: "0 1px 2px rgba(0, 0, 0, 0.05)",
      sm: "0 1px 3px rgba(0, 0, 0, 0.1)",
      md: "0 4px 6px rgba(0, 0, 0, 0.1)",
      lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
      xl: "0 20px 25px rgba(0, 0, 0, 0.15)",
      "2xl": "0 25px 50px rgba(0, 0, 0, 0.25)",
      inner: "inset 0 2px 4px rgba(0, 0, 0, 0.06)"
    },
    borderRadius: {
      none: "0",
      sm: "0.125rem",
      base: "0.25rem",
      md: "0.375rem",
      lg: "0.5rem",
      xl: "0.75rem",
      "2xl": "1rem",
      "3xl": "1.5rem",
      full: "9999px"
    },
    spacing: {
      0: "0",
      1: "0.25rem",
      2: "0.5rem",
      3: "0.75rem",
      4: "1rem",
      5: "1.25rem",
      6: "1.5rem",
      8: "2rem",
      10: "2.5rem",
      12: "3rem",
      16: "4rem",
      20: "5rem",
      24: "6rem",
      32: "8rem"
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem"
    },
    fontWeight: {
      thin: "100",
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800"
    },
    lineHeight: {
      none: "1",
      tight: "1.25",
      snug: "1.375",
      normal: "1.5",
      relaxed: "1.625",
      loose: "2"
    },
    transitions: {
      fast: "150ms ease-in-out",
      base: "200ms ease-in-out",
      slow: "300ms ease-in-out",
      slower: "500ms ease-in-out"
    },
    zIndex: {
      dropdown: 1000,
      sticky: 1020,
      fixed: 1030,
      modalBackdrop: 1040,
      modal: 1050,
      popover: 1060,
      tooltip: 1070
    }
  },
  dark: {
    name: "dark",
    colors: {
      primary: "#0ea5e9",
      primaryHover: "#38bdf8",
      primaryActive: "#7dd3fc",
      secondary: "#9ca3af",
      secondaryHover: "#d1d5db",
      secondaryActive: "#e5e7eb",
      background: "#111827",
      backgroundAlt: "#0f172a",
      surface: "#1f2937",
      surfaceHover: "#374151",
      text: "#f9fafb",
      textSecondary: "#d1d5db",
      textTertiary: "#9ca3af",
      border: "#374151",
      borderHover: "#4b5563",
      divider: "#374151",
      success: "#22c55e",
      successLight: "#14532d",
      successDark: "#dcfce7",
      warning: "#facc15",
      warningLight: "#78350f",
      warningDark: "#fef9c3",
      error: "#ef4444",
      errorLight: "#7f1d1d",
      errorDark: "#fee2e2",
      info: "#38bdf8",
      infoLight: "#0c4a6e",
      infoDark: "#e0f2fe",
      disabled: "#4b5563",
      disabledText: "#6b7280",
      overlay: "rgba(0, 0, 0, 0.75)",
      focus: "#38bdf8"
    },
    components: {
      button: {
        default: {
          background: "#0ea5e9",
          color: "#ffffff",
          hover: "#38bdf8",
          active: "#7dd3fc",
          disabled: "#164e63",
          disabledColor: "#6b7280",
          shadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
          shadowHover: "0 4px 6px rgba(0, 0, 0, 0.4)"
        },
        secondary: {
          background: "#374151",
          color: "#f9fafb",
          hover: "#4b5563",
          active: "#6b7280",
          disabled: "#1f2937",
          disabledColor: "#6b7280"
        },
        outline: {
          background: "transparent",
          color: "#0ea5e9",
          border: "#0ea5e9",
          hover: "#0ea5e9",
          hoverColor: "#111827",
          active: "#38bdf8",
          activeColor: "#111827",
          disabled: "#164e63",
          disabledColor: "#164e63"
        },
        ghost: {
          background: "transparent",
          color: "#0ea5e9",
          hover: "#1e3a4f",
          active: "#0c4a6e",
          disabled: "transparent",
          disabledColor: "#164e63"
        },
        danger: {
          background: "#ef4444",
          color: "#ffffff",
          hover: "#f87171",
          active: "#fca5a5",
          disabled: "#7f1d1d",
          disabledColor: "#6b7280"
        },
        success: {
          background: "#22c55e",
          color: "#ffffff",
          hover: "#4ade80",
          active: "#86efac",
          disabled: "#14532d",
          disabledColor: "#6b7280"
        }
      },
      notification: {
        success: {
          background: "#14532d",
          border: "#22c55e",
          color: "#dcfce7",
          icon: "#22c55e"
        },
        warning: {
          background: "#78350f",
          border: "#facc15",
          color: "#fef9c3",
          icon: "#facc15"
        },
        error: {
          background: "#7f1d1d",
          border: "#ef4444",
          color: "#fee2e2",
          icon: "#ef4444"
        },
        info: {
          background: "#0c4a6e",
          border: "#38bdf8",
          color: "#e0f2fe",
          icon: "#38bdf8"
        }
      },
      input: {
        background: "#1f2937",
        border: "#4b5563",
        borderHover: "#6b7280",
        borderFocus: "#0ea5e9",
        text: "#f9fafb",
        placeholder: "#6b7280",
        disabled: "#111827",
        disabledText: "#4b5563",
        error: "#ef4444",
        success: "#22c55e",
        shadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
        shadowFocus: "0 0 0 3px rgba(14, 165, 233, 0.2)"
      },
      card: {
        background: "#1f2937",
        border: "#374151",
        shadow: "0 1px 3px rgba(0, 0, 0, 0.5)",
        shadowHover: "0 4px 6px rgba(0, 0, 0, 0.5)",
        headerBackground: "#111827",
        headerBorder: "#374151"
      },
      modal: {
        background: "#1f2937",
        overlay: "rgba(0, 0, 0, 0.75)",
        border: "#374151",
        shadow: "0 20px 25px rgba(0, 0, 0, 0.5)",
        headerBackground: "#111827",
        headerBorder: "#374151",
        footerBackground: "#111827",
        footerBorder: "#374151"
      },
      dropdown: {
        background: "#1f2937",
        border: "#374151",
        shadow: "0 10px 15px rgba(0, 0, 0, 0.5)",
        itemHover: "#374151",
        itemActive: "#0c4a6e",
        itemDisabled: "#111827",
        itemDisabledText: "#6b7280"
      },
      navbar: {
        background: "#1f2937",
        border: "#374151",
        text: "#f9fafb",
        textHover: "#38bdf8",
        textActive: "#0ea5e9",
        shadow: "0 1px 3px rgba(0, 0, 0, 0.5)"
      },
      sidebar: {
        background: "#111827",
        border: "#374151",
        itemHover: "#1f2937",
        itemActive: "#0c4a6e",
        itemActiveText: "#38bdf8",
        text: "#9ca3af",
        textActive: "#38bdf8"
      },
      link: {
        color: "#38bdf8",
        hover: "#7dd3fc",
        active: "#bae6fd",
        visited: "#c4b5fd",
        disabled: "#164e63"
      },
      badge: {
        default: {
          background: "#374151",
          color: "#d1d5db"
        },
        primary: {
          background: "#0c4a6e",
          color: "#bae6fd"
        },
        success: {
          background: "#14532d",
          color: "#dcfce7"
        },
        warning: {
          background: "#78350f",
          color: "#fef9c3"
        },
        error: {
          background: "#7f1d1d",
          color: "#fee2e2"
        },
        info: {
          background: "#0c4a6e",
          color: "#e0f2fe"
        }
      },
      tooltip: {
        background: "#374151",
        color: "#f9fafb",
        shadow: "0 4px 6px rgba(0, 0, 0, 0.5)"
      },
      progress: {
        background: "#374151",
        fill: "#0ea5e9",
        text: "#d1d5db"
      },
      skeleton: {
        base: "#374151",
        highlight: "#4b5563"
      },
      divider: {
        color: "#374151",
        text: "#9ca3af"
      },
      table: {
        headerBackground: "#111827",
        headerText: "#f9fafb",
        headerBorder: "#374151",
        rowBorder: "#374151",
        rowHover: "#1f2937",
        rowStriped: "#1a202e"
      },
      tab: {
        background: "transparent",
        border: "#374151",
        text: "#9ca3af",
        hover: "#1f2937",
        active: "#1f2937",
        activeText: "#38bdf8",
        activeBorder: "#38bdf8"
      },
      chip: {
        background: "#374151",
        color: "#d1d5db",
        hover: "#4b5563",
        deleteHover: "#9ca3af"
      },
      switch: {
        background: "#4b5563",
        backgroundChecked: "#0ea5e9",
        thumb: "#f9fafb",
        disabled: "#374151"
      },
      checkbox: {
        border: "#4b5563",
        background: "#1f2937",
        checked: "#0ea5e9",
        checkmark: "#ffffff",
        disabled: "#111827",
        disabledBorder: "#374151"
      },
      radio: {
        border: "#4b5563",
        background: "#1f2937",
        checked: "#0ea5e9",
        dot: "#ffffff",
        disabled: "#111827",
        disabledBorder: "#374151"
      },
      slider: {
        track: "#374151",
        fill: "#0ea5e9",
        thumb: "#0ea5e9",
        thumbBorder: "#f9fafb",
        disabled: "#4b5563"
      },
      accordion: {
        background: "#1f2937",
        border: "#374151",
        headerBackground: "#111827",
        headerHover: "#1f2937",
        headerActive: "#0c4a6e"
      },
      breadcrumb: {
        text: "#9ca3af",
        textHover: "#38bdf8",
        textActive: "#f9fafb",
        separator: "#6b7280"
      },
      pagination: {
        background: "#1f2937",
        border: "#374151",
        text: "#d1d5db",
        hover: "#374151",
        active: "#0ea5e9",
        activeText: "#ffffff",
        disabled: "#111827",
        disabledText: "#4b5563"
      },
      alert: {
        success: {
          background: "#14532d",
          border: "#22c55e",
          text: "#dcfce7",
          icon: "#22c55e"
        },
        warning: {
          background: "#78350f",
          border: "#facc15",
          text: "#fef9c3",
          icon: "#facc15"
        },
        error: {
          background: "#7f1d1d",
          border: "#ef4444",
          text: "#fee2e2",
          icon: "#ef4444"
        },
        info: {
          background: "#0c4a6e",
          border: "#38bdf8",
          text: "#e0f2fe",
          icon: "#38bdf8"
        }
      },
      spinner: {
        primary: "#0ea5e9",
        secondary: "#374151"
      }
    },
    shadows: {
      none: "none",
      xs: "0 1px 2px rgba(0, 0, 0, 0.3)",
      sm: "0 1px 3px rgba(0, 0, 0, 0.5)",
      md: "0 4px 6px rgba(0, 0, 0, 0.5)",
      lg: "0 10px 15px rgba(0, 0, 0, 0.5)",
      xl: "0 20px 25px rgba(0, 0, 0, 0.6)",
      "2xl": "0 25px 50px rgba(0, 0, 0, 0.75)",
      inner: "inset 0 2px 4px rgba(0, 0, 0, 0.3)"
    },
    borderRadius: {
      none: "0",
      sm: "0.125rem",
      base: "0.25rem",
      md: "0.375rem",
      lg: "0.5rem",
      xl: "0.75rem",
      "2xl": "1rem",
      "3xl": "1.5rem",
      full: "9999px"
    },
    spacing: {
      0: "0",
      1: "0.25rem",
      2: "0.5rem",
      3: "0.75rem",
      4: "1rem",
      5: "1.25rem",
      6: "1.5rem",
      8: "2rem",
      10: "2.5rem",
      12: "3rem",
      16: "4rem",
      20: "5rem",
      24: "6rem",
      32: "8rem"
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem"
    },
    fontWeight: {
      thin: "100",
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800"
    },
    lineHeight: {
      none: "1",
      tight: "1.25",
      snug: "1.375",
      normal: "1.5",
      relaxed: "1.625",
      loose: "2"
    },
    transitions: {
      fast: "150ms ease-in-out",
      base: "200ms ease-in-out",
      slow: "300ms ease-in-out",
      slower: "500ms ease-in-out"
    },
    zIndex: {
      dropdown: 1000,
      sticky: 1020,
      fixed: 1030,
      modalBackdrop: 1040,
      modal: 1050,
      popover: 1060,
      tooltip: 1070
    }
  }
};

export default theme;
