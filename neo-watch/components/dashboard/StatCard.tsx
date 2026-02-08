import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

// {{{ Stat Card Component (Clean, High-Tech)
export function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  trend, // "up" | "down" | "neutral"
  delay = 0,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="bg-void-dark/60 backdrop-blur-md border border-glass-border p-6 rounded-xl hover:border-plasma-cyan/30 transition-all group h-full relative overflow-hidden">

        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity duration-500">
           <Icon className="w-8 h-8 text-plasma-cyan" />
        </div>
        
        <div className="relative z-10">
          <p className="text-text-secondary text-xs uppercase tracking-wider font-semibold font-display mb-2">
            {label}
          </p>
          
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-bold text-text-primary font-display">
              {value}
            </h3>
            {subValue && (
               <span className="text-sm text-text-muted font-mono">{subValue}</span>
            )}
          </div>
          
          {trend && (
             <div className="mt-4 flex items-center gap-2 text-xs font-mono">
                <span className={`px-1.5 py-0.5 rounded leading-none ${
                   trend === 'up' ? 'bg-safe-green/20 text-safe-green' : 
                   trend === 'down' ? 'bg-danger-red/20 text-danger-red' : 
                   'bg-text-muted/20 text-text-secondary'
                }`}>
                   {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '−'} 24H
                </span>
                <span className="text-text-muted/60">Updated just now</span>
             </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
// }}}
