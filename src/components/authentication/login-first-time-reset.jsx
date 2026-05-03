import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useNotification from "@/hooks/useNotification";
import getIcon from "@/utils/getIcon";
import { getNavigationMenu, firstTimePasswordReset } from "@/utils/api/api";

const LoginFirstTimeReset = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { notify } = useNotification();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validations, setValidations] = useState({
        minLength: false,
        hasUpper: false,
        hasNumber: false,
        hasSpecial: false,
    });

    const pfno = state?.pfno || "";
    // Retrieve password passed from Login
    const currentPassword = state?.currentPassword || "";

    // Redirect if direct access without state
    useEffect(() => {
        if (!pfno || !currentPassword) {
            navigate("/authentication/login/minimal", { replace: true });
        }
    }, [pfno, currentPassword, navigate]);

    // Validate password on change
    useEffect(() => {
        setValidations({
            minLength: newPassword.length >= 8,
            hasUpper: /[A-Z]/.test(newPassword),
            hasNumber: /[0-9]/.test(newPassword),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
        });
    }, [newPassword]);

    const isPasswordValid = Object.values(validations).every(Boolean);
    const isMatch = newPassword && newPassword === confirmPassword;
    const canSubmit = isPasswordValid && isMatch && !loading;

    const handleReset = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!canSubmit) return;

        try {
            // endpoint call
            const data = await firstTimePasswordReset(pfno, {
                currentPassword: currentPassword,
                newPassword: newPassword,
                confirmPassword: confirmPassword,
            });

            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Fetch and store navigation menu (Crucial for dashboard access)
            try {
                const menuRes = await getNavigationMenu();
                localStorage.setItem("menu", JSON.stringify(menuRes));
            } catch (menuError) {
                console.error("Failed to fetch navigation menu", menuError);
                // Continue anyway
            }

            notify("success", "Password reset successful! Logging you in...");
            window.location.href = "/dashboard";

        } catch (err) {
            setError(err.message || "An error occurred during password reset.");
        } finally {
            setLoading(false);
        }
    };

    const ValidationItem = ({ fulfilled, text }) => (
        <div className={`d-flex align-items-center mb-1 fs-12 ${fulfilled ? "text-success" : "text-muted"}`}>
            <i className={`feather icon-${fulfilled ? "check-circle" : "circle"} me-2`}></i>
            {text}
        </div>
    );

    if (!pfno || !currentPassword) return null;

    return (
        <main className="auth-minimal-wrapper">
            <div className="auth-minimal-inner">
                <div className="minimal-card-wrapper">
                    <div className="card mb-4 mt-5 mx-4 mx-sm-0 position-relative">
                        <div className="wd-50 bg-white p-2 rounded-circle shadow-lg position-absolute translate-middle top-0 start-50">
                            <img
                                src="/images/logo-abbr.png"
                                alt="img"
                                className="img-fluid"
                            />
                        </div>
                        <div className="card-body p-sm-5">
                            <h2 className="mb-3">Security Update</h2>
                            <p className="fs-12 fw-medium text-muted mb-4">
                                For your security, please update your password. Your new password must meet the following criteria:
                            </p>

                            {error && <div className="alert alert-danger py-2 px-3">{error}</div>}

                            <form onSubmit={handleReset}>
                                {/* Current Password is hidden but used in submission */}

                                <div className="mb-3">
                                    <label className="form-label">New Password</label>
                                    <div className="input-group">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            className="form-control"
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                        <span
                                            className="input-group-text cursor-pointer"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? getIcon("feather-eye") : getIcon("feather-eye-off")}
                                        </span>
                                    </div>
                                    <div className="mt-2 p-2 rounded border border-secondary border-opacity-10">
                                        <ValidationItem fulfilled={validations.minLength} text="At least 8 characters" />
                                        <ValidationItem fulfilled={validations.hasUpper} text="At least one uppercase letter (A-Z)" />
                                        <ValidationItem fulfilled={validations.hasNumber} text="At least one number (0-9)" />
                                        <ValidationItem fulfilled={validations.hasSpecial} text="At least one special character (!@#...)" />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">Confirm New Password</label>
                                    <div className="input-group">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            className={`form-control ${confirmPassword && !isMatch ? "is-invalid" : ""}`}
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                        <span
                                            className="input-group-text cursor-pointer"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? getIcon("feather-eye") : getIcon("feather-eye-off")}
                                        </span>
                                    </div>
                                    {confirmPassword && !isMatch && (
                                        <div className="text-danger fs-12 mt-1">Passwords do not match</div>
                                    )}
                                </div>

                                <div className="d-grid">
                                    <button
                                        type="submit"
                                        className="brand-btn-primary"
                                        disabled={!canSubmit}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Updating...
                                            </>
                                        ) : (
                                            "Update Password & Login"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default LoginFirstTimeReset;
