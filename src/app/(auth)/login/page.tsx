'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ShieldCheck,
  ArrowRight,
  Stethoscope,
  Flame,
  BedDouble,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('sarah.jenkins@metromedical.org');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState('cmo');

  const demoRoles = [
    {
      id: 'cmo',
      name: 'Dr. Sarah Jenkins, MD',
      title: 'Chief Medical Officer',
      icon: <Stethoscope className="h-4 w-4 text-yellow-400" />,
      email: 'sarah.jenkins@metromedical.org',
    },
    {
      id: 'ed_director',
      name: 'Dr. Marcus Vance, MD',
      title: 'Emergency & Cardiology Director',
      icon: <Flame className="h-4 w-4 text-rose-400" />,
      email: 'marcus.vance@metromedical.org',
    },
    {
      id: 'charge_nurse',
      name: 'Nurse Jackson, RN',
      title: 'Inpatient Bed Coordinator',
      icon: <BedDouble className="h-4 w-4 text-amber-400" />,
      email: 'jackson.rn@metromedical.org',
    },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  const selectRole = (role: typeof demoRoles[0]) => {
    setSelectedRole(role.id);
    setEmail(role.email);
  };

  return (
    <div className="min-h-screen bg-[#060608] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-yellow-500/30 selection:text-yellow-200">
      {/* Background ambient glow orbs */}
      <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-yellow-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 h-96 w-96 rounded-full bg-amber-600/10 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 p-0.5 shadow-xl shadow-yellow-500/20 mb-2">
            <div className="h-full w-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
              <Activity className="h-6 w-6 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">MediFlow</h1>
            <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-semibold border border-yellow-500/40">
              AI
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Metropolitan Medical Center • Clinical Operations Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-zinc-800 shadow-2xl space-y-5 bg-zinc-950/80">
          {/* Quick Demo Role Picker */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>Quick Demo Role Sign-In</span>
              <span className="text-yellow-400 font-normal">Click to switch</span>
            </p>
            <div className="space-y-1.5">
              {demoRoles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => selectRole(role)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    selectedRole === role.id
                      ? 'bg-yellow-500/10 border-yellow-500/40 shadow-sm shadow-yellow-500/10'
                      : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-850 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 shrink-0">
                      {role.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-200 truncate">{role.name}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{role.title}</p>
                    </div>
                  </div>

                  {selectedRole === role.id && (
                    <Badge variant="gold" size="sm">Active</Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-zinc-800" />
            <span className="flex-shrink mx-3 text-[10px] text-zinc-500 uppercase tracking-wider">
              Or Sign In with Hospital SSO
            </span>
            <div className="flex-grow border-t border-zinc-800" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Staff Email ID</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-zinc-900/90 text-xs border-zinc-800 focus-visible:ring-yellow-400/50"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-zinc-300">Password</label>
                <span className="text-yellow-400 hover:underline cursor-pointer text-[11px]">
                  Forgot password?
                </span>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-zinc-900/90 text-xs border-zinc-800 focus-visible:ring-yellow-400/50"
              />
            </div>

            <Button type="submit" size="lg" className="btn-gold w-full text-sm font-semibold mt-2">
              <span>Sign In to Operations Center</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>

          <div className="pt-2 text-center text-[11px] text-zinc-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-yellow-400" />
            <span>HIPAA-Compliant Encrypted Clinical Session</span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-500">
          MediFlow AI Hospital Operating System • PostgreSQL Live
        </p>
      </div>
    </div>
  );
}
