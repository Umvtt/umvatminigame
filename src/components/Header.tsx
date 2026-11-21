import { Link } from "react-router-dom";
import { GREETING } from "../fx/daylight";
import { useDaylight } from "../hooks/useDaylight";
import { SITE } from "../site";
import Blobby from "./Blobby";

export default function Header() {
  const { phase, cycle, isLive } = useDaylight();
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link to="/" className="brand" aria-label={`${SITE.name} home`}>
          <Blobby size={42} />
          <span className="brand-name" aria-hidden>
            {[...SITE.name.toLowerCase()].map((ch, i) => (
              <span key={i} data-jelly style={{ transitionDelay: `${i * 30}ms` }}>{ch}</span>
            ))}
          </span>
        </Link>
        <button
          type="button"
          className="greet"
          onClick={cycle}
          data-jelly
          title={isLive ? "Follows your local time. Click to peek at other times of day." : "Click to change the time of day"}
        >
          <span className={`orb orb-${phase}`} aria-hidden />
          <span key={phase} className="greet-text">{GREETING[phase]}</span>
        </button>
      </div>
    </header>
  );
}
