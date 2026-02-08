"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Shield, Key, Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { userApi, type User as UserType } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { AlertSettings } from "@/components/alerts/AlertSettings";

export default function SettingsPage() {
  const { user: contextUser, refreshProfile } = useAuth();
  
  // Local state for form management
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Sync with global auth context
  useEffect(() => {
    if (contextUser) {
      setUser(contextUser);
      setName(contextUser.name);
      setEmail(contextUser.email);
      setLoading(false);
    }
  }, [contextUser]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await userApi.updateProfile({ name });
      if (res.success) {
        setMessage({ type: "success", text: "Profile updated successfully" });
        setUser(prev => prev ? { ...prev, name } : null);
        
        // Update global context so Header reflects changes
        await refreshProfile();
      } else {
        setMessage({ type: "error", text: res.error || "Failed to update profile" });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "An error occurred" });
    } finally {
      setSaving(false);
    }
  }

  const handleResetKey = () => {
    setIsResetting(true);
    // Simulate API call for key rotation
    setTimeout(() => {
      setIsResetting(false);
      setMessage({ type: "success", text: "Access permissions re-verified. Security clearance confirmed." });
    }, 2000);
  };

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-text-muted">Loading system configuration...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display text-white mb-2">System Configuration</h1>
        <p className="text-text-secondary">Manage your account credentials and security preferences.</p>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border flex items-center gap-3 ${
            message.type === "success" 
              ? "bg-safe-green/10 border-safe-green/20 text-safe-green" 
              : "bg-danger-red/10 border-danger-red/20 text-danger-red"
          }`}
        >
          {message.type === "success" ? <Shield className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          {message.text}
        </motion.div>
      )}

      {/* Profile Settings */}
      <section className="glass p-6 rounded-xl border border-white/10">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
          <User className="w-5 h-5 text-plasma-cyan" />
          <h2 className="text-xl font-bold text-white">Analyst Profile</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Display Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
            <Input
              label="Communication ID (Email)"
              value={email}
              disabled
              className="opacity-50 cursor-not-allowed"
            />
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              isLoading={saving}
              className="bg-nebula-purple hover:bg-nebula-purple/80"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </section>

      {/* Notification Preferences - Directly used to avoid double nesting */}
      <AlertSettings />

      {/* Security */}
      <section className="glass p-6 rounded-xl border border-white/10">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
          <Shield className="w-5 h-5 text-danger-red" />
          <h2 className="text-xl font-bold text-white">Security Clearance</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
           <div>
              <p className="text-sm text-text-primary mb-1">Current Clearance Level: <span className="text-plasma-cyan font-mono font-bold">L1 - ANALYST</span></p>
              <p className="text-xs text-text-secondary">
                 System Access Granted: {user ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
              </p>
           </div>
           
           <Button 
             variant="secondary" 
             onClick={handleResetKey}
             isLoading={isResetting}
             className="border-danger-red/30 text-danger-red hover:bg-danger-red/10 w-full sm:w-auto"
           >
              {!isResetting && <Key className="w-4 h-4 mr-2" />}
              Verify Clearance
           </Button>
        </div>
      </section>
    </div>
  );
}
