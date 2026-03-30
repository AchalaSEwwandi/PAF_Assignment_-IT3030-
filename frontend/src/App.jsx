const cardStyle = {
  background: "#ffffff",
  borderRadius: "18px",
  boxShadow: "0 18px 45px rgba(15, 23, 42, 0.12)",
  maxWidth: "720px",
  padding: "32px",
  width: "100%"
};

const pageStyle = {
  alignItems: "center",
  background:
    "linear-gradient(135deg, #f8fafc 0%, #dbeafe 45%, #bfdbfe 100%)",
  color: "#0f172a",
  display: "flex",
  fontFamily: "Segoe UI, sans-serif",
  justifyContent: "center",
  minHeight: "100vh",
  padding: "24px"
};

const badgeStyle = {
  background: "#dbeafe",
  borderRadius: "999px",
  color: "#1d4ed8",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: 700,
  marginBottom: "16px",
  padding: "8px 14px"
};

export default function App() {
  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <div style={badgeStyle}>Frontend Ready</div>
        <h1 style={{ fontSize: "36px", margin: "0 0 12px" }}>Smart Campus</h1>
        <p style={{ fontSize: "18px", lineHeight: 1.6, margin: 0 }}>
          Your React frontend is now set up with Vite. Next step: install
          dependencies and run the dev server.
        </p>
        <pre
          style={{
            background: "#0f172a",
            borderRadius: "14px",
            color: "#e2e8f0",
            marginTop: "24px",
            overflowX: "auto",
            padding: "18px"
          }}
        >
{`cd frontend
npm install
npm run dev`}
        </pre>
      </section>
    </main>
  );
}
