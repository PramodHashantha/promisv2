import React from "react";
import Select from "react-select";
import PropTypes from "prop-types";

const SearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  isSearchable = true,
  isClearable = true,
  isDisabled = false,
  isLoading = false,
  className = "",
  ...props
}) => {
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? "#2563eb" : "#e5e7eb",
      boxShadow: state.isFocused ? "0 0 0 1px #2563eb" : "none",
      "&:hover": {
        borderColor: "#2563eb"
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#2563eb"
        : state.isFocused
        ? "#e5e7eb"
        : "transparent",
      color: state.isSelected ? "white" : "black"
    })
  };

  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isSearchable={isSearchable}
      isClearable={isClearable}
      isDisabled={isDisabled}
      isLoading={isLoading}
      className={`react-select-container ${className}`}
      classNamePrefix="react-select"
      styles={customStyles}
      {...props}
    />
  );
};

SearchableDropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      label: PropTypes.string.isRequired,
      data: PropTypes.object
    })
  ).isRequired,
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  isSearchable: PropTypes.bool,
  isClearable: PropTypes.bool,
  isDisabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  className: PropTypes.string
};

export default SearchableDropdown;
