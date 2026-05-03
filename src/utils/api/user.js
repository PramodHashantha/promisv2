import { loginUser as loginUserApi } from "./http";
import { GetUser as GetUser } from "./http";
// ✅ Get all users
export const getAllUsers = () => GetUser("/api/User");

// // ✅ Get user by ID
// export const getUserById = (id) => GetUser(`/api/User/${id}`);

// // ✅ Create new user
// export const createUser = (data) => apiPost("/api/users", data);

// // ✅ Update user
// export const updateUser = (id, data) => apiPut(`/api/users/${id}`, data);

// // ✅ Delete user
// export const deleteUser = (id) => apiDelete(`/api/users/${id}`);

// ✅ Login user
export const loginUser = (PFNO, Password) =>
  loginUserApi("/api/Auth/loginDev", { PFNO, Password });

// // ✅ Register user
// export const registerUser = (data) => apiPost("/api/users/register", data);

// // ✅ Get current logged-in user's profile
// export const getProfile = () => apiGet("/api/users/profile");

// // ✅ Update user role (Admin side)
// export const updateUserRole = (id, role) =>
//   apiPut(`/api/users/${id}/role`, { role });

// // ✅ Change user password
// export const changePassword = (id, passwords) =>
//   apiPut(`/api/users/${id}/change-password`, passwords);

// // ✅ Search users by name or email
// export const searchUsers = (query) =>
//   apiGet(`/api/users/search?query=${encodeURIComponent(query)}`);

//GetUserDropDown
export const getUserDropDown = () => GetUser("/api/User/GetUserDropDown");
