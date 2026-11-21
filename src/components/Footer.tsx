import { SITE } from "../site";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <span>{SITE.name} — {new Date().getFullYear()}</span>
        <span>Free. No sign-up. More soon.</span>
      </div>
    </footer>
  );
}
