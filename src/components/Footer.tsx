import { SITE } from "../site";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner mono">
        <span>© {new Date().getFullYear()} {SITE.name}</span>
        <span className="hide-sm">Free to play. No accounts.</span>
        <button type="button" className="to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Back to top <span aria-hidden>↑</span>
        </button>
      </div>
    </footer>
  );
}
