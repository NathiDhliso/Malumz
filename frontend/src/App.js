import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { HomePage } from "@/pages/HomePage";
import { AboutPage } from "@/pages/AboutPage";
import { BookPage } from "@/pages/BookPage";
import { ContactPage } from "@/pages/ContactPage";
import { GapTestPage } from "@/pages/GapTestPage";
import { JoinPage } from "@/pages/JoinPage";
import { CrisisPage } from "@/pages/CrisisPage";
import { ResourcesPage } from "@/pages/ResourcesPage";
import { SystemsPage } from "@/pages/SystemsPage";
import { SystemDetailPage } from "@/pages/SystemDetailPage";
import { SafetyPage } from "@/pages/SafetyPage";
import { ResultsPage } from "@/pages/ResultsPage";
import { VisionPage } from "@/pages/VisionPage";

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="App min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/book" element={<BookPage />} />
            <Route path="/join" element={<JoinPage />} />
            <Route path="/crisis" element={<CrisisPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/systems" element={<SystemsPage />} />
            <Route path="/systems/:slug" element={<SystemDetailPage />} />
            <Route path="/safety" element={<SafetyPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/vision" element={<VisionPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/gap-test" element={<GapTestPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
