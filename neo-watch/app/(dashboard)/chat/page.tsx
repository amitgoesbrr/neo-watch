"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Radio,
  Loader2,
  ArrowRight,
  Rocket,
} from "lucide-react";
import { motion } from "framer-motion";
import { neoApi, type NEO } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function ChatHubPage() {
  const [asteroids, setAsteroids] = useState<NEO[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    async function fetchAsteroids() {
      try {
        const res = await neoApi.getFeed();
        if (res.success && res.data) {
          setAsteroids(res.data.asteroids.slice(0, 12));
        }
      } catch (error) {
        console.error("Failed to fetch asteroids:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAsteroids();
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-8">
        <div className="p-6 rounded-full bg-white/5 border border-white/10 mb-6">
          <MessageCircle className="w-16 h-16 text-white/20" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2 font-display">
          Communications Hub
        </h1>
        <p className="text-text-muted text-sm mb-6 max-w-md">
          Sign in to access real-time discussion channels for tracked asteroids.
        </p>
        <Link
          href="/login"
          className="px-6 py-3 bg-nebula-purple hover:bg-nebula-purple/80 rounded-xl text-sm font-bold text-white transition-colors"
        >
          Sign In to Access
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white font-display flex items-center gap-3">
          <Radio className="w-8 h-8 text-plasma-cyan" />
          Communications Hub
        </h1>
        <p className="text-text-muted text-sm mt-2 font-mono">
          SELECT A CHANNEL TO JOIN REAL-TIME DISCUSSIONS
        </p>
      </div>

      {/* Channel Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-plasma-cyan mx-auto" />
            <p className="text-sm text-text-muted font-mono">
              Scanning frequencies...
            </p>
          </div>
        </div>
      ) : asteroids.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Rocket className="w-12 h-12 text-white/20 mb-4" />
          <p className="text-white/60">No active channels found</p>
          <p className="text-xs text-text-muted mt-1">
            Check back when new asteroids are being tracked
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {asteroids.map((asteroid, index) => (
            <motion.div
              key={asteroid.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/chat/${asteroid.id}`}
                className="block glass rounded-xl border border-white/10 p-5 hover:border-nebula-purple/30 hover:bg-white/5 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        asteroid.isPotentiallyHazardous
                          ? "bg-danger-red shadow-[0_0_6px_#ef4444]"
                          : "bg-safe-green shadow-[0_0_6px_#22c55e]"
                      }`}
                    />
                    <span className="text-[10px] font-mono text-text-muted uppercase">
                      CH-{asteroid.id.slice(-4)}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-nebula-purple transition-colors" />
                </div>

                <h3 className="text-white font-bold text-sm mb-1 truncate">
                  {asteroid.name.replace(/[()]/g, "")}
                </h3>

                <div className="flex items-center gap-3 mt-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      asteroid.isPotentiallyHazardous
                        ? "bg-danger-red/10 text-danger-red border-danger-red/20"
                        : "bg-safe-green/10 text-safe-green border-safe-green/20"
                    }`}
                  >
                    {asteroid.isPotentiallyHazardous ? "HAZARDOUS" : "SAFE"}
                  </span>
                  <span className="text-[10px] font-mono text-text-muted">
                    {asteroid.closeApproachData[0]?.missDistance?.lunar?.toFixed(1)} LD
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-[10px] text-text-muted font-mono">
                  <MessageCircle className="w-3 h-3" />
                  <span>Open Communications Channel</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
