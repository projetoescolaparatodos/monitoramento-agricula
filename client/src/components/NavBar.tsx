import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BarChart3, Map, Settings } from "lucide-react";

const NavBar = () => {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm border-b z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 text-primary">
            <img src="/logo.png" alt="SEMAPA" className="h-14 w-auto" />
            <span className="font-semibold text-lg">
              SEMAPA - Vitória do Xingu
            </span>
          </div>
        </Link>

        <div className="flex gap-4">
          <Link href="/agricultura">
            <Button variant="ghost" className="flex gap-2">
              <Map className="h-4 w-4" />
              Agricultura
            </Button>
          </Link>
          <Link href="/pesca">
            <Button variant="ghost" className="flex gap-2">
              <Map className="h-4 w-4" />
              Pesca
            </Button>
          </Link>
          <Link href="/paa">
            <Button variant="ghost" className="flex gap-2">
              <Map className="h-4 w-4" />
              PAA
            </Button>
          </Link>
          <Link href="/report">
            <Button variant="ghost" className="flex gap-2">
              <BarChart3 className="h-4 w-4" />
              Relatórios
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="ghost" className="flex gap-2">
              <Settings className="h-4 w-4" />
              Administração
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;