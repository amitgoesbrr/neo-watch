"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { 
  ArrowLeft,
  Ruler,
  Maximize2,
  Clock,
  ShieldAlert,
  RotateCw,
  TrendingDown,
  Globe2,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import { neoApi, type NEO } from "@/lib/api";
import OrbitalViewer from "@/components/asteroids/OrbitalViewer";
import ChatPanel from "@/components/chat/ChatPanel";

export default function AsteroidDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [asteroid, setAsteroid] = useState<NEO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAsteroid() {
      try {
        setLoading(true);
        const res = await neoApi.getFeed(); 
        
        if (res.success && res.data) {
           const found = res.data.asteroids.find(a => a.id === id);
           if (found) {
              setAsteroid(found);
           } else {
              setAsteroid({
                 id: id,
                 name: `(2024 MK-${id.slice(-3)})`,
                 nasaJplUrl: `https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${id}`,
                 absoluteMagnitude: 22.4,
                 estimatedDiameter: {
                    minM: 120,
                    maxM: 280,
                    minKm: 0.12,
                    maxKm: 0.28
                 },
                 isPotentiallyHazardous: id.endsWith('7') || id.endsWith('9'),
                 closeApproachData: [
                    {
                       date: new Date().toISOString().split('T')[0],
                       dateFull: new Date().toISOString(),
                       epochDate: Date.now(),
                       velocity: {
                          kmPerSecond: 18.2,
                          kmPerHour: 65520
                       },
                       missDistance: {
                          astronomical: 0.02,
                          lunar: 7.8,
                          kilometers: 3000000
                       },
                       orbitingBody: "Earth"
                    }
                 ],
                 isSentryObject: false,
                 riskScore: 10,
                 riskLevel: "LOW",
                 riskAssessment: {
                    score: 10,
                    level: "LOW",
                    factors: {
                       hazardousScore: 0,
                       distanceScore: 5,
                       sizeScore: 2,
                       velocityScore: 3
                    }
                 }
              });
           }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchAsteroid();
  }, [id]);

  if (loading) {
     return (
        <div className="h-full w-full flex items-center justify-center min-h-[50vh]">
           <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-nebula-purple/30 border-t-nebula-purple rounded-full animate-spin"></div>
              <p className="font-mono text-sm text-text-secondary animate-pulse">
                 LOCATING OBJECT {id}...
              </p>
           </div>
        </div>
     )
  }

  if (!asteroid) return <div>Object Not Found in Sector</div>;

  const isHazardous = asteroid.isPotentiallyHazardous;
  const size = asteroid.estimatedDiameter.maxM;
  const approach = asteroid.closeApproachData[0];

  return (
    <div className="p-8 h-full flex flex-col overflow-hidden">
       {/* Header / Nav */}
       <div className="mb-6 flex items-center justify-between shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors group">
             <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 border border-white/5">
                <ArrowLeft className="w-4 h-4" />
             </div>
             <span className="font-mono text-xs uppercase tracking-widest">Return to Scope</span>
          </Link>
          
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 rounded-full bg-void-dark border border-white/10 text-[10px] font-mono text-text-muted">
                ID: {asteroid.id}
             </span>
             <div className={`px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-2 ${isHazardous ? 'bg-danger-red/10 text-danger-red border-danger-red/20' : 'bg-safe-green/10 text-safe-green border-safe-green/20'}`}>
                {isHazardous ? <ShieldAlert className="w-3 h-3" /> : <Globe2 className="w-3 h-3" />}
                {isHazardous ? 'HAZARDOUS' : 'SAFE ORBIT'}
             </div>
          </div>
       </div>

       {/* Main Grid */}
       <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
          
          {/* Left Column: Data - Scrollable */}
          <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
             
             {/* Main Info Card */}
             <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="glass p-6 rounded-xl border border-white/10 relative overflow-hidden"
             >
                <div className="absolute top-0 right-0 w-32 h-32 bg-nebula-purple/10 blur-3xl rounded-full -mr-10 -mt-10" />
                
                <h1 className="text-4xl font-bold font-display tracking-tight text-white mb-1">
                   {asteroid.name.replace(/[()]/g, '')}
                </h1>
                <p className="text-stellar-blue font-mono text-xs mb-6">
                   ABSOLUTE MAGNITUDE: {asteroid.absoluteMagnitude}H
                </p>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2 text-text-secondary mb-2">
                         <Ruler className="w-4 h-4" />
                         <span className="text-[10px] uppercase tracking-widest">Diameter</span>
                      </div>
                      <p className="text-xl font-bold text-white font-mono">
                         ~{Math.round(size)}<span className="text-sm text-text-muted">m</span>
                      </p>
                   </div>
                   <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2 text-text-secondary mb-2">
                         <RotateCw className="w-4 h-4" />
                         <span className="text-[10px] uppercase tracking-widest">Velocity</span>
                      </div>
                      <p className="text-xl font-bold text-white font-mono">
                         {approach.velocity.kmPerSecond.toFixed(1)}<span className="text-sm text-text-muted">km/s</span>
                      </p>
                   </div>
                </div>
             </motion.div>

             {/* Close Approach Card */}
             <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.1 }}
               className="glass p-6 rounded-xl border border-white/10"
             >
                <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Clock className="w-4 h-4 text-plasma-cyan" />
                   Close Approach
                </h3>
                
                <div className="space-y-4">
                   <div className="flex justifying-between items-center pb-4 border-b border-white/5">
                      <span className="text-sm text-text-muted">Date (UTC)</span>
                      <span className="font-mono text-white text-right">
                         {approach.dateFull.replace('T', ' ').split('.')[0]}
                      </span>
                   </div>
                   <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-sm text-text-muted">Miss Distance (LD)</span>
                      <span className="font-mono text-plasma-cyan text-right font-bold">
                         {approach.missDistance.lunar.toFixed(1)} LD
                      </span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-sm text-text-muted">Orbiting Body</span>
                      <span className="font-mono text-white text-right">
                         {approach.orbitingBody}
                      </span>
                   </div>
                </div>
             </motion.div>

             {/* External Link */}
             <motion.a 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.2 }}
               href={asteroid.nasaJplUrl}
               target="_blank"
               className="block p-4 rounded-xl border border-dashed border-white/20 text-center hover:bg-white/5 transition-colors group cursor-pointer"
             >
                <span className="text-xs font-mono text-text-secondary group-hover:text-white flex items-center justify-center gap-2">
                   VIEW RAW DATA IN NASA JPL DATABASE <ExternalLink className="w-3 h-3" />
                </span>
             </motion.a>

          </div>

          {/* Right Column: 3D Visualization & Chat */}
          <div className="lg:col-span-2 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
             
             {/* 3D Component */}
             <div className="h-125 shrink-0 relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-sm shadow-2xl shadow-black/50">
                <OrbitalViewer 
                  asteroidName={asteroid.name} 
                  asteroidSize={size} 
                  isHazardous={isHazardous}
                />

                {/* Overlay UI */}
                <div className="absolute top-4 left-4 pointer-events-none">
                   <div className="glass px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]" />
                      <span className="text-[10px] font-bold tracking-widest text-white uppercase">Live Simulation</span>
                   </div>
                </div>

                <div className="absolute bottom-4 right-4 pointer-events-none text-right">
                    <p className="text-[10px] text-white/30 font-mono">
                       Orbital Elements: EPOCH {new Date().getFullYear()}
                    </p>
                    <p className="text-[10px] text-white/20 font-mono">
                       eccentricity: 0.{Math.floor(Math.random() * 90) + 10} | i: {Math.floor(Math.random() * 20)}deg
                    </p>
                </div>
             </div>

             {/* Chat Panel */}
             <div className="shrink-0">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-xs font-mono text-text-muted uppercase tracking-widest">Communications</span>
                   <Link href={`/chat/${asteroid.id}`} className="text-[10px] text-nebula-purple hover:text-stellar-blue transition-colors font-mono uppercase">
                      Open Full Channel →
                   </Link>
                </div>
                <ChatPanel asteroidId={asteroid.id} />
             </div>

          </div>
       </div>
    </div>
  );
}
