import { apiInsertMaterialRequest } from "../api/http";

export const InsertMaterialRequest = async (materialRequestData) =>
  apiInsertMaterialRequest(`/api/MaterialRequest`, materialRequestData);
