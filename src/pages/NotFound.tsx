import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="wrap game-page" style={{ textAlign: "center", paddingTop: 100 }}>
      <div className="stamp-big static" aria-hidden>Void</div>
      <h1 className="game-title">404</h1>
      <p className="game-desc">This sheet was never drawn.</p>
      <Link to="/" className="btn">◂ Back to index</Link>
    </main>
  );
}
