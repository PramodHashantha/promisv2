import { apiGetCostCode } from "../api/http";

export const getAllCostCodesByW_ID_SECTION_AND_TYPE = (W_ID, section, type) =>
  apiGetCostCode(`/api/MaterialRequest/costcode/${W_ID}/${section}/${type}`);
