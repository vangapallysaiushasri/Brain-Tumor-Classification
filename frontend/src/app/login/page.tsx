"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import toast from "react-hot-toast";
import { NeuroLogo } from "@/components/ui/logo";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("Neuroradiology");
  const [hospital, setHospital] = useState("");

  const SPECIALIZATIONS = [
    "Neuroradiology",
    "Neurosurgery",
    "Neurology",
    "Oncology",
    "General Radiology",
    "Research",
    "Patient",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    login(name.trim(), specialization, hospital.trim() || undefined);
    toast.success(`Welcome, ${name.trim()}`);
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <NeuroLogo />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Neuro-XAI Login</h1>
            <p className="text-slate-400 text-sm">
              Precision Diagnostics. Explainable Intelligence.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. John Smith"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-slate-300 mb-2">
                Specialization *
              </label>
              <select
                id="specialization"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              >
                {SPECIALIZATIONS.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="hospital" className="block text-sm font-medium text-slate-300 mb-2">
                Hospital/Institution
              </label>
              <input
                type="text"
                id="hospital"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                placeholder="City General Hospital"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Login to Dashboard
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            No password required for demo purposes
          </p>
        </div>
      </div>
    </div>
  );
}
