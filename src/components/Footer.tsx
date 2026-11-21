import { SITE } from "../site";

export default function Footer() {
  return (
    <footer className="footer">
      © {new Date().getFullYear()} {SITE.name}. More games coming soon.
    </footer>
  );
}
