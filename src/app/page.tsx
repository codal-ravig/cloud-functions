export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
        ☁️ Cloud Functions
      </h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Webhook handler running on Vercel
      </p>

      <div
        style={{
          background: "#f5f5f5",
          borderRadius: "8px",
          padding: "1.5rem",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Endpoints</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li style={{ marginBottom: "0.5rem" }}>
            <code
              style={{
                background: "#e8e8e8",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                fontSize: "0.9rem",
              }}
            >
              <a href="/api-docs" style={{ textDecoration: 'none', color: 'inherit' }}>
                GET /api-docs
              </a>
            </code>
            <span style={{ marginLeft: "0.5rem", color: "#666" }}>
              — Swagger API Documentation
            </span>
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <code
              style={{
                background: "#e8e8e8",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                fontSize: "0.9rem",
              }}
            >
              GET /api/health
            </code>
            <span style={{ marginLeft: "0.5rem", color: "#666" }}>
              — Health check
            </span>
          </li>
          <li>
            <code
              style={{
                background: "#e8e8e8",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                fontSize: "0.9rem",
              }}
            >
              POST /api/webhooks/[provider]
            </code>
            <span style={{ marginLeft: "0.5rem", color: "#666" }}>
              — Webhook endpoint
            </span>
          </li>
          <li style={{ marginTop: "0.5rem" }}>
            <code
              style={{
                background: "#e8e8e8",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                fontSize: "0.9rem",
              }}
            >
              POST /api/extensions/algolia-sync
            </code>
            <span style={{ marginLeft: "0.5rem", color: "#666" }}>
              — Algolia Sync Debugger
            </span>
          </li>
        </ul>
      </div>
    </main>
  );
}
