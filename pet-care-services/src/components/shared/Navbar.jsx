import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dog, Menu, User, PawPrint } from "lucide-react";
import { APP_CONFIG } from "@/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <nav className="w-full max-w-5xl bg-white/90 backdrop-blur-md border border-stone-200 shadow-xl shadow-stone-200/50 rounded-full px-6 py-3 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-emerald-500 text-white p-2 rounded-full group-hover:rotate-12 transition-transform duration-300">
            <PawPrint size={20} fill="currentColor" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-stone-800">
            {APP_CONFIG.name}
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 font-medium text-stone-600">
          <Link to="/dashboard" className="hover:text-emerald-600 transition-colors">Dashboard</Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full h-10 w-10 p-0 hover:bg-emerald-50 text-stone-600">
                  <User size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 border-stone-100 shadow-xl">
                <DropdownMenuItem onClick={() => navigate("/dashboard")} className="rounded-xl cursor-pointer">
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { logout(); navigate("/"); }} className="rounded-xl cursor-pointer text-red-500 focus:text-red-500">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block">
                <Button variant="ghost" className="rounded-full text-stone-600 hover:text-emerald-600 hover:bg-emerald-50">Log in</Button>
              </Link>
              <Link to="/register">
                <Button className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-6">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}