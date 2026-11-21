import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="wrap game-page" style={{ textAlign: "center", paddingTop: 120 }}>
      <h1>404</h1>
      <p className="muted">That page wandered off.</p>
      <Link to="/" className="btn">Back home</Link>
    </main>
  );
}
