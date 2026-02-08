"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Clock,
  Loader2,
  Star,
} from "lucide-react";

import { neoApi, userApi, type NEO, type NeoStatsResponse } from "@/lib/api";
import DashboardOrbitalViewer from "@/components/asteroids/DashboardOrbitalViewer";



// {{{ Dashboard Page
export default function DashboardPage() {
  const [neos, setNeos] = useState<NEO[]>([]);
  const [stats, setStats] = useState<NeoStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"2D" | "3D">("3D");
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const exportLogs = () => {
    const dataStr = JSON.stringify(neos, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `system_telemetry_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleWatchlistToggle = async (neo: NEO) => {
    setTogglingId(neo.id);
    try {
      if (watchedIds.has(neo.id)) {
        // Remove from watchlist
        const res = await userApi.removeFromWatchlist(neo.id);
        if (res.success) {
          setWatchedIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(neo.id);
            return newSet;
          });
        }
      } else {
        // Add to watchlist
        const res = await userApi.addToWatchlist({ asteroidId: neo.id });
        if (res.success) {
          setWatchedIds(prev => new Set(prev).add(neo.id));
        }
      }
    } catch (err) {
      console.error("Failed to toggle watchlist", err);
    } finally {
      setTogglingId(null);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [feedRes, statsRes, watchlistRes] = await Promise.all([
          neoApi.getFeed().catch(() => ({ success: false, data: null })), 
          neoApi.getStats().catch(() => ({ success: false, data: null })),
          userApi.getWatchlist().catch(() => ({ success: false, data: null })),
        ]);

        if (feedRes.success && feedRes.data) {
          setNeos(feedRes.data.asteroids);
        }
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
        if (watchlistRes.success && watchlistRes.data) {
          setWatchedIds(new Set(watchlistRes.data.items.map(item => item.asteroidId)));
        }
      } catch (err) {
        setError("Failed to initialize dashboard telemetry.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return (
     <div className="flex h-full w-full items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
           <div className="h-px w-32 bg-linear-to-r from-transparent via-plasma-cyan to-transparent mx-auto animate-pulse" />
           <p className="text-sm font-mono text-text-secondary tracking-widest uppercase flex items-center gap-2 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              Initializing Telemetry...
           </p>
        </div>
     </div>
  );

  if (error) return (
     <div className="flex h-full w-full items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4 glass p-8 rounded-xl border border-danger-red/30 max-w-md">
           <ShieldAlert className="w-12 h-12 text-danger-red mx-auto" />
           <h3 className="text-xl font-bold text-white">System Error</h3>
           <p className="text-text-secondary">{error}</p>
           <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-danger-red/20 text-danger-red border border-danger-red/30 rounded-lg hover:bg-danger-red/30 transition-colors"
           >
              Retry Connection
           </button>
        </div>
     </div>
  );

  // Calculate percentages strictly
  const totalCount = stats?.totalCount || 0;
  const highRiskCount = stats?.hazardousCount || 0;
  const mediumRiskCount = totalCount > 0 ? Math.floor(totalCount * 0.15) : 0;
  const lowRiskCount = totalCount > 0 ? Math.max(0, totalCount - highRiskCount - mediumRiskCount) : 0;
  
  const highRiskPct = totalCount > 0 ? Math.round((highRiskCount / totalCount) * 100) : 0;
  const mediumRiskPct = totalCount > 0 ? Math.round((mediumRiskCount / totalCount) * 100) : 0;
  const lowRiskPct = totalCount > 0 ? 100 - highRiskPct - mediumRiskPct : 0;

  return (
    <div className="p-8 space-y-8">
      {/* Top Row: Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total NEOs */}
        <div className="glass p-6 rounded-xl relative overflow-hidden group hover:border-nebula-purple/50 transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-nebula-purple/10 rounded-full blur-2xl"></div>
          <p className="text-sm text-white/50 font-medium">Total NEOs Detected</p>
          <h3 className="text-3xl font-bold mt-2 glow-text-purple">{stats?.totalCount || "..."}</h3>
          <div className="flex items-center gap-1 mt-3 text-xs text-stellar-blue">
            <TrendingUp className="w-4 h-4" />
            <span>+1.2% vs last cycle</span>
          </div>
        </div>

        {/* Hazardous Count */}
        <div className="glass p-6 rounded-xl relative overflow-hidden group hover:border-danger-red/50 transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-danger-red/10 rounded-full blur-2xl"></div>
          <p className="text-sm text-white/50 font-medium">Hazardous Count</p>
          <h3 className="text-3xl font-bold mt-2 text-red-400">{stats?.hazardousCount ?? "..."}</h3>
          <div className="flex items-center gap-1 mt-3 text-xs text-red-500/80">
            <ShieldAlert className="w-4 h-4" />
            <span>{stats?.hazardousCount ? `${stats.hazardousCount} Critical Alerts` : "Scan Complete"}</span>
          </div>
        </div>

        {/* Closest Approach */}
        <div className="glass p-6 rounded-xl relative overflow-hidden group hover:border-stellar-blue/50 transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-stellar-blue/10 rounded-full blur-2xl"></div>
          <p className="text-sm text-white/50 font-medium">Closest Approach</p>
          <h3 className="text-3xl font-bold mt-2">
            {stats?.closestApproach ? (stats.closestApproach.distanceKm / 384400).toFixed(2) : "0.00"} 
            <span className="text-lg font-normal text-white/40 ml-1">LD</span>
          </h3>
          <div className="flex items-center gap-1 mt-3 text-xs text-white/40">
            <Clock className="w-4 h-4" />
            <span>Object: {stats?.closestApproach?.asteroid.name || "None"}</span>
          </div>
        </div>

        {/* System Risk */}
        <div className="glass p-6 rounded-xl relative overflow-hidden group hover:border-nebula-purple/50 transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-nebula-purple/10 rounded-full blur-2xl"></div>
          <p className="text-sm text-white/50 font-medium">System Risk Level</p>
          <h3 className="text-3xl font-bold mt-2 text-nebula-purple uppercase tracking-tighter">MODERATE</h3>
          <div className="flex items-center gap-1 mt-3 text-xs text-white/40">
            <ShieldAlert className="w-4 h-4" />
            <span>Shield Integrity: 100%</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Visualization & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Large Visualization Container */}
        <div className="lg:col-span-2 glass rounded-xl overflow-hidden border border-white/10 relative h-112.5">
          <div className="absolute top-4 left-6 z-10 pointer-events-none">
            <h4 className="font-bold text-lg">Orbital Trajectory Visualization</h4>
            <p className="text-xs text-white/40">Live Feed: Lunar Sector 7-G</p>
          </div>
          <div className="absolute top-4 right-6 z-10 flex gap-2">
            <button 
              onClick={() => setViewMode("2D")}
              className={`px-3 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${viewMode === "2D" ? "bg-nebula-purple text-white border-nebula-purple shadow-lg shadow-nebula-purple/20" : "bg-white/5 hover:bg-white/10 border-white/10 text-white/60"}`}
            >
              2D VIEW
            </button>
            <button 
              onClick={() => setViewMode("3D")}
              className={`px-3 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${viewMode === "3D" ? "bg-nebula-purple text-white border-nebula-purple shadow-lg shadow-nebula-purple/20" : "bg-white/5 hover:bg-white/10 border-white/10 text-white/60"}`}
            >
              3D ACTIVE
            </button>
          </div>
          
          <DashboardOrbitalViewer 
            neos={neos} 
            viewMode={viewMode} 
            error={error} 
            isLoading={loading} 
          />
        </div>

        {/* Risk Distribution Card */}
        <div className="glass rounded-xl p-8 border border-white/10 flex flex-col items-center justify-between text-center">
          <div className="w-full text-left">
            <h4 className="font-bold text-lg mb-1">Risk Overview</h4>
            <p className="text-xs text-white/40">Distribution of classified objects</p>
          </div>
          {/* Donut Chart */}
          <div className="relative w-48 h-48 flex items-center justify-center my-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background track */}
              <circle cx="50" cy="50" fill="none" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8"></circle>
              {
                (() => {
                    const circ = 251.2;
                    const highStroke = (highRiskCount / (totalCount || 1)) * circ;
                    const mediumStroke = (mediumRiskCount / (totalCount || 1)) * circ;
                    const lowStroke = (lowRiskCount / (totalCount || 1)) * circ;

                    if (totalCount === 0) return null;

                    return (
                        <>
                            {/* Low Risk (Green) */}
                            <circle cx="50" cy="50" fill="none" r="40" stroke="#10b981" strokeDasharray={`${lowStroke} ${circ}`} strokeDashoffset="0" strokeWidth="8"></circle>
                            {/* Medium Risk (Yellow) */}
                            <circle cx="50" cy="50" fill="none" r="40" stroke="#f59e0b" strokeDasharray={`${mediumStroke} ${circ}`} strokeDashoffset={-lowStroke} strokeWidth="8"></circle>
                            {/* High Risk (Red) */}
                            <circle cx="50" cy="50" fill="none" r="40" stroke="#ef4444" strokeDasharray={`${highStroke} ${circ}`} strokeDashoffset={-(lowStroke + mediumStroke)} strokeWidth="8"></circle>
                        </>
                    )
                })()
              }
            </svg>
            <div className="absolute flex flex-col">
              <span className="text-3xl font-bold">
                {totalCount 
                  ? (totalCount >= 1000 
                    ? `${(totalCount / 1000).toFixed(1)}k+` 
                    : totalCount)
                  : "..."}
              </span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest">Total</span>
            </div>
          </div>
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-white/60">Low Risk</span>
              </div>
              <span className="font-mono">{lowRiskPct}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="text-white/60">Medium Risk</span>
              </div>
              <span className="font-mono">{mediumRiskPct}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="text-white/60">High Priority</span>
              </div>
              <span className="font-mono">
                 {highRiskPct}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Real-time Feed */}
      <div className="glass rounded-xl overflow-hidden border border-white/10">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-lg">Real-time Detection Feed</h4>
            <p className="text-xs text-white/40">Last scan completed 0.4 seconds ago</p>
          </div>
          <button 
             onClick={exportLogs}
             className="text-xs flex items-center gap-2 text-nebula-purple font-bold hover:text-stellar-blue transition-all uppercase cursor-pointer"
          >
             <ArrowRight className="w-4 h-4" /> EXPORT LOGS
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-200">
            <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-white/40 font-mono">
              <tr>
                <th className="px-6 py-4 font-semibold">Designation</th>
                <th className="px-6 py-4 font-semibold">Estimated Size</th>
                <th className="px-6 py-4 font-semibold">Approach Distance</th>
                <th className="px-6 py-4 font-semibold">Velocity</th>
                <th className="px-6 py-4 font-semibold text-center">Risk Level</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {neos.slice(0, 5).map((neo) => {
                 const isCritical = neo.isPotentiallyHazardous;
                 const distanceLD = (neo.closeApproachData[0]?.missDistance.kilometers || 0) / 384400;
                 return (
                  <tr key={neo.id} className="hover:bg-white/5 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold">{neo.name}</span>
                        <span className="text-[10px] text-white/40">NEO Class: Apollo</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono">{neo.estimatedDiameter.maxM.toFixed(0)}m</td>
                    <td className="px-6 py-4 font-mono">{distanceLD.toFixed(2)} LD</td>
                    <td className="px-6 py-4 font-mono text-white/60">{neo.closeApproachData[0]?.velocity.kmPerSecond.toFixed(1)} km/s</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${isCritical ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                          {isCritical ? 'CRITICAL' : 'NOMINAL'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => handleWatchlistToggle(neo)}
                            disabled={togglingId === neo.id}
                            className={`p-2 rounded-lg transition-all ${watchedIds.has(neo.id) ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'hover:bg-white/10 text-white/40 hover:text-amber-400'}`}
                            title={watchedIds.has(neo.id) ? "Remove from Watchlist" : "Add to Watchlist"}
                        >
                           {togglingId === neo.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                           ) : (
                              <Star className={`w-5 h-5 ${watchedIds.has(neo.id) ? 'fill-current' : ''}`} />
                           )}
                        </button>
                        <Link 
                           href={`/asteroids/${neo.id}`}
                           className="bg-nebula-purple/10 hover:bg-nebula-purple px-4 py-2 rounded-lg text-[10px] font-bold transition-all border border-nebula-purple/20 hover:shadow-lg hover:shadow-nebula-purple/30 text-white cursor-pointer inline-block"
                        >
                           TRACK
                        </Link>
                      </div>
                    </td>
                  </tr>
                 );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="pt-0 flex flex-col md:flex-row justify-between items-center text-[10px] text-white/20 uppercase tracking-[0.2em] gap-4">
        <span>Last Deep Space Uplink: T+00:00:14.2</span>
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span> Hubble Node Active</span>
          <span className="flex items-center gap-1"><span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span> JWST Link Active</span>
        </div>
      </footer>
    </div>
  );
}
// }}}
