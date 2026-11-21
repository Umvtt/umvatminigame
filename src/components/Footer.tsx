import { SITE } from "../site";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <span>© {new Date().getFullYear()} {SITE.name}</span>
        <span>New games on the way</span>
      </div>
    </footer>
  );
}
