import { useReveal } from "../hooks/useReveal";
import { SITE } from "../site";

export default function Footer() {
  const ref = useReveal<HTMLElement>();
  return (
    <footer ref={ref} className="site-footer reveal">
      <div className="wrap footer-inner">
        <span>{SITE.name.toLowerCase()} · best served chilled</span>
        <span>no accounts · no ads · no rush</span>
      </div>
    </footer>
  );
}
