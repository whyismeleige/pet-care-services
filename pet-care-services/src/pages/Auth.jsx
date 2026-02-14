import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_CONFIG } from "@/config";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const isSignup = location.pathname === "/register";
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", name: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) await register(formData);
      else await login(formData);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* LEFT SIDE: Image/Brand (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-emerald-50 relative items-center justify-center p-12">
        <div className="absolute top-8 left-8">
           <Link to="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-stone-800">
             <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white">P</div>
             {APP_CONFIG.name}
           </Link>
        </div>
        
        <div className="relative z-10 max-w-lg text-center">
           <img 
             src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80" 
             alt="Happy Dog" 
             className="rounded-[3rem] shadow-2xl mb-8 rotate-3 hover:rotate-0 transition-transform duration-700"
           />
           <h2 className="text-3xl font-bold text-stone-800 mb-4">Join our furry family.</h2>
           <p className="text-stone-500">Connect with thousands of pet lovers in your area for walks, sitting, and playdates.</p>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 py-12">
        <Link to="/" className="lg:hidden absolute top-8 left-8 flex items-center text-stone-500">
          <ArrowLeft size={16} className="mr-2"/> Back
        </Link>

        <div className="max-w-sm w-full mx-auto space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-extrabold text-stone-900 mb-2">
              {isSignup ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-stone-500">
              {isSignup ? "Let's get you and your pet started." : "Please enter your details."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div className="space-y-2">
                <Label className="font-bold text-stone-700">Full Name</Label>
                <Input 
                  className="h-12 rounded-xl bg-stone-50 border-stone-200 focus:border-emerald-500 focus:ring-emerald-500" 
                  placeholder="John Doe"
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="font-bold text-stone-700">Email</Label>
              <Input 
                type="email" 
                className="h-12 rounded-xl bg-stone-50 border-stone-200 focus:border-emerald-500 focus:ring-emerald-500" 
                placeholder="hello@example.com"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-stone-700">Password</Label>
              <Input 
                type="password" 
                className="h-12 rounded-xl bg-stone-50 border-stone-200 focus:border-emerald-500 focus:ring-emerald-500" 
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <Button className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-lg font-bold shadow-lg shadow-emerald-100" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : (isSignup ? "Sign Up" : "Log In")}
            </Button>
          </form>

          <p className="text-center text-stone-500">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link to={isSignup ? "/login" : "/register"} className="text-emerald-600 font-bold hover:underline">
              {isSignup ? "Log in" : "Sign up"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}