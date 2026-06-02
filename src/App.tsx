import React from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Education } from './components/sections/Education';
import { ExperienceSection } from './components/sections/Experience';
import { Projects } from './components/sections/Projects';
import { AILab } from './components/sections/AILab';
import { Skills } from './components/sections/Skills';
import { Contact } from './components/sections/Contact';
const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Education />
        <ExperienceSection />
        <Projects />
        <AILab />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default App;
