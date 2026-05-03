import React from "react";
import Dropdown from "@/components/shared/Dropdown";
import { FiPaperclip } from "react-icons/fi";
import {
  BsFiletypePdf,
  BsFiletypeCsv,
  BsFiletypeXml,
  BsFiletypeTsx,
  BsFiletypeExe,
  BsPrinter
} from "react-icons/bs";

const fileType = [
  { label: "PDF", icon: <BsFiletypePdf /> },
  { label: "CSV", icon: <BsFiletypeCsv /> },
  { label: "XML", icon: <BsFiletypeXml /> },
  { label: "Text", icon: <BsFiletypeTsx /> },
  { label: "Excel", icon: <BsFiletypeExe /> },
  { label: "Print", icon: <BsPrinter /> }
];
const UserHeader = () => {
  return (
    <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
      <Dropdown
        dropdownItems={fileType}
        triggerPosition={"0, 12"}
        triggerIcon={<FiPaperclip size={16} strokeWidth={1.6} />}
        triggerClass="btn btn-icon btn-light-brand"
        iconStrokeWidth={0}
        isAvatar={false}
      />
    </div>
  );
};
export default React.memo(UserHeader);
