import { getItemsByItemNoOrDescription as getItemsByItemNoOrDescriptionApi } from "./http";

// ✅ Get items by item number or description
export const getItems = async (searchText, signal) => {
  try {
    const response = await getItemsByItemNoOrDescriptionApi(
      "/api/Store/SearchStoreByItemAndDescription",
      { searchText },
      signal
    );
    return response.data || response;
  } catch (error) {
    console.error("Error in getItems:", error);
    throw error;
  }
};
