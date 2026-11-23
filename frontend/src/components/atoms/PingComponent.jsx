import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePing } from "../../hooks/apis/queries/usePing";
import { useAuthStore } from "../../store/authStore";
import { VscCode, VscSignOut, VscAccount } from "react-icons/vsc";

export default function PingComponent() {
  const { isLoading, data, isError } = usePing();
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 50% 20%, #1e1e38 0%, #0d0e15 100%)",
        color: "#f3f4f6",
        fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "rgba(22, 24, 38, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          padding: "36px 32px",
          textAlign: "center",
          boxShadow: "0 16px 40px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "30px",
            fontWeight: "700",
            background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "10px",
          }}
        >
          <VscCode size={34} style={{ color: "#60a5fa" }} /> ProjectIdx
        </div>

        <p style={{ color: "#9ca3af", fontSize: "15px", marginBottom: "24px" }}>
          Cloud-based Containerized Interactive IDE
        </p>

        {/* Backend health pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "20px",
            background: isError
              ? "rgba(239, 68, 68, 0.15)"
              : "rgba(34, 197, 94, 0.15)",
            border: isError
              ? "1px solid rgba(239, 68, 68, 0.3)"
              : "1px solid rgba(34, 197, 94, 0.3)",
            fontSize: "13px",
            color: isError ? "#f87171" : "#4ade80",
            marginBottom: "28px",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: isError ? "#ef4444" : "#22c55e",
            }}
          />
          Backend Status: {isLoading ? "Connecting..." : isError ? "Offline" : `Online (${data?.message || "OK"})`}
        </div>

        {isAuthenticated && user ? (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "24px",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontSize: "15px",
                fontWeight: "600",
                color: "#e0e7ff",
                marginBottom: "4px",
              }}
            >
              <VscAccount size={18} /> Welcome back, {user.username}!
            </div>
            <div style={{ color: "#9ca3af", fontSize: "13px", marginBottom: "16px" }}>
              {user.email} &bull; Role: <span style={{ color: "#a78bfa" }}>{user.role}</span>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => navigate("/project")}
                style={{
                  padding: "10px 20px",
                  background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Go to Playground
              </button>
              <button
                onClick={logout}
                style={{
                  padding: "10px 16px",
                  background: "transparent",
                  color: "#ef4444",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <VscSignOut /> Logout
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "20px" }}>
            <Link
              to="/signin"
              style={{
                padding: "10px 24px",
                background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                color: "#ffffff",
                textDecoration: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                display: "inline-block",
              }}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              style={{
                padding: "10px 24px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#f3f4f6",
                textDecoration: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                display: "inline-block",
              }}
            >
              Sign Up
            </Link>
          </div>
        )}

        <div style={{ marginTop: "16px" }}>
          <Link
            to="/project"
            style={{
              color: "#9ca3af",
              fontSize: "13px",
              textDecoration: "none",
            }}
          >
            Direct Playground Access &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
