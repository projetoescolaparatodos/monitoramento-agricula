// Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1>Home Page</h1>
      <Link to="/page1#hero">Go to Page 1</Link> <br/>
      <Link to="/page2#hero">Go to Page 2</Link>
    </div>
  );
};

export default Home;


// page1.tsx (Example)
import React from 'react';
const HeroSection = () => {
  return (
    <section id="hero" className="py-12 text-center">
      <h2>Page 1 Hero Section</h2>
    </section>
  );
};

const Page1 = () => {
  return (
    <div>
      <HeroSection />
      <p>Rest of Page 1 content</p>
    </div>
  );
};

export default Page1;


//page2.tsx (Example)
import React from 'react';
const HeroSection = () => {
  return (
    <section id="hero" className="py-12 text-center">
      <h2>Page 2 Hero Section</h2>
    </section>
  );
};

const Page2 = () => {
  return (
    <div>
      <HeroSection />
      <p>Rest of Page 2 content</p>
    </div>
  );
};

export default Page2;