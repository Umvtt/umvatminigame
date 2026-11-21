import { useReveal } from "../hooks/useReveal";
import { SITE } from "../site";
import { Logo } from "./Header";

export default function Footer() {
  const ref = useReveal<HTMLElement>();
  return (
    <footer ref={ref} className="site-footer reveal">
      <div className="wrap footer-inner">
        <span className="footer-brand"><Logo size={18} /> © {new Date().getFullYear()} {SITE.name}</span>
        <span>Free to play · No sign-up</span>
      </div>
    </footer>
  );
}
