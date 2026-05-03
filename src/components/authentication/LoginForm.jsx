import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


const LoginForm = ({ registerPath, resetPath }) => {
  const [PFNO, setPFNO] = useState("");
  const [Password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    if (searchParams.get("error") === "session_expired") {
      setSessionExpired(true);
    }
  }, [searchParams]);

  const handleLogin = async () => {
    console.log("Logging in with:", PFNO, Password);
    setLoading(true);
    setError("");
    setSessionExpired(false);

    if (!PFNO || !Password) {
      setError("Please enter both User ID and Password.");
      setLoading(false);
      return;
    }

    try {
      await login(PFNO, Password);

      // Redirect logic
      const redirectTo = searchParams.get("redirectTo");
      if (redirectTo) {
        navigate(decodeURIComponent(redirectTo));
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      // Check for first-time reset requirement
      // Note: ProblemDetails extensions are often flattened in the JSON response
      const data = err.data || {};
      const isResetRequired = data.requiresPasswordReset || (data.extensions && data.extensions.requiresPasswordReset);

      if (isResetRequired) {
        const pfnoNode = data.pfno || (data.extensions && data.extensions.pfno);
        navigate("/authentication/login/first-time-reset", { state: { pfno: pfnoNode, currentPassword: Password } });
        return;
      }

      // Set error state
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLogin();
    }
  };
  return (
    <>
      <h2>PROMIS</h2>
      <h4 className="fs-13 fw-bold mb-2">Login to your account</h4>
      <p className="fs-12 fw-medium text-muted">
        Thank you for getting back to <strong>Lakvijaya</strong> Procurement
        Management System.
      </p>

      {sessionExpired && (
        <div className="alert alert-warning py-2 px-3 mt-3 d-flex align-items-center justify-content-between">
          <span>Your session has expired. Please log in again.</span>
          <button 
            type="button" 
            className="btn-close" 
            style={{ fontSize: '10px' }}
            onClick={() => setSessionExpired(false)}
          ></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger py-2 px-3 mt-3">{error}</div>
      )}

      <form className="w-100 mt-4 pt-2" onSubmit={(e) => e.preventDefault()}>
        <div className="mb-4">
          <input
            type="text"
            className="form-control"
            placeholder="User ID"
            value={PFNO}
            onChange={(e) => {
              setPFNO(e.target.value);
              setError("");
            }}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={Password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            required
          />
        </div>
        <div className="d-flex align-items-center justify-content-between">
          <div className="custom-control custom-checkbox">
            <input
              type="checkbox"
              className="custom-control-input"
              id="rememberMe"
            />
            <label
              className="custom-control-label c-pointer"
              htmlFor="rememberMe"
            >
              Remember Me
            </label>
          </div>
        </div>
        <div className="mt-5">
          <button
            type="submit"
            className="brand-btn-primary w-100"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </form>
    </>
  );
};

export default LoginForm;
