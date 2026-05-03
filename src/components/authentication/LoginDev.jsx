import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LoginDev = () => {
    const [PFNO, setPFNO] = useState("");
    const [Password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { loginDev } = useAuth();

    const handleLogin = async () => {
        console.log("Dev Logging in with:", PFNO, Password);
        setLoading(true);
        setError("");

        if (!PFNO || !Password) {
            setError("Please enter both User ID and Password.");
            setLoading(false);
            return;
        }

        try {
            await loginDev(PFNO, Password);

            // ✅ FIX: Store PFNO in localStorage after successful login
            localStorage.setItem('userPFNO', PFNO);
            console.log('✅ Stored userPFNO in localStorage:', PFNO);

            // Redirect
            navigate("/dashboard");
        } catch (err) {
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
            <h2>PROMIS (DEV)</h2>
            <h4 className="fs-13 fw-bold mb-2">Developer Login</h4>
            <p className="fs-12 fw-medium text-muted">
                Enter your developer credentials to access the system.
            </p>

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
                        onKeyDown={handleKeyDown}
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
                        onKeyDown={handleKeyDown}
                        required
                    />
                </div>
                <div className="mt-5">
                    <button
                        type="submit"
                        className="brand-btn-danger w-100"
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Dev Login"}
                    </button>
                </div>
            </form>
        </>
    );
};

export default LoginDev;