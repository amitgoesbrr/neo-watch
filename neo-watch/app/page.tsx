"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import useSWR from "swr";
import dynamic from "next/dynamic";
import {
  Radar,
  ShieldAlert,
  Activity,
  Globe2,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// Dynamically import HeroScene to avoid SSR issues with Three.js
// HeroScene removed as per user request

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// {{{ Hero Section (Clean scientific look with 3D background)
function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* 3D Scene Background */}
      {/* 3D Scene Removed */}
      
      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-linear-to-b from-cosmic-black/30 via-transparent to-cosmic-black/80 pointer-events-none z-1" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(107,33,168,0.1)_0%,transparent_60%)] pointer-events-none z-1" />
      
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="text-center z-10 max-w-5xl mx-auto space-y-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safe-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-safe-green"></span>
            </span>
            <span className="text-xs font-medium tracking-wide text-text-secondary uppercase">
               System Operational
            </span>
        </div>

        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold font-display tracking-tight leading-none text-text-primary mb-6">
          Monitor the <span className="bg-linear-to-r from-nebula-purple to-stellar-blue bg-clip-text text-transparent">Cosmos</span>
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl text-text-secondary font-light max-w-2xl mx-auto leading-relaxed px-4">
          Real-time Near-Earth Object tracking and risk analysis.
        </p>
        
        <p className="text-text-muted max-w-xl mx-auto text-base sm:text-lg px-4 hidden sm:block">
           Advanced surveillance of space objects. Stay informed, stay safe.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 px-4 w-full sm:w-auto">
          <Link 
            href="/dashboard" 
            className="w-full sm:w-auto inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cosmic-black disabled:opacity-50 disabled:cursor-not-allowed h-14 px-8 text-base bg-linear-to-r from-nebula-purple to-stellar-blue text-white hover:opacity-90 border-none tracking-wide shadow-lg shadow-purple-500/20"
          >
             Start Monitoring <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <Button 
            variant="secondary" 
            size="lg" 
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="h-14 w-full sm:w-auto px-8 text-base border-white/10 hover:bg-white/5 text-text-primary hover:text-white hover:border-stellar-blue/50 transition-all backdrop-blur-sm"
          >
             Explore Features
          </Button>
        </div>
      </motion.div>
      
      {/* Scroll indicator */}

    </section>
  );
}
// }}}

// {{{ Data Strip (Live Metrics)
function DataStrip() {
  const { data, error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/neo/stats`,
    fetcher,
    { refreshInterval: 60000 } // Refresh every minute
  );

  const stats = data?.data;

  const metrics = [
     { 
       label: "NEOs Today", 
       value: isLoading ? <Loader2 className="w-5 h-5 animate-spin text-text-muted" /> : (stats?.totalCount ?? "0"), 
       icon: Globe2, 
       color: "text-text-primary" 
     },
     { 
       label: "Hazardous Objects", 
       value: isLoading ? <Loader2 className="w-5 h-5 animate-spin text-danger-red" /> : (stats?.hazardousCount ?? "0"), 
       icon: ShieldAlert, 
       color: "text-danger-red animate-pulse" 
     },
     { 
       label: "Closest Approach", 
       // Format distance (e.g. 1,000 km or 1.2 LD if we calculated LD)
       // For now just showing raw km rounded
       value: isLoading ? <Loader2 className="w-5 h-5 animate-spin text-warning-amber" /> : stats?.closestApproach ? `${Math.round(stats.closestApproach.distanceKm).toLocaleString()} km` : "N/A", 
       icon: Radar, 
       color: "text-warning-amber" 
     },
     { 
       label: "System Status", 
       value: error ? "Error" : "Active", 
       icon: Activity, 
       color: error ? "text-danger-red" : "text-safe-green" 
     },
  ];

  return (
    <div className="border-y border-white/5 bg-void-dark/50 backdrop-blur w-full overflow-x-auto">
       <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 min-w-max md:min-w-0">
             {metrics.map((m, i) => (
                <div key={i} className="flex flex-col gap-1 border-l border-white/5 pl-6 first:pl-0 first:border-0">
                   <div className="flex items-center gap-2 text-text-muted text-xs font-medium uppercase tracking-wider">
                      <m.icon className="w-4 h-4" />
                      {m.label}
                   </div>
                   <div className={`text-2xl font-bold font-display ${m.color} whitespace-nowrap`}>
                      {m.value}
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
}
// }}}

// {{{ Feature Grid (Modern Cards)
function FeatureGrid() {
  const features = [
    {
      title: "Real-time Tracking",
      desc: "Live orbital data streaming directly from NASA's JPL API for precise positioning.",
      icon: Radar,
      stat: "Live",
      statLabel: "Feed"
    },
    {
      title: "Risk Analysis",
      desc: "Automated algorithms calculate impact probability and close-approach risks instantly.",
      icon: ShieldAlert,
      stat: "Data",
      statLabel: "Driven"
    },
    {
      title: "Community Alerts",
      desc: "Instant notifications for objects entering monitored sectors or exceeding risk thresholds.",
      icon: Activity,
      stat: "Global",
      statLabel: "Network"
    }
  ];

  return (
    <section id="features" className="py-24 px-4 bg-cosmic-black relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 px-4">
            <h2 className="text-3xl md:text-5xl font-bold font-display mb-4 bg-linear-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
               Advanced Capabilities
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto text-lg leading-relaxed">
               Tools designed for the next generation of space observation.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2 md:px-0">
           {features.map((item, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="group relative"
             >
                <div className="relative bg-void-dark border border-white/10 p-8 rounded-2xl h-full hover:border-plasma-cyan/30 transition-colors shadow-2xl overflow-hidden">
                   {/* Gradient Hover Effect */}
                   <div className="absolute inset-0 bg-linear-to-br from-plasma-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   
                   <div className="relative z-10">
                       <div className="flex justify-between items-start mb-8">
                           <div className="p-3 bg-white/5 rounded-xl border border-white/5 group-hover:bg-white/10 transition-colors">
                               <item.icon className="w-6 h-6 text-plasma-cyan" />
                           </div>
                           <div className="text-right">
                               <div className="text-xl font-bold font-display text-text-primary">{item.stat}</div>
                               <div className="text-xs text-text-muted uppercase tracking-wider">{item.statLabel}</div>
                           </div>
                       </div>
                       
                       <h3 className="text-xl font-bold font-display mb-3 text-text-primary group-hover:text-plasma-cyan transition-colors">
                          {item.title}
                       </h3>
                       <p className="text-text-secondary leading-relaxed">
                          {item.desc}
                       </p>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
}
// }}}

// {{{ Modern Footer
function AppFooter() {
    return (
        <footer className="bg-void-dark border-t border-white/5 py-12 md:py-20 relative z-10">
            <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <Link href="/" className="inline-block text-2xl font-bold font-display bg-linear-to-r from-white to-text-secondary bg-clip-text text-transparent">
                            NEO-WATCH
                        </Link>
                        <p className="text-text-secondary max-w-sm leading-relaxed">
                            Real-time Near-Earth Object monitoring platform powered by NASA data. 
                            Track, analyze, and stay informed about objects approaching Earth.
                        </p>
                        <div className="flex gap-4">
                            <a 
                              href="https://twitter.com" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="rounded-full h-8 w-8 p-0 border border-white/10 hover:border-white transition-colors flex items-center justify-center bg-transparent hover:bg-white/5"
                            >
                                <span className="sr-only">Twitter</span>
                                <svg className="h-4 w-4 text-text-secondary" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                            </a>
                            <a 
                              href="https://github.com" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="rounded-full h-8 w-8 p-0 border border-white/10 hover:border-white transition-colors flex items-center justify-center bg-transparent hover:bg-white/5"
                            >
                                <span className="sr-only">GitHub</span>
                                <svg className="h-4 w-4 text-text-secondary" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                            </a>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h4 className="font-bold text-text-primary">Platform</h4>
                        <nav className="flex flex-col gap-2 text-sm text-text-secondary">
                            <Link href="/dashboard" className="hover:text-plasma-cyan transition-colors">Mission Control</Link>
                            <Link href="/asteroids" className="hover:text-plasma-cyan transition-colors">NEO Database</Link>
                            <Link href="/alerts" className="hover:text-plasma-cyan transition-colors">Alert Center</Link>
                            <Link href="/watchlist" className="hover:text-plasma-cyan transition-colors">Watchlist</Link>
                        </nav>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-text-primary">Account</h4>
                        <nav className="flex flex-col gap-2 text-sm text-text-secondary">
                            <Link href="/login" className="hover:text-plasma-cyan transition-colors">Sign In</Link>
                            <Link href="/register" className="hover:text-plasma-cyan transition-colors">Create Account</Link>
                            <Link href="/settings" className="hover:text-plasma-cyan transition-colors">Settings</Link>
                        </nav>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-secondary">
                    <p>© 2026 Neo-Watch. Powered by NASA NEO API.</p>
                    <div className="flex gap-6">
                        <a href="https://api.nasa.gov" target="_blank" rel="noopener noreferrer" className="hover:text-plasma-cyan transition-colors">NASA API</a>
                        <a href="https://cneos.jpl.nasa.gov" target="_blank" rel="noopener noreferrer" className="hover:text-plasma-cyan transition-colors">CNEOS</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
// }}}

// {{{ Info Section
function InfoSection() {
  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-3xl mx-auto text-center pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-6 leading-tight">
            The Earth is in a <span className="bg-linear-to-r from-plasma-cyan to-stellar-blue bg-clip-text text-transparent">Shooting Gallery</span>
          </h2>
          <p className="text-text-secondary text-lg leading-relaxed mb-10">
             Every day, tons of space debris burn up in our atmosphere. Most are harmless, but some pose a genuine threat. 
             Neo-Watch provides the early warning system humanity needs, aggregating data from global observatories.
          </p>
          <ul className="flex flex-col gap-4 items-center">
             {[
               "Live feeds from NASA's Deep Space Network",
               "Real-time trajectory calculation & risk assessment",
               "Global community of amateur and professional astronomers"
             ].map((item, i) => (
               <li key={i} className="flex items-center gap-3 text-text-primary">
                  <div className="w-1.5 h-1.5 rounded-full bg-nebula-purple shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                  {item}
               </li>
             ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
// }}}

// {{{ Landing Page Component
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cosmic-black flex flex-col font-body overflow-x-hidden">
       <HeroSection />
       <InfoSection />
       <DataStrip />
       <FeatureGrid />
       <AppFooter />
    </div>
  );
}
// }}}
