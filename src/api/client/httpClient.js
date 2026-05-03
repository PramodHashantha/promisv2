//const BASE_URL = import.meta.env.VITE_API_BASE_URL;

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Helper to get headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  const headers = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// Core fetch wrapper with refresh token logic
const customFetch = async (url, options = {}) => {
  options.headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  try {
    const res = await fetch(url, options);

    if (res.status === 401) {
      const originalRequest = { url, options };

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.options.headers.Authorization = `Bearer ${token}`;
          return customFetch(originalRequest.url, originalRequest.options);
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const accessToken = localStorage.getItem("accessToken");

        if (!refreshToken || !accessToken) throw new Error("No tokens available");

        const refreshResponse = await fetch("/api/Auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken, refreshToken }),
        });

        if (!refreshResponse.ok) throw new Error("Refresh failed");

        const data = await refreshResponse.json();
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        processQueue(null, data.accessToken);
        isRefreshing = false;

        originalRequest.options.headers = {
          ...originalRequest.options.headers,
          Authorization: `Bearer ${data.accessToken}`,
        };

        return customFetch(originalRequest.url, originalRequest.options);

      } catch (err) {
        // ✅ Don't treat an abort as a session expiry
        if (err?.name === "AbortError") {
          isRefreshing = false;
          processQueue(err, null);
          throw err;
        }

        processQueue(err, null);
        isRefreshing = false;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("menu");

        const currentPath = encodeURIComponent(
          window.location.pathname + window.location.search
        );
        window.dispatchEvent(
          new CustomEvent("auth:session_expired", { detail: { redirectTo: currentPath } })
        );
        throw err;
      }
    }

    return res;
  } catch (err) {
    throw err;
  }
};

const handleResponse = async (res, method, url) => {
  if (!res.ok) {
    let errData = {};
    try {
      errData = await res.json();
    } catch {
      // ignore parse errors
      console.error("Could not parse error response");
    }
    const error = new Error(
      errData.detail || errData.title || `${method} ${url} failed`
    );
    error.data = errData;
    throw error;
  }

  // Handle 204 No Content and other empty responses safely
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

// Legacy wrapper — delegates to apiGet
export const GetUser = async (url, signal) => apiGet(url, signal);

export const loginUser = async (API, user) => {
  try {
    console.log("Logging in user:", user);
    const res = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pfno: user.PFNO,
        password: user.Password
      })
    });

    if (!res.ok) {
      let errorMessage = "Login failed";
      let errorData = null;
      try {
        const text = await res.text();
        try {
          errorData = JSON.parse(text);
          errorMessage = errorData.detail || errorData.title || errorMessage;
        } catch {
          // Not JSON, use plain text
          if (text && text.trim().length > 0) {
            errorMessage = text;
          }
        }
      } catch (e) {
        console.error("Error parsing login error response", e);
      }

      const error = new Error(errorMessage);
      error.data = errorData;
      throw error;
    }

    return res.json();
  } catch (err) {
    console.error("Fetch login error:", err);
    throw err;
  }
};

export const revokeUser = async () => {
  try {
    const res = await customFetch("/api/Auth/revoke", {
      method: "POST"
    });

    if (res.status === 204) {
      return true;
    }
    // If not 204, strictly speaking it might be an error or just already revoked,
    // but for logout purposes we can generally proceed.
    return true;
  } catch (err) {
    console.warn("Revoke token failed:", err);
    // We don't throw here because logout should proceed locally anyway
    return false;
  }
};

export const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

//  GET
export const apiGet = async (url, signal) => {
  const res = await customFetch(url, {
    method: "GET",
    signal
  });
  return handleResponse(res, "GET", url);
};

// POST
export const apiPost = async (url, body, signal) => {
  const res = await customFetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    signal
  });
  return handleResponse(res, "POST", url);
};

//  PUT
export const apiPut = async (url, body, signal) => {
  const res = await customFetch(url, {
    method: "PUT",
    body: JSON.stringify(body),
    signal
  });
  return handleResponse(res, "PUT", url);
};

//  PATCH
export const apiPatch = async (url, body, signal) => {
  const res = await customFetch(url, {
    method: "PATCH",
    body: JSON.stringify(body),
    signal
  });
  return handleResponse(res, "PATCH", url);
};

//  DELETE
export const apiDelete = async (url, body = null, signal) => {
  const options = {
    method: "DELETE",
    signal
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await customFetch(url, options);
  return handleResponse(res, "DELETE", url);
};

// Multipart POST — for file uploads; no Content-Type override so browser sets boundary
export const apiPostMultipart = async (url, formData, signal) => {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(url, {
    method: "POST",
    headers: token ? { "Authorization": `Bearer ${token}` } : {},
    body: formData,
    signal,
  });
  return handleResponse(res, "POST", url);
};

// Blob GET — for binary downloads (PDF, Excel) through the same auth pipeline
export const apiGetBlob = async (url, signal) => {
  const res = await customFetch(url, { method: "GET", signal });
  if (!res.ok) {
    throw new Error(`GET ${url} failed (${res.status})`);
  }
  return res.blob();
};



export const getItemsByItemNoOrDescription = async (url, searchItem, signal) =>
  apiGet(`${url}/${searchItem.searchText}`, signal);

export const apiGetCostCode = async (url, signal) => apiGet(url, signal);

export const getStoreWarehouses = async (url, signal) => apiGet(url, signal);

export const apiInsertMaterialRequest = async (url, body, signal) =>
  apiPost(url, body, signal);

export const apiInsertItemMoveDetails = async (url, body, signal) =>
  apiPost(url, body, signal);
