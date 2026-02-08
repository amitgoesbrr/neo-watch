"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, BellOff, Settings, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { alertsApi } from "@/lib/api";

// {{{ Alert Settings Component
interface AlertSettingsProps {
  onSave?: () => void;
  defaultEnabled?: boolean;
  defaultThreshold?: number;
}

export function AlertSettings({
  onSave,
  defaultEnabled = true,
  defaultThreshold = 7500000,
}: AlertSettingsProps) {
  const [alertEnabled, setAlertEnabled] = useState(defaultEnabled);
  const [thresholdKm, setThresholdKm] = useState(defaultThreshold);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Threshold presets (in km)
  const presets = [
    { label: "Very Close", value: 1000000, description: "~2.5 LD" },
    { label: "Close", value: 5000000, description: "~13 LD" },
    { label: "Moderate", value: 7500000, description: "~19.5 LD" },
    { label: "Far", value: 15000000, description: "~39 LD" },
  ];

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await alertsApi.updateSettings({
        alertEnabled,
        alertThresholdKm: thresholdKm,
      });

      if (res.success) {
        setSuccess(true);
        // Delay closing to show success message
        setTimeout(() => {
          onSave?.();
        }, 1500);
      } else {
        setError(res.error || "Failed to save settings");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6 border border-white/10"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-nebula-purple/20 border border-nebula-purple/30">
          <Settings className="w-5 h-5 text-nebula-purple" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Alert Settings</h3>
          <p className="text-xs text-text-muted">
            Configure global alert preferences for all watchlist items
          </p>
        </div>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 mb-6">
        <div className="flex items-center gap-3">
          {alertEnabled ? (
            <Bell className="w-5 h-5 text-safe-green" />
          ) : (
            <BellOff className="w-5 h-5 text-text-muted" />
          )}
          <div>
            <p className="font-medium text-white">Enable Alerts</p>
            <p className="text-xs text-text-muted">
              Receive notifications for close approaches
            </p>
          </div>
        </div>
        <button
          onClick={() => setAlertEnabled(!alertEnabled)}
          className={`relative w-14 h-7 rounded-full transition-colors ${
            alertEnabled ? "bg-safe-green" : "bg-white/20"
          }`}
        >
          <div
            className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-transform ${
              alertEnabled ? "translate-x-8" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Threshold Selector */}
      <div className={`space-y-4 transition-opacity ${!alertEnabled ? "opacity-40 pointer-events-none" : ""}`}>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Alert Distance Threshold
          </label>
          <p className="text-xs text-text-muted mb-4">
            Get alerted when an asteroid passes closer than this distance
          </p>

          {/* Preset Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {presets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setThresholdKm(preset.value)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  thresholdKm === preset.value
                    ? "bg-nebula-purple/20 border-nebula-purple/50 text-white"
                    : "bg-white/5 border-white/10 text-text-secondary hover:border-white/20"
                }`}
              >
                <p className="text-sm font-medium">{preset.label}</p>
                <p className="text-[10px] text-text-muted font-mono">{preset.description}</p>
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={thresholdKm}
              onChange={(e) => setThresholdKm(Number(e.target.value))}
              min={100000}
              max={50000000}
              step={100000}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-nebula-purple/50"
            />
            <span className="text-text-muted text-sm">km</span>
          </div>
          <p className="text-[10px] text-text-muted mt-2">
            ≈ {(thresholdKm / 384400).toFixed(1)} Lunar Distances (LD)
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex items-center justify-between">
        <div>
          {success && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-safe-green"
            >
              ✓ Settings saved successfully
            </motion.p>
          )}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-danger-red"
            >
              {error}
            </motion.p>
          )}
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>
    </motion.div>
  );
}
// }}}

export default AlertSettings;
