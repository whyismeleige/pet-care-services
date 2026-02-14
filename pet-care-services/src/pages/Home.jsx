import Navbar from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/config";
import { Star, ShieldCheck, Heart, Dog, Cat, Check } from "lucide-react";

// Mock Services
const SERVICES = [
  { title: "Dog Walking", price: "$20/hr", icon: Dog, color: "bg-orange-100 text-orange-600" },
  { title: "Pet Sitting", price: "$45/night", icon: Heart, color: "bg-rose-100 text-rose-600" },
  { title: "Grooming", price: "$30/visit", icon: Cat, color: "bg-blue-100 text-blue-600" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800 selection:bg-emerald-100">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            
            {/* Hero Text */}
            <div className="md:w-1/2 space-y-8 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm">
                <Star size={14} fill="currentColor" /> #1 Pet Care Service
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-stone-900 leading-[1.1]">
                {APP_CONFIG.heroTitle}
              </h1>
              
              <p className="text-xl text-stone-500 leading-relaxed max-w-lg mx-auto md:mx-0">
                {APP_CONFIG.heroSubtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button size="lg" className="rounded-full h-14 px-8 bg-emerald-600 hover:bg-emerald-700 text-white text-lg shadow-lg shadow-emerald-200">
                  Find a Sitter
                </Button>
                <Button size="lg" variant="outline" className="rounded-full h-14 px-8 border-2 border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900">
                  How it Works
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center md:justify-start gap-6 pt-4 text-sm font-medium text-stone-400">
                <span className="flex items-center gap-2"><ShieldCheck size={18} /> Fully Insured</span>
                <span className="flex items-center gap-2"><Check size={18} /> Vetted Sitters</span>
              </div>
            </div>

            {/* Hero Images (Bento Grid Style) */}
            <div className="md:w-1/2 relative">
              <div className="grid grid-cols-2 gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&q=80" 
                  className="rounded-[2rem] object-cover h-64 w-full shadow-2xl rotate-[-2deg] hover:rotate-0 transition-transform duration-500" 
                  alt="Happy Dog"
                />
                <div className="space-y-4 pt-8">
                   <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-stone-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">👋</div>
                        <div>
                          <p className="font-bold text-sm">Sara joined</p>
                          <p className="text-xs text-stone-400">2 mins ago</p>
                        </div>
                      </div>
                   </div>
                   <img 
                    src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80" 
                    className="rounded-[2rem] object-cover h-48 w-full shadow-2xl hover:scale-105 transition-transform" 
                    alt="Cute Cat"
                  />
                </div>
              </div>
              
              {/* Decorative blob */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-50/50 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* --- SERVICES CARDS --- */}
      <section className="py-24 bg-white rounded-t-[4rem]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 mb-4">Our Services</h2>
            <p className="text-stone-500 max-w-2xl mx-auto">Whether you're away for work or vacation, we have the perfect care plan for your furry friend.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {SERVICES.map((service, i) => (
              <div key={i} className="group p-8 rounded-[2.5rem] bg-stone-50 border border-stone-100 hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-300 hover:-translate-y-2">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${service.color} text-3xl`}>
                  <service.icon />
                </div>
                <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                <p className="text-stone-500 mb-6">Professional care tailored to your pet's specific needs and routine.</p>
                <div className="flex items-center justify-between font-bold text-stone-900">
                  <span>{service.price}</span>
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <span className="text-xl">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-stone-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
             {/* Background Pattern */}
             <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
             
             <div className="relative z-10 space-y-6">
               <h2 className="text-4xl md:text-5xl font-extrabold text-white">Ready to wag tails?</h2>
               <p className="text-stone-400 text-lg max-w-xl mx-auto">Join our community of animal lovers today and get $20 off your first booking.</p>
               <Button className="h-14 px-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg border-4 border-stone-800">
                  Sign Up Free
               </Button>
             </div>
          </div>
        </div>
      </section>
      
      <footer className="py-8 text-center text-stone-400 text-sm">
        © 2026 {APP_CONFIG.name} Pet Care. Made with love.
      </footer>
    </div>
  );
}