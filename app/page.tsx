"use client";

// Hiblink Tech Career Gateway

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Loader2, ShieldCheck, Upload, Briefcase } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useTelegram } from "@/hooks/useTelegram";

export default function Home() {
  const router = useRouter();
  const { tg, user, initData, isReady } = useTelegram();
  const { role, setRole } = useAppStore();
  const [checking, setChecking] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    const authenticateUser = async () => {
      if (!isReady || !user) {
        setChecking(false);
        return;
      }

      setAuthenticating(true);

      try {
        if (initData) {
          const res = await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ initData }),
          });

          if (res.ok) {
            const data = await res.json();
            
            if (data.role) {
              setRole(data.role);
              router.replace("/profile");
              return;
            }
          }
        }
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        setAuthenticating(false);
        setChecking(false);
      }
    };

    authenticateUser();
  }, [isReady, user, initData, router, setRole]);

  const handleDropCV = useCallback(() => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred("medium");
    }
    router.push("/drop-cv");
  }, [tg, router]);

  const handleBrowseRoles = useCallback(() => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred("light");
    }
    router.push("/jobs");
  }, [tg, router]);

  if (!isReady || checking || authenticating) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-hiblink-dark p-4">
        <div className="w-14 h-14 rounded-full bg-hiblink-blue/10 flex items-center justify-center mb-4">
          <Loader2 className="w-7 h-7 text-hiblink-blue animate-spin" />
        </div>
        <p className="text-text-primary font-bold text-base">
          {authenticating ? "Authenticating..." : "Loading..."}
        </p>
        {authenticating && (
          <p className="text-text-muted text-xs mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-hiblink-blue" />
            Secure connection
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen bg-hiblink-dark overflow-hidden flex flex-col">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-6 justify-between">
        <div className="mb-6">
          <div className="w-40 h-14 rounded-2xl flex items-center justify-center mb-8 mt-4">
            <Image
              src="/images/hiblink-tech-logo-white.png"
              alt="Hiblink Tech"
              width={160}
              height={56}
              unoptimized
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-extrabold text-hiblink-light leading-tight">
              Build Your <br />
              <span className="text-hiblink-blue">Tech Career</span>
            </h1>
            <p className="text-text-muted text-sm mt-3">
              Join Hiblink's talent network. Drop your CV and get matched with opportunities in Fintech, Agrotech, Healthtech, and more.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleDropCV}
            className="w-full py-4 bg-hiblink-blue text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-hiblink-blue/30 active:scale-[0.98] transition-all"
          >
            <Upload className="w-5 h-5" />
            Drop Your CV
          </button>
          
          <button
            onClick={handleBrowseRoles}
            className="w-full py-4 bg-transparent border-2 border-hiblink-orange text-hiblink-orange rounded-2xl font-bold text-base active:scale-[0.98] transition-all"
          >
            Browse Open Roles
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-text-muted text-[10px]">
            Hiblink Tech © 2026
          </p>
        </div>
      </div>
    </div>
  );
}