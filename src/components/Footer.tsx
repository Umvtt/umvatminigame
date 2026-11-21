import { SITE } from "../site";

export default function Footer() {
  return (
    <footer className="tb tb-foot">
      <div className="tb-inner">
        <div className="tb-cell tb-fill"><small>TITLE</small>{SITE.name} — Tiny games, zero fluff</div>
        <div className="tb-cell"><small>COST</small>FREE</div>
        <div className="tb-cell tb-hide"><small>SIGN-UP</small>NONE</div>
        <div className="tb-cell"><small>REV</small>A / {new Date().getFullYear()}</div>
      </div>
    </footer>
  );
}
