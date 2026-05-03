import { apiGet, apiPost } from "./http.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://localhost:7041";

// Rate Limiter
class RateLimiter {
  constructor(maxRequests = 10, timeWindow = 1000) {
    this.maxRequests = maxRequests;
    this.timeWindow  = timeWindow;
    this.requests    = [];
  }

  async waitForSlot() {
    const now   = Date.now();
    this.requests = this.requests.filter((t) => now - t < this.timeWindow);

    if (this.requests.length >= this.maxRequests) {
      const wait = this.timeWindow - (now - this.requests[0]) + 100;
      if (wait > 0) {
        await new Promise((r) => setTimeout(r, wait));
        return this.waitForSlot();
      }
    }
    this.requests.push(now);
  }
}

const apiRateLimiter = new RateLimiter(10, 1000);

const fetchWithRetry = async (fn, maxRetries = 3, baseDelay = 1000, context = "API") => {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await apiRateLimiter.waitForSlot();
      return await fn();
    } catch (error) {
      lastError = error;
      if (error.message?.includes("401") || error.message?.includes("403")) throw error;
      if (attempt === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 500;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
};

export const returnMRRequestAPI = {

  // ─── Get Approval List ─────────────────────────────────────────────────────
  /**
   * GET /api/ReturnMRRequest/GetApprovalListByHeadPerson
   * Old page: LoadMaterialRequestedBySKnoForReturnMRRequest (AJAX on window.onload)
   * Returns list of return MR requests pending head person approval.
   */
  getApprovalListByHeadPerson: async () => {
    try {
      return await fetchWithRetry(
        () => apiGet(`${API_BASE_URL}/api/ReturnMRRequest/GetApprovalListByHeadPerson`),
        3, 1000, "Get Approval List"
      );
    } catch (error) {
      console.error("Error fetching approval list:", error);
      throw new Error("Failed to load approval list. Please try again.");
    }
  },

  // ─── Approve ───────────────────────────────────────────────────────────────
  /**
   * POST /api/ReturnMRRequest/ApproveByHeadPerson
   * Old page: btnApprove_Click → RETURN_STATUS = 2 (HeadPersonApproved)
   * Body: { ReturnRefId, HeadComment }
   */
  approveByHeadPerson: async (returnRefId, mrNo, headComment) => {
    try {
      return await fetchWithRetry(
        () => apiPost(`${API_BASE_URL}/api/ReturnMRRequest/ApproveByHeadPerson`, {
          ReturnRefId: returnRefId,
          MrNo:        mrNo,
          HeadComment: headComment,
        }),
        3, 1000, "Approve by Head Person"
      );
    } catch (error) {
      console.error("Error approving:", error);
      throw new Error("Failed to approve. Please try again.");
    }
  },

  // ─── Reject ────────────────────────────────────────────────────────────────
  /**
   * POST /api/ReturnMRRequest/RejectByHeadPerson
   * Old page: btnReject_Click → RETURN_STATUS = 6 (HeadPersonReject)
   * Body: { ReturnRefId, MrNo, HeadComment }
   */
  rejectByHeadPerson: async (returnRefId, mrNo, headComment) => {
    try {
      return await fetchWithRetry(
        () => apiPost(`${API_BASE_URL}/api/ReturnMRRequest/RejectByHeadPerson`, {
          ReturnRefId: returnRefId,
          MrNo:        mrNo,
          HeadComment: headComment,
        }),
        3, 1000, "Reject by Head Person"
      );
    } catch (error) {
      console.error("Error rejecting:", error);
      throw new Error("Failed to reject. Please try again.");
    }
  },
};

export default returnMRRequestAPI;