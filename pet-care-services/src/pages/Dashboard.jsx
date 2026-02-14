import Navbar from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Bell, Settings, PawPrint } from "lucide-react";

// Mock Pet Data
const MY_PETS = [
  { id: 1, name: "Bella", type: "Dog", breed: "Golden Retriever", age: "2 yrs", image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&q=80", nextAppt: "Walk • Tomorrow 10AM" },
  { id: 2, name: "Luna", type: "Cat", breed: "Siamese", age: "4 yrs", image: "https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400&q=80", nextAppt: "Check-up • Friday 2PM" },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800">
      <Navbar />

      <main className="container mx-auto px-6 pt-32 pb-20 max-w-6xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-stone-900">Dashboard</h1>
            <p className="text-stone-500 text-lg mt-2">Manage your pets and appointments.</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="rounded-full border-stone-300 h-12 px-6 gap-2">
                <Bell size={18} /> Notifications
             </Button>
             <Button className="rounded-full bg-emerald-600 hover:bg-emerald-700 h-12 px-6 gap-2">
                <Plus size={18} /> Add Pet
             </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Column: Pet Cards */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
               <PawPrint className="text-emerald-500" /> My Pets
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {MY_PETS.map((pet) => (
                <div key={pet.id} className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-stone-100 hover:shadow-lg transition-shadow group">
                  {/* Image Area */}
                  <div className="relative h-48 mb-4 overflow-hidden rounded-[2rem]">
                    <img src={pet.image} alt={pet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                      {pet.type}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="px-2 pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-stone-900">{pet.name}</h3>
                        <p className="text-stone-500 text-sm">{pet.breed}, {pet.age}</p>
                      </div>
                    </div>
                    
                    <div className="bg-stone-50 rounded-2xl p-3 mt-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-stone-400">Next Activity</p>
                        <p className="text-sm font-semibold text-stone-800">{pet.nextAppt}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add New Pet Placeholder */}
              <button className="border-2 border-dashed border-stone-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-stone-400 hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50/50 transition-all min-h-[350px]">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center">
                  <Plus size={32} />
                </div>
                <span className="font-bold">Add Another Pet</span>
              </button>
            </div>
          </div>

          {/* Sidebar: Quick Stats & Tasks */}
          <div className="space-y-8">
             {/* Wellness Card */}
             <div className="bg-emerald-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-1">Wellness Score</h3>
                  <p className="text-emerald-200 text-sm mb-6">Based on recent walks</p>
                  <div className="text-5xl font-extrabold mb-2">98<span className="text-2xl opacity-50">%</span></div>
                  <p className="text-sm opacity-80">Excellent! Bella is hitting her step goals this week.</p>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500 rounded-full blur-3xl opacity-50" />
             </div>

             {/* Recent Messages */}
             <div className="bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg">Messages</h3>
                  <Settings size={18} className="text-stone-400" />
                </div>
                
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 hover:bg-stone-50 rounded-2xl transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="User" />
                      </div>
                      <div className="flex-1">
                         <p className="text-sm font-bold">Sarah Walker</p>
                         <p className="text-xs text-stone-500 truncate">Just dropped Bella off! She was...</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>

      </main>
    </div>
  );
}