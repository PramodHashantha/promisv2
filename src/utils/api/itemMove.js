import { apiInsertItemMoveDetails } from "../api/http";

export const InsertItemMoveDetails = async (itemMoveDetails) =>
  apiInsertItemMoveDetails(`/api/Store/insertItemMoveDetails`, itemMoveDetails);
