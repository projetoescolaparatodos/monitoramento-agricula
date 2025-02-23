import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BarChart3, Map } from "lucide-react";

const NavBar = () => {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm border-b z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 text-primary">
            <img src="/semapa-logo.svg" alt="SEMAPA" className="h-8 w-auto" />
            <span className="font-semibold text-lg">
              SEMAPA
            </span>
          </div>
        </Link>

        <div className="flex gap-4">
          <Link href="/map">
            <Button variant="ghost" className="flex gap-2">
              <Map className="h-4 w-4" />
              Mapa
            </Button>
          </Link>
          <Link href="/report">
            <Button variant="ghost" className="flex gap-2">
              <BarChart3 className="h-4 w-4" />
              Relatórios
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;