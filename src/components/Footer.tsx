import { SITE } from "../site";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <span>© {new Date().getFullYear()} {SITE.name}</span>
        <span>Free to play · No sign-up</span>
      </div>
    </footer>
  );
}
