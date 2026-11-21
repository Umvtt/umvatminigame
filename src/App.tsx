import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import GooCursor from "./components/GooCursor";
import Header from "./components/Header";
import Sky from "./components/Sky";
import { installJelly } from "./fx/jelly";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Play from "./pages/Play";

export default function App() {
  const location = useLocation();
  useEffect(() => installJelly(), []);

  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <defs>
          <pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="5" stroke="rgba(43,29,58,.45)" strokeWidth="1.4" />
          </pattern>
        </defs>
      </svg>
      <Sky />
      <GooCursor />
      <Header />
      <main className="wrap">
        {/* Keyed so every route change plays the page-enter transition */}
        <div className="page" key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/play/:slug" element={<Play />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </>
  );
}
