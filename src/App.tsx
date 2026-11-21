import { Route, Routes } from "react-router-dom";
import Crosshair from "./components/Crosshair";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Play from "./pages/Play";

export default function App() {
  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <defs>
          <pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="5" stroke="#ffe14a" strokeWidth="1.6" />
          </pattern>
        </defs>
      </svg>
      <div className="paper" aria-hidden />
      <Crosshair />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play/:slug" element={<Play />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}
