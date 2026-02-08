"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Trash2,
  Bell,
  Edit,
  Radar,
  Plus,
  ShieldAlert,
  Clock,
  ArrowRight,
  BellOff
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { userApi, type WatchlistItem } from "@/lib/api";

// {{{ Watchlist Item Card
function WatchlistItemCard({
  item,
  index,
  onRemove,
  onToggleAlert,
  onEdit
}: {
  item: WatchlistItem;
  index: number;
  onRemove: (id: string) => void;
  onToggleAlert: (item: WatchlistItem) => void;
  onEdit: (item: WatchlistItem) => void;
}) {
  const neo = item.asteroid;

  if (!neo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
        <div className={`h-full bg-void-dark border border-white/5 rounded-2xl overflow-hidden hover:border-plasma-cyan/30 transition-all duration-300 relative group ${item.alertEnabled ? 'hover:shadow-[0_0_30px_rgba(14,165,233,0.15)]' : ''}`}>
           {/* Card Header Background */}
           <div className={`h-24 relative overflow-hidden ${neo.isPotentiallyHazardous ? 'bg-danger-red/10' : 'bg-plasma-cyan/10'}`}>
              <div className="absolute inset-0 opacity-30 bg-[url('/textures/noise.png')] mix-blend-overlay" />
              <div className="absolute top-4 right-4 text-xs font-mono font-bold tracking-widest opacity-40">
                 REL-{neo.id.slice(-4)}
              </div>
              
               {/* Alert Status Indicator */}
              <div className="absolute top-4 left-4 flex gap-2 z-10">
                 <button 
                    onClick={(e) => { e.preventDefault(); onToggleAlert(item); }}
                    className={`flex items-center gap-1 backdrop-blur px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${item.alertEnabled ? 'bg-void-dark/50 border-white/10 text-plasma-cyan hover:bg-void-dark/70' : 'bg-void-dark/50 border-white/10 text-white/40 hover:text-white hover:bg-void-dark/70'}`}
                 >
                    {item.alertEnabled ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                    {item.alertEnabled ? 'On' : 'Off'}
                 </button>
                 {neo.isPotentiallyHazardous && (
                    <div className="flex items-center gap-1 bg-danger-red/20 backdrop-blur px-2 py-1 rounded-full border border-danger-red/20 text-[10px] text-danger-red font-bold uppercase tracking-wider">
                       <ShieldAlert className="w-3 h-3" />
                       Hazard
                    </div>
                 )}
              </div>
           </div>

           {/* Content */}
           <div className="p-6 relative">
              {/* Icon/Avatar overlapping header */}
              <div className="absolute -top-10 left-6 w-16 h-16 rounded-2xl bg-void-dark border-2 border-void-dark shadow-xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                 <div className={`w-full h-full flex items-center justify-center ${neo.isPotentiallyHazardous ? 'bg-danger-red/10' : 'bg-plasma-cyan/10'}`}>
                    <Star className={`w-8 h-8 ${neo.isPotentiallyHazardous ? 'text-danger-red' : 'text-plasma-cyan'} opacity-80`} />
                 </div>
              </div>

              {/* Action Menu (Top Right of content area) */}
              <div className="absolute top-4 right-4 flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                 <button 
                    onClick={() => onEdit(item)}
                    className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
                 >
                    <Edit className="w-4 h-4" />
                 </button>
                 <button 
                    onClick={() => onRemove(item.asteroidId)}
                    className="p-2 hover:bg-danger-red/10 rounded-lg text-white/40 hover:text-danger-red transition-colors"
                 >
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>

              <div className="mt-6">
                 <div className="flex items-baseline gap-2">
                     <h3 className="text-xl font-bold font-display text-white group-hover:text-plasma-cyan transition-colors truncate">
                        {item.nickname || neo.name}
                     </h3>
                     {item.nickname && <span className="text-xs text-text-muted truncate">({neo.name})</span>}
                 </div>
                 
                 {/* Notes Preview */}
                 {item.notes && (
                    <div className="mt-2 text-xs text-white/50 italic border-l-2 border-white/10 pl-2 line-clamp-2">
                       &ldquo;{item.notes}&rdquo;
                    </div>
                 )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                 <div className="p-2 rounded bg-white/5 border border-white/5">
                    <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Alert Thresh.</div>
                    <div className="font-mono text-xs text-text-primary">
                       &lt; {(item.alertThresholdKm / 1000).toFixed(0)}k km
                    </div>
                 </div>
                 <div className="p-2 rounded bg-white/5 border border-white/5">
                    <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Status</div>
                    <div className="font-mono text-xs text-safe-green flex items-center gap-1">
                       <div className="w-1.5 h-1.5 rounded-full bg-safe-green animate-pulse" />
                       Tracking
                    </div>
                 </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                 <div className="text-xs text-text-secondary flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Added: {new Date(item.createdAt).toLocaleDateString()}
                 </div>
                 <Link href={`/asteroids/${neo.id}`}>
                    <div className="flex items-center gap-1 text-xs font-bold text-plasma-cyan hover:text-plasma-cyan/80 transition-colors uppercase tracking-wider">
                       Details <ArrowRight className="w-3 h-3" />
                    </div>
                 </Link>
              </div>
           </div>
        </div>
    </motion.div>
  );
}
// }}}

// {{{ Watchlist Page
export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<WatchlistItem | null>(null);
  const [editForm, setEditForm] = useState({ nickname: "", notes: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchWatchlist() {
      try {
        setLoading(true);
        const res = await userApi.getWatchlist();
        if (res.success && res.data) {
          setItems(res.data.items);
        } else {
           // If unauthorized, normally we'd redirect to login. 
           // For this prototype, we'll assume empty or demo state.
           console.log("Watchlist fetch failed or unauthorized");
           setItems([]); 
        }
      } catch (err) {
        console.error(err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    fetchWatchlist();
  }, []);

  const handleEditClick = (item: WatchlistItem) => {
    setEditingItem(item);
    setEditForm({ 
      nickname: item.nickname || "", 
      notes: item.notes || "" 
    });
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    
    setIsSaving(true);
    try {
      // Optimistic update
      const updatedItem = { 
        ...editingItem, 
        nickname: editForm.nickname, 
        notes: editForm.notes 
      };
      
      setItems(items.map(i => i.asteroidId === editingItem.asteroidId ? updatedItem : i));
      setEditingItem(null);

      await userApi.updateWatchlistItem(editingItem.asteroidId, {
        nickname: editForm.nickname,
        notes: editForm.notes
      });
    } catch (err) {
      console.error("Failed to save watchlist item", err);
      // Revert would go here if we implemented complex rollback logic
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (asteroidId: string) => {
    // Optimistic update
    const previousItems = [...items];
    setItems(items.filter((item) => item.asteroidId !== asteroidId));

    try {
      const res = await userApi.removeFromWatchlist(asteroidId);
      if (!res.success) {
         // Revert on failure
         setItems(previousItems);
      }
    } catch (err) {
       setItems(previousItems);
       console.error(err);
    }
  };

  const handleToggleAlert = async (item: WatchlistItem) => {
     // Optimistic update
     const updatedItems = items.map(i => 
        i.asteroidId === item.asteroidId ? { ...i, alertEnabled: !i.alertEnabled } : i
     );
     setItems(updatedItems);

     try {
        await userApi.updateWatchlistItem(item.asteroidId, {
           alertEnabled: !item.alertEnabled
        });
     } catch (err) {
        // Revert
        setItems(items);
        console.error(err);
     }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
         <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-t-2 border-plasma-cyan rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-r-2 border-nebula-purple rounded-full animate-spin reverse-spin"></div>
         </div>
         <p className="text-text-secondary font-mono text-sm tracking-widest uppercase animate-pulse">
            Syncing Watchlist...
         </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 md:px-8 pb-12 pt-8 min-h-full relative">
       {/* Background Ambience */}
       <div className="absolute top-0 left-0 w-full h-125 bg-linear-to-b from-stellar-blue/5 via-transparent to-transparent pointer-events-none" />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <h2 className="text-sm font-mono text-plasma-cyan mb-2 tracking-widest uppercase">Target Tracking</h2>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-white">
            Watchlist
          </h1>
          <p className="text-text-secondary mt-2 max-w-lg">
            Monitor specific Near-Earth Objects. Receive alerts for close approaches and potential hazards.
          </p>
        </div>
        
        <div className="flex gap-4">
           {items.length > 0 && (
              <div className="bg-void-dark/50 backdrop-blur border border-white/10 px-4 py-2 rounded-lg text-sm text-text-secondary">
                 <span className="text-white font-mono font-bold mr-2">{items.length}</span> 
                 Active Targets
              </div>
           )}
           <Link href="/asteroids">
             <Button className="bg-nebula-purple hover:bg-nebula-purple/80 text-white border-0 shadow-lg shadow-nebula-purple/20">
               <Plus className="w-4 h-4 mr-2" />
               Add Target
             </Button>
           </Link>
        </div>
      </div>

      {/* Watchlist Grid */}
      {items.length > 0 ? (
        <AnimatePresence mode="popLayout">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {items.map((item, index) => (
               <WatchlistItemCard
                 key={item.id}
                 item={item}
                 index={index}
                 onRemove={handleRemove}
                 onToggleAlert={handleToggleAlert}
                 onEdit={handleEditClick}
               />
             ))}
           </div>
        </AnimatePresence>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-2xl border border-white/5">
           <div className="w-20 h-20 bg-linear-to-br from-white/5 to-transparent rounded-full flex items-center justify-center mb-6 border border-white/10">
              <Star className="w-8 h-8 text-white/20" />
           </div>
           <h3 className="text-xl font-display font-bold text-white mb-2">No Active Targets</h3>
           <p className="text-text-secondary max-w-md mb-8">
              Your tracking system is currently idle. Browse the database to designate asteroids for orbital monitoring.
           </p>
           <Link href="/asteroids">
              <Button variant="secondary" className="border-white/10 bg-white/5 hover:bg-white/10 text-white">
                 <Radar className="w-4 h-4 mr-2" />
                 Initialize Search
              </Button>
           </Link>
        </div>
      )}
     
     {/* Edit Modal */}
     <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Edit Target Details"
     >
        <div className="space-y-4">
           <div>
              <label className="block text-xs uppercase text-text-secondary tracking-wider mb-2">Custom Designation (Nickname)</label>
              <input 
                 type="text" 
                 value={editForm.nickname}
                 onChange={(e) => setEditForm(prev => ({ ...prev, nickname: e.target.value }))}
                 className="w-full bg-void-dark/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-nebula-purple focus:outline-none transition-colors"
                 placeholder="e.g. Near Miss Primary"
              />
           </div>
           <div>
              <label className="block text-xs uppercase text-text-secondary tracking-wider mb-2">Mission Notes</label>
              <textarea 
                 value={editForm.notes}
                 onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                 className="w-full bg-void-dark/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-nebula-purple focus:outline-none transition-colors min-h-[100px]"
                 placeholder="Enter observation notes..."
              />
           </div>
           <div className="flex justify-end gap-3 pt-4">
              <Button 
                 variant="ghost" 
                 onClick={() => setEditingItem(null)}
                 className="text-text-secondary hover:text-white"
              >
                 Cancel
              </Button>
              <Button 
                 onClick={handleSaveEdit}
                 disabled={isSaving}
                 className="bg-nebula-purple hover:bg-nebula-purple/80 text-white"
              >
                 {isSaving ? "Saving..." : "Save Changes"}
              </Button>
           </div>
        </div>
     </Modal>
    </div>
  );
}
// }}}
