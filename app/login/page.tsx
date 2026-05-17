"use client";

import { useActionState, useEffect, useState } from "react";
import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Lock, User, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#030014]">
      {/* Immersive Animated Background Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[120px]" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.4, 0.2],
          rotate: [0, -90, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/20 blur-[120px]" 
      />

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center z-10">
        
        {/* Left Side: Branding / Welcome message */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden lg:flex flex-col gap-6 p-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-200">Premium Access</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
            Manage your <br/>
            <span className="text-gradient">Masterpieces.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
            A private, secure, and ultra-fast photo gallery administration dashboard. Upload, organize, and cherish your moments.
          </p>
        </motion.div>

        {/* Right Side: Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="glass-panel p-8 sm:p-10 rounded-3xl relative overflow-hidden group">
            {/* Subtle inner glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 via-purple-500/0 to-indigo-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 transition-all duration-700" />
            
            <div className="relative z-10">
              <div className="text-center mb-10">
                <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/25">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h2>
                <p className="text-muted-foreground">Sign in to continue to your dashboard</p>
              </div>

              <form action={formAction} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-300">Username</Label>
                  <div className="relative group/input">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-indigo-400 transition-colors" />
                    <Input
                      id="username"
                      name="username"
                      placeholder="Enter your username"
                      className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all rounded-xl"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-300">Password</Label>
                  <div className="relative group/input">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-indigo-400 transition-colors" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all rounded-xl"
                      required
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-white text-black hover:bg-gray-200 transition-all rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]" 
                    disabled={isPending}
                  >
                    {isPending ? "Authenticating..." : "Sign In"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
