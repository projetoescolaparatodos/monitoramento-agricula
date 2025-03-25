import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import Home from "@/pages/Home";
import Report from "@/pages/Report";
import AgriculturaMap from "@/pages/AgriculturaMap";
import PescaMap from "@/pages/PescaMap";
import PAAMap from "@/pages/PAAMap";
import AgriculturaInfo from "@/pages/AgriculturaInfo";
import PescaInfo from "@/pages/PescaInfo";
import PAAInfo from "@/pages/PAAInfo";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";
import NavBar from "@/components/NavBar";
import { auth } from "./utils/firebase";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/agricultura">
          {() => (
            <div>
              <AgriculturaInfo />
              <AgriculturaMap />
            </div>
          )}
        </Route>
        <Route path="/pesca">
          {() => (
            <div>
              <PescaInfo />
              <PescaMap />
            </div>
          )}
        </Route>
        <Route path="/paa">
          {() => (
            <div>
              <PAAInfo />
              <PAAMap />
            </div>
          )}
        </Route>
        <Route path="/report" component={Report} />
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
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
