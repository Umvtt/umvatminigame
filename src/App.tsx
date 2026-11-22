import { Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Play from "./pages/Play";

export default function App() {
  const location = useLocation();
  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden className="defs">
        <defs>
          <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="4" stroke="currentColor" strokeWidth="0.8" />
          </pattern>
        </defs>
      </svg>
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
