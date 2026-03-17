"use client";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#0D1B2A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          padding: "1rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <p
            style={{
              fontSize: "11px",
              fontFamily: "monospace",
              color: "rgba(255,255,255,0.25)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "1rem",
            }}
          >
            Something went wrong
          </p>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: "0.75rem",
            }}
          >
            Unexpected error
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.4)",
              marginBottom: "2rem",
              lineHeight: 1.6,
            }}
          >
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button
              onClick={reset}
              style={{
                background: "#6C5CE7",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
