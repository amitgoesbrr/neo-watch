"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  AlertTriangle,
  Info,
  Radar,
  Terminal,
  Clock,
  ChevronRight,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { alertsApi, type Alert } from "@/lib/api";
import { AlertSettings } from "@/components/alerts/AlertSettings";

// Filter types for alerts
type AlertFilterType = "all" | "close_approach" | "hazard_update" | "watchlist_update" | "system" | "unread";

// {{{ Alert Icon
function AlertIcon({ type }: { type: Alert["type"] }) {
  switch (type) {
    case "close_approach":
      return (
        <div className="w-10 h-10 rounded-full bg-warning-amber/20 border border-warning-amber/30 flex items-center justify-center text-warning-amber shadow-[0_0_15px_rgba(245,158,11,0.2)]">
           <Radar className="w-5 h-5" />
        </div>
      );
    case "hazard_update":
      return (
        <div className="w-10 h-10 rounded-full bg-danger-red/20 border border-danger-red/30 flex items-center justify-center text-danger-red shadow-[0_0_15px_rgba(239,68,68,0.2)]">
           <AlertTriangle className="w-5 h-5" />
        </div>
      );
    case "watchlist_update":
      return (
        <div className="w-10 h-10 rounded-full bg-stellar-blue/20 border border-stellar-blue/30 flex items-center justify-center text-stellar-blue shadow-[0_0_15px_rgba(56,189,248,0.2)]">
           <Bell className="w-5 h-5" />
        </div>
      );
    case "system":
      return (
        <div className="w-10 h-10 rounded-full bg-nebula-purple/20 border border-nebula-purple/30 flex items-center justify-center text-nebula-purple shadow-[0_0_15px_rgba(168,85,247,0.2)]">
           <Terminal className="w-5 h-5" />
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60">
           <Info className="w-5 h-5" />
        </div>
      );
  }
}
// }}}

// {{{ Alert Card
function AlertCard({
  alert,
  index,
  onMarkRead,
  onDelete,
}: {
  alert: Alert;
  index: number;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group"
    >
      <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${!alert.isRead ? 'bg-void-dark/60 border-plasma-cyan/30 shadow-[0_0_20px_rgba(14,165,233,0.05)]' : 'bg-void-dark/30 border-white/5 opacity-80 hover:opacity-100 hover:border-white/10'}`}>
         
         {/* Unread Indicator Strip */}
         {!alert.isRead && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-plasma-cyan to-nebula-purple" />
         )}

         <div className="p-4 sm:p-5 flex gap-4 md:gap-6 items-start">
            <div className="shrink-0 mt-1">
               <AlertIcon type={alert.type} />
            </div>

            <div className="flex-1 min-w-0">
               <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                  <div>
                     <div className="flex items-center gap-2 mb-1">
                        {!alert.isRead && (
                           <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-plasma-cyan/20 text-plasma-cyan border border-plasma-cyan/20">
                              New
                           </span>
                        )}
                        <span className="text-xs text-text-muted flex items-center gap-1">
                           <Clock className="w-3 h-3" />
                           {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                        </span>
                     </div>
                     <h4 className={`text-base md:text-lg font-bold font-display ${!alert.isRead ? 'text-white' : 'text-text-secondary'}`}>
                        {alert.title}
                     </h4>
                  </div>
                  
                  {/* Actions (Desktop: visible on hover, Mobile: always visible) */}
                  <div className="flex items-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity self-end md:self-start">
                     {!alert.isRead && (
                        <button
                           onClick={() => onMarkRead(alert.id)}
                           className="p-2 rounded-lg bg-safe-green/10 text-safe-green hover:bg-safe-green/20 border border-safe-green/20 transition-colors"
                           title="Mark as read"
                        >
                           <Check className="w-4 h-4" />
                        </button>
                     )}
                     <button
                        onClick={() => onDelete(alert.id)}
                        className="p-2 rounded-lg bg-white/5 text-text-muted hover:text-danger-red hover:bg-danger-red/10 border border-white/10 hover:border-danger-red/20 transition-colors"
                        title="Delete"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>

               <p className={`mt-2 text-sm leading-relaxed ${!alert.isRead ? 'text-text-primary' : 'text-text-secondary'}`}>
                  {alert.message}
               </p>

               {alert.asteroidId && (
                  <div className="mt-4">
                     <Link 
                        href={`/asteroids/${alert.asteroidId}`}
                        className="inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cosmic-black disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 text-text-primary hover:bg-white/10 hover:border-stellar-blue focus:ring-stellar-blue px-3 py-1.5 text-xs h-8 bg-white/5"
                     >
                        View Telemetry <ChevronRight className="w-3 h-3 ml-1" />
                     </Link>
                  </div>
               )}
            </div>
         </div>
      </div>
    </motion.div>
  );
}
// }}}

// {{{ Alerts Page
export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<AlertFilterType>("all");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        setLoading(true);
        const res = await alertsApi.getAll();
        if (res.success && res.data) {
          setAlerts(res.data.alerts);
        } else {
           // Handle auth fail gracefully
           console.log("Failed to fetch alerts");
           setAlerts([]);
        }
      } catch (err) {
        console.error(err);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
  }, []);

  const handleMarkRead = async (id: string) => {
    // Optimistic
    const prev = [...alerts];
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, isRead: true } : a)));

    try {
      const res = await alertsApi.markAsRead(id);
      if (!res.success) setAlerts(prev);
    } catch (err) {
      console.error(err);
      setAlerts(prev);
    }
  };

  const handleMarkAllRead = async () => {
    const prev = [...alerts];
    setAlerts(alerts.map((a) => ({ ...a, isRead: true })));

    try {
      const res = await alertsApi.markAllAsRead();
      if (!res.success) setAlerts(prev);
    } catch (err) {
      console.error(err);
      setAlerts(prev);
    }
  };

  const handleDelete = async (id: string) => {
    const prev = [...alerts];
    setAlerts(alerts.filter((a) => a.id !== id));

    try {
      const res = await alertsApi.delete(id);
      if (!res.success) setAlerts(prev);
    } catch (err) {
      console.error(err);
      setAlerts(prev);
    }
  };

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  // Filter alerts based on active filter
  const filteredAlerts = alerts.filter((alert) => {
    switch (activeFilter) {
      case "unread":
        return !alert.isRead;
      case "close_approach":
      case "hazard_update":
      case "watchlist_update":
      case "system":
        return alert.type === activeFilter;
      default:
        return true;
    }
  });

  // Filter button configs
  const filterButtons: { key: AlertFilterType; label: string; count?: number }[] = [
    { key: "all", label: "All", count: alerts.length },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "close_approach", label: "Close Approach" },
    { key: "hazard_update", label: "Hazard" },
    { key: "watchlist_update", label: "Watchlist" },
    { key: "system", label: "System" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
         <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-t-2 border-plasma-cyan rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-r-2 border-nebula-purple rounded-full animate-spin reverse-spin"></div>
         </div>
         <p className="text-text-secondary font-mono text-sm tracking-widest uppercase animate-pulse">
            Receiving Transmission...
         </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 md:px-8 pb-12 pt-8 min-h-full relative">
       {/* Background Ambience */}
       <div className="absolute top-0 left-0 w-full h-[500px] bg-linear-to-b from-plasma-cyan/5 via-transparent to-transparent pointer-events-none" />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <h2 className="text-sm font-mono text-plasma-cyan mb-2 tracking-widest uppercase">System Logs</h2>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-white">
            Notifications
          </h1>
          <p className="text-text-secondary mt-2 max-w-lg">
             {unreadCount > 0
               ? `${unreadCount} unread alert${unreadCount !== 1 ? "s" : ""} require your attention.`
               : "All systems nominal. No new alerts."}
          </p>
        </div>
        
        {unreadCount > 0 && (
           <Button 
              onClick={handleMarkAllRead}
              className="bg-white/5 border border-white/10 hover:bg-white/10 text-white shadow-lg backdrop-blur"
           >
             <CheckCheck className="w-4 h-4 mr-2" />
             Acknowledge All
           </Button>
        )}
        <Button
          variant="secondary"
          onClick={() => setShowSettings(!showSettings)}
          className={`border-white/10 ${showSettings ? 'bg-nebula-purple/20 border-nebula-purple/30' : 'bg-white/5 hover:bg-white/10'} text-white`}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="max-w-2xl">
          <AlertSettings onSave={() => setShowSettings(false)} />
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 relative z-10">
        {filterButtons.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              activeFilter === filter.key
                ? "bg-nebula-purple/20 border-nebula-purple/50 text-white shadow-lg shadow-nebula-purple/10"
                : "bg-white/5 border-white/10 text-text-secondary hover:bg-white/10 hover:text-white"
            }`}
          >
            {filter.label}
            {filter.count !== undefined && (
              <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${activeFilter === filter.key ? 'bg-nebula-purple/30' : 'bg-white/10'}`}>
                {filter.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <AnimatePresence mode="popLayout">
         {filteredAlerts.length > 0 ? (
           <div className="space-y-3 max-w-4xl mx-auto md:mx-0">
             {filteredAlerts.map((alert, index) => (
               <AlertCard
                 key={alert.id}
                 alert={alert}
                 index={index}
                 onMarkRead={handleMarkRead}
                 onDelete={handleDelete}
               />
             ))}
           </div>
         ) : (
           <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-2xl border border-white/5">
              <div className="w-20 h-20 bg-linear-to-br from-white/5 to-transparent rounded-full flex items-center justify-center mb-6 border border-white/10">
                 <Bell className="w-8 h-8 text-white/20" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-2">
                {activeFilter === "all" ? "No Active Alerts" : `No ${activeFilter.replace("_", " ")} Alerts`}
              </h3>
              <p className="text-text-secondary max-w-md mb-8">
                 {activeFilter === "all" 
                   ? "Your frequency is clear. Monitor your watchlist for incoming approaches."
                   : "Try selecting a different filter to see more alerts."}
              </p>
              {activeFilter === "all" && (
                <Link href="/watchlist">
                   <Button variant="secondary" className="border-white/10 bg-white/5 hover:bg-white/10 text-white">
                      <Radar className="w-4 h-4 mr-2" />
                      Manage Watchlist
                   </Button>
                </Link>
              )}
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}
// }}}
