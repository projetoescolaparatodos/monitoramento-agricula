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
```

```typescript
// Agriculture.tsx (Generated Example)
import React from 'react';
import { MapPin } from 'lucide-react';

interface ButtonProps {
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ className, onClick, children }) => {
  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
};

const Agriculture = () => {
  return (
    <div>
      <h1>Agriculture Page</h1>
      <Button
        className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
        onClick={() => window.open('/agriculture-map', '_blank')}
      >
        <MapPin className="mr-2 h-5 w-5" />
        Explorar no Mapa
      </Button>
    </div>
  );
};

export default Agriculture;

```

```
// index.tsx or similar entry point
export * from './Home';
export * from './page1';
export * from './page2';
```

</replit_final_file>
```typescript
// Agriculture.tsx (Generated Example)
import React from 'react';
import { MapPin } from 'lucide-react';

interface ButtonProps {
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ className, onClick, children }) => {
  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
};

const Agriculture = () => {
  return (
    <div>
      <h1>Agriculture Page</h1>
      <Button
        className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
        onClick={() => window.open('/agriculture-map', '_blank')}
      >
        <MapPin className="mr-2 h-5 w-5" />
        Explorar no Mapa
      </Button>
    </div>
  );
};

export default Agriculture;
```

```typescript
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
```

```typescript
// index.tsx or similar entry point
export * from './Home';
export * from './page1';
export * from './page2';
export * from './Agriculture';