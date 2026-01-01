import React from "react";

const Login = () => {
  return (
    <div style={{ background: "#ffffff", minHeight: "100vh" }}>
      {/* HERO SECTION */}
      <section
        style={{
          padding: "80px 20px",
          background: "linear-gradient(135deg, #f5f7fa, #ffffff)",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "42px", fontWeight: 700 }}>
          System Wallah Digital Catalyst
        </h1>

        <p
          style={{
            fontSize: "18px",
            maxWidth: "700px",
            margin: "15px auto 30px",
            color: "#555",
          }}
        >
          A professional ecosystem for education, automation, and digital
          growth.
        </p>

        <button
          style={{
            padding: "14px 28px",
            fontSize: "16px",
            borderRadius: "6px",
            border: "none",
            background: "#000",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Explore and Sign Up
        </button>
      </section>

      {/* LOGIN PLACEHOLDER */}
      <section style={{ padding: "60px 20px", textAlign: "center" }}>
        <div
          style={{
            maxWidth: "420px",
            margin: "0 auto",
            padding: "35px",
            border: "1px solid #e5e5e5",
            borderRadius: "8px",
            background: "#fff",
          }}
        >
          <h3>Login / Sign Up</h3>
          <p style={{ color: "#555", marginTop: "10px" }}>
            Firebase authentication will be connected here.
          </p>
        </div>
      </section>

      {/* ABOUT */}
      <section style={{ padding: "60px 20px", textAlign: "center" }}>
        <h2>About Digital Catalyst</h2>
        <p
          style={{
            maxWidth: "800px",
            margin: "15px auto",
            color: "#555",
          }}
        >
          Digital Catalyst is built to help students and creators grow with
          real-world systems, not shortcuts.
        </p>
      </section>
    </div>
  );
};

export default Login;
