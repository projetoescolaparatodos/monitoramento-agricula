import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import Home from "@/pages/Home";
import Report from "@/pages/Report";
import AgriculturaMap from "@/pages/AgriculturaMap";
import PescaMap from "@/pages/PescaMap";
import PAAMap from "@/pages/PAAMap";
import Agriculture from "@/pages/Agriculture";
import Fishing from "@/pages/Fishing";
import PAAInfo from "@/pages/PAAInfo";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";
import NavBar from "@/components/NavBar";
import { auth } from "./utils/firebase";
// Added FishingInfo component
import FishingInfo from "@/pages/FishingInfo";
import AgricultureMap from "@/pages/AgriculturaMap";
import AgricultureInfo from "./pages/AgricultureInfo"; // Added import
import BackgroundVideo from "./components/ui/BackgroundVideo"; // Added import


function Router() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/agriculture" component={Agriculture} />
        <Route path="/agriculture/info" component={AgricultureInfo} />
        <Route path="/agriculture/map" component={AgricultureMap} />
        <Route path="/fishing" component={Fishing} />
        <Route path="/fishing/info" component={FishingInfo} />
        <Route path="/fishing/map" component={PescaMap} /> 
        <Route path="/paa" component={PAAInfo} /> 
        <Route path="/paa/info" component={PAAInfo} />
        <Route path="/paa/map" component={PAAMap} />
        <Route path="/dashboard/:section?" component={Dashboard} />
        <Route path="/login" component={Login} />
        <Route path="/admin">
          {() => {
            const user = auth.currentUser;
            if (!user) {
              window.location.href = "/login";
              return null;
            }
            return <Admin />;
          }}
        </Route>
        <Route path="/report" component={Report} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BackgroundVideo /> {/* Added BackgroundVideo component */}
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;