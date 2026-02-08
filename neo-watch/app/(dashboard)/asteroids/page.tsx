"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Filter,
  ChevronRight,
  Radar,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { neoApi, type NEO } from "@/lib/api";
import DashboardOrbitalViewer from "@/components/asteroids/DashboardOrbitalViewer";



import { useSearchParams } from "next/navigation";

// {{{ Asteroids Page
export default function AsteroidsPage() {
  const [neos, setNeos] = useState<NEO[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await neoApi.getFeed();
        if (res.success && res.data) {
          setNeos(res.data.asteroids);
        } else {
          console.error(res.error || "Failed to fetch NEO data");
        }
      } catch (err) {
        console.error("Failed to fetch NEO data", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredNeos = neos
    .filter((neo) => {
      const matchSearch = searchQuery
         ? neo.name.toLowerCase().includes(searchQuery.toLowerCase()) || neo.id.includes(searchQuery)
         : true;
      
      const matchFilter = (() => {
         switch (activeFilter) {
            case "hazardous": return neo.isPotentiallyHazardous;
            case "safe": return !neo.isPotentiallyHazardous;
            case "small": return neo.estimatedDiameter.maxM < 100;
            case "large": return neo.estimatedDiameter.maxM > 1000;
            default: return true;
         }
      })();

      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
       // Default sort by risk then size
       if (b.isPotentiallyHazardous !== a.isPotentiallyHazardous) {
          return b.isPotentiallyHazardous ? 1 : -1;
       }
       return b.estimatedDiameter.maxM - a.estimatedDiameter.maxM;
    });

  const featuredNeo = neos.find(n => n.isPotentiallyHazardous) || neos[0];

  if (loading) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
           <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-t-2 border-plasma-cyan rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-r-2 border-nebula-purple rounded-full animate-spin reverse-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <Radar className="w-8 h-8 text-white/20 animate-pulse" />
              </div>
           </div>
           <p className="text-text-secondary font-mono text-sm tracking-widest uppercase animate-pulse">
              System Scanning...
           </p>
        </div>
     )
  }

  return (
    <div className="space-y-8 pb-12 px-4 md:px-8 pt-8 min-h-full">
       {/* Background Ambience */}
       <div className="absolute top-0 left-0 w-full h-[500px] bg-linear-to-b from-nebula-purple/10 via-transparent to-transparent pointer-events-none" />

       {/* Featured Section */}
       {featuredNeo && (
          <section className="relative glass rounded-2xl border border-white/10 overflow-hidden my-6">
             <div className="absolute top-0 right-0 p-4 z-10">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur text-xs font-bold text-white/80">
                   <AlertTriangle className="w-3 h-3 text-warning-amber" />
                   High Interest Object
                </div>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-6 md:p-8 flex flex-col justify-center space-y-6">
                   <div>
                      <h2 className="text-sm font-mono text-plasma-cyan mb-2 tracking-widest uppercase">Target Locked</h2>
                      <h1 className="text-3xl md:text-5xl font-bold font-display text-white mb-2 leading-tight">
                         {featuredNeo.name}
                      </h1>
                      <div className="flex flex-wrap gap-2 md:gap-3 text-xs md:text-sm text-text-secondary">
                         <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">ID: {featuredNeo.id}</span>
                         <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">Class: Apollo</span>
                         <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">Mag: {featuredNeo.absoluteMagnitude.toFixed(1)}H</span>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div className="p-3 md:p-4 rounded-xl bg-void-dark/50 border border-white/5">
                         <div className="text-text-muted text-[10px] md:text-xs uppercase mb-1">Pass Distance</div>
                         <div className="text-lg md:text-xl font-mono text-white truncate">
                            {(featuredNeo.closeApproachData[0]?.missDistance.kilometers / 1000000).toFixed(2)}M <span className="text-xs text-white/40">km</span>
                         </div>
                      </div>
                      <div className="p-3 md:p-4 rounded-xl bg-void-dark/50 border border-white/5">
                         <div className="text-text-muted text-[10px] md:text-xs uppercase mb-1">Est. Diameter</div>
                         <div className="text-lg md:text-xl font-mono text-white truncate">
                            {featuredNeo.estimatedDiameter.maxM.toFixed(0)} <span className="text-xs text-white/40">m</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex gap-4">
                      <Link href={`/asteroids/${featuredNeo.id}`} className="flex-1 inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cosmic-black disabled:opacity-50 disabled:cursor-not-allowed w-full bg-nebula-purple hover:bg-nebula-purple/80 text-white border-0 shadow-lg shadow-nebula-purple/20 px-4 py-2 text-base">
                         Analyze Object <ChevronRight className="w-4 h-4 ml-2" />
                      </Link>
                   </div>
                </div>

                <div className="h-[250px] lg:h-auto bg-black/40 relative border-l border-white/5 order-first lg:order-last">
                    <DashboardOrbitalViewer 
                       neos={[featuredNeo]} 
                       viewMode="3D" 
                       error={null} 
                       isLoading={false} 
                    />
                </div>
             </div>
          </section>
       )}

      <div className="sticky top-4 z-40 bg-void-dark/80 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Filters - Now taking full width or flex space since search is gone */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide">
                 {["all", "hazardous", "safe", "large", "small"].map(filter => (
                    <button
                       key={filter}
                       onClick={() => setActiveFilter(filter)}
                       className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${
                          activeFilter === filter 
                          ? "bg-white text-void-dark border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]" 
                          : "bg-white/5 text-white/60 border-white/5 hover:bg-white/10 hover:border-white/20"
                       }`}
                    >
                       {filter}
                    </button>
                 ))}
              </div>
    
              <div className="flex bg-white/5 rounded-lg p-1 border border-white/5 shrink-0 self-end sm:self-auto">
                 <button 
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded transition-all ${viewMode === "grid" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/70"}`}
                 >
                    <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                       <div className="bg-current rounded-[1px]" />
                       <div className="bg-current rounded-[1px]" />
                       <div className="bg-current rounded-[1px]" />
                       <div className="bg-current rounded-[1px]" />
                    </div>
                 </button>
                 <button 
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded transition-all ${viewMode === "list" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/70"}`}
                 >
                    <div className="flex flex-col gap-1 w-4 h-4 justify-center">
                       <div className="bg-current h-0.5 w-full rounded-full" />
                       <div className="bg-current h-0.5 w-full rounded-full" />
                       <div className="bg-current h-0.5 w-full rounded-full" />
                    </div>
                 </button>
              </div>
          </div>
       </div>

       {/* Results Grid/List */}
       {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
             {filteredNeos.map((neo, i) => (
                <NeoGridCard key={neo.id} neo={neo} index={i} />
             ))}
          </div>
       ) : (
          <div className="space-y-2">
             {filteredNeos.map((neo, i) => (
                <NeoListRow key={neo.id} neo={neo} index={i} />
             ))}
          </div>
       )}

       {filteredNeos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Filter className="w-10 h-10 text-white/20" />
             </div>
             <h3 className="text-xl font-display font-bold text-white mb-2">No Objects Found</h3>
             <p className="text-text-secondary max-w-md">
                Adjust your search parameters or filter criteria to locate matching Near-Earth Objects.
             </p>
             <Button 
                variant="secondary" 
                className="mt-6"
                onClick={() => { setActiveFilter("all"); window.history.replaceState(null, '', window.location.pathname); }}
             >
                Clear Filters
             </Button>
          </div>
       )}
    </div>
  );
}

function NeoGridCard({ neo, index }: { neo: NEO, index: number }) {
   return (
      <motion.div
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ delay: index * 0.05 }}
      >
         <Link href={`/asteroids/${neo.id}`} className="block group">
            <div className={`h-full bg-void-dark border border-white/5 rounded-2xl overflow-hidden hover:border-plasma-cyan/30 transition-all duration-300 relative ${neo.isPotentiallyHazardous ? 'hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]' : 'hover:shadow-[0_0_30px_rgba(14,165,233,0.15)]'}`}>
               {/* Card Header Background */}
               <div className={`h-24 relative overflow-hidden ${neo.isPotentiallyHazardous ? 'bg-danger-red/10' : 'bg-plasma-cyan/10'}`}>
                  <div className="absolute inset-0 opacity-30 bg-[url('/textures/noise.png')] mix-blend-overlay" />
                  <div className="absolute top-4 right-4 text-xs font-mono font-bold tracking-widest opacity-40">
                     REL-{neo.id.slice(-4)}
                  </div>
                  {neo.isPotentiallyHazardous && (
                     <div className="absolute top-4 left-4">
                        <ShieldAlert className="w-5 h-5 text-danger-red animate-pulse" />
                     </div>
                  )}
               </div>

               {/* Content */}
               <div className="p-6 relative">
                  {/* Icon/Avatar overlapping header */}
                  <div className="absolute -top-10 left-6 w-16 h-16 rounded-2xl bg-void-dark border-2 border-void-dark shadow-xl flex items-center justify-center overflow-hidden">
                     <div className={`w-full h-full flex items-center justify-center ${neo.isPotentiallyHazardous ? 'bg-danger-red/10' : 'bg-plasma-cyan/10'}`}>
                        {/* Simple CSS asteroid representation */}
                        <div className={`w-8 h-8 rounded-full ${neo.isPotentiallyHazardous ? 'bg-danger-red' : 'bg-plasma-cyan'} opacity-80 blur-[1px]`} />
                        <div className={`absolute w-6 h-6 rounded-full bg-white opacity-20`} />
                     </div>
                  </div>

                  <div className="mt-6">
                     <h3 className="text-xl font-bold font-display text-white group-hover:text-plasma-cyan transition-colors truncate">
                        {neo.name}
                     </h3>
                     <div className="flex items-center gap-2 mt-2 text-xs text-text-secondary">
                         <span className={`px-2 py-0.5 rounded border ${neo.isPotentiallyHazardous ? 'border-danger-red/30 text-danger-red bg-danger-red/5' : 'border-safe-green/30 text-safe-green bg-safe-green/5'}`}>
                            {neo.isPotentiallyHazardous ? 'HAZARDOUS' : 'SAFE'}
                         </span>
                         <span>•</span>
                         <span>{neo.absoluteMagnitude.toFixed(1)}H</span>
                     </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                     <div>
                        <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Diameter</div>
                        <div className="font-mono text-sm text-text-primary">
                           { Math.round(neo.estimatedDiameter.maxM) }m
                        </div>
                     </div>
                     <div>
                        <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Miss Dist.</div>
                        <div className="font-mono text-sm text-text-primary">
                           { (neo.closeApproachData[0]?.missDistance.kilometers / 1000).toFixed(0) }k km
                        </div>
                     </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                     <div className="text-xs text-text-secondary flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                         {neo.closeApproachData[0]?.date}
                     </div>
                     <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-white/10 group-hover:text-white transition-all">
                        <ArrowRight className="w-4 h-4" />
                     </div>
                  </div>
               </div>
            </div>
         </Link>
      </motion.div>
   )
}

function NeoListRow({ neo, index }: { neo: NEO, index: number }) {
   return (
      <motion.div
         initial={{ opacity: 0, x: -20 }}
         animate={{ opacity: 1, x: 0 }}
         transition={{ delay: index * 0.02 }}
      >
         <Link href={`/asteroids/${neo.id}`} className="block group">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all hover:bg-white/[0.07]">
               <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${neo.isPotentiallyHazardous ? 'bg-danger-red/10 text-danger-red' : 'bg-plasma-cyan/10 text-plasma-cyan'}`}>
                  {neo.isPotentiallyHazardous ? <ShieldAlert className="w-5 h-5"/> : <Radar className="w-5 h-5"/>}
               </div>
               
               <div className="min-w-[150px]">
                  <h4 className="font-bold text-white group-hover:text-plasma-cyan transition-colors">{neo.name}</h4>
                  <div className="text-xs text-text-secondary">ID: {neo.id}</div>
               </div>

               <div className="hidden md:block flex-1">
                  <div className="text-xs text-white/40 uppercase">Classification</div>
                  <div className="text-sm text-white font-mono">Apollo Class</div>
               </div>

               <div className="hidden sm:block flex-1">
                  <div className="text-xs text-white/40 uppercase">Diameter</div>
                  <div className="text-sm text-white font-mono">{Math.round(neo.estimatedDiameter.maxM)}m</div>
               </div>

               <div className="flex-1 text-right">
                   <div className="text-xs text-white/40 uppercase">Distance</div>
                   <div className="text-sm text-white font-mono group-hover:text-plasma-cyan transition-colors">
                      {(neo.closeApproachData[0]?.missDistance.kilometers / 1000).toFixed(0)}k km
                   </div>
               </div>

               <div className="w-8 flex items-center justify-center text-white/20 group-hover:text-white transition-colors">
                  <ChevronRight className="w-5 h-5" />
               </div>
            </div>
         </Link>
      </motion.div>
   )
}
// }}}
