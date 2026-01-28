import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { HomePage } from "@/pages/HomePage";
import { AboutPage } from "@/pages/AboutPage";
import { BookPage } from "@/pages/BookPage";
import { ContactPage } from "@/pages/ContactPage";
import { GapTestPage } from "@/pages/GapTestPage";

function App() {
  return (
    <BrowserRouter>
      <div className="App min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/book" element={<BookPage />} />
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
