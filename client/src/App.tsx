import { Route, useLocation } from 'wouter';
import BackgroundVideo from '@/components/common/BackgroundVideo';
import Navbar from '@/components/layout/Navbar';
import Home from '@/pages/Home';
import Agriculture from '@/pages/Agriculture';
import Fishing from '@/pages/Fishing';
import PAAInfo from '@/pages/PAAInfo';
import AgricultureMap from '@/pages/AgriculturaMap';
import Admin from '@/pages/Admin';
import Gestor from '@/pages/Gestor';

function App() {
  const [location] = useLocation();

  const getVideoPath = () => {
    if (location.startsWith('/agriculture')) {
      return '/videos/fundo-agricultura.mp4';
    } else if (location.startsWith('/fishing')) {
      return '/videos/fundo-pesca.mp4';
    } else if (location.startsWith('/paa')) {
      return '/videos/fundo-paa.mp4';
    }
    return '/videos/fundo-agricultura.mp4';
  };

  return (
    <>
      <BackgroundVideo videoPath={getVideoPath()} opacity={0.2} />
      <div className="min-h-screen relative z-10">
        <Navbar />
        <Route path="/" component={Home} />
        <Route path="/agriculture" component={Agriculture} />
        <Route path="/agriculture/map" component={AgricultureMap} />
        <Route path="/fishing" component={Fishing} />
        <Route path="/paa" component={PAAInfo} />
        <Route path="/admin" component={Admin} />
        <Route path="/gestor" component={Gestor} />
      </div>
    </>
  );
}

export default App;