"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Menu, FileText, Hourglass, CheckCircle2, Camera } from "lucide-react";
import { BottomNavigation, useSideMenu } from "../components";
import { useSession } from "@/src/lib/client";

interface Request {
  id: string;
  status: string;
}

interface Stats {
  total: number;
  inProgress: number;
  completed: number;
}

function getInitials(name: string | null | undefined, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function StatCard({
  icon,
  label,
  value,
  iconClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  iconClass: string;
}) {
  return (
    <div className="flex-1 bg-white rounded-2xl py-4 flex flex-col items-center gap-1 shadow-[0_4px_12px_rgba(20,20,20,0.08),0_1px_3px_rgba(20,20,20,0.06)]">
      <div className={iconClass}>{icon}</div>
      <span className="text-[10px] uppercase tracking-wide text-gray-400 mt-1 font-grotesk">
        {label}
      </span>
      <span className="text-2xl text-gray-900 font-grotesk">{value}</span>
    </div>
  );
}

export default function EmployeeProfilePage() {
  const { data: session } = useSession();
  const { toggle } = useSideMenu();
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user.image) setAvatarUrl(session.user.image);
  }, [session?.user.image]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const uploadRes = await fetch("/api/uploads", { method: "POST", body: form });
      if (!uploadRes.ok) throw new Error();
      const { url } = await uploadRes.json();
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      });
      setAvatarUrl(url);
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/requests");
      if (!res.ok) throw new Error();
      const data: Request[] = await res.json();
      setStats({
        total: data.length,
        inProgress: data.filter((r) => r.status === "in_progress").length,
        completed: data.filter((r) => r.status === "completed").length,
      });
    } catch {
      setStats({ total: 0, inProgress: 0, completed: 0 });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const user = session?.user;
  const initials = getInitials(user?.name, user?.email ?? "");
  const displayName = user?.name ?? user?.email?.split("@")[0] ?? "—";
  const email = user?.email ?? "";

  return (
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <span className="text-lg text-gray-900 font-grotesk">Profile</span>
        </div>
        <span className="text-lg text-[#141414] font-grotesk">Digital Office</span>
      </header>

      <div className="flex-1 pb-28 px-4 py-4 flex flex-col gap-4">
        {/* Profile card */}
        <div className="bg-white rounded-2xl px-6 py-8 flex flex-col items-center shadow-[0_4px_12px_rgba(20,20,20,0.08),0_1px_3px_rgba(20,20,20,0.06)] animate-fade-up">
          {/* Avatar */}
          <div className="relative mb-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="relative w-24 h-24 rounded-full overflow-hidden group cursor-pointer focus:outline-none"
              aria-label="Change avatar"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#141414] flex items-center justify-center text-white text-2xl font-bold select-none">
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingAvatar ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#FFC600] border-2 border-white flex items-center justify-center pointer-events-none">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Name & email */}
          <h2 className="text-xl text-gray-900 font-grotesk">{displayName}</h2>
          <p className="text-sm text-gray-500 mt-0.5 font-techstack">{email}</p>

          {/* Role badge */}
          <span className="mt-3 px-4 py-1 rounded-full bg-[#F2F2F2] text-[#141414] text-xs uppercase tracking-wide border border-gray-200 font-grotesk">
            Member
          </span>
        </div>

        {/* Stats */}
        <div className="flex gap-3 animate-fade-up [animation-delay:120ms]">
          <StatCard
            icon={<FileText className="w-5 h-5" />}
            iconClass="text-[#141414]"
            label="Total"
            value={statsLoading ? "—" : (stats?.total ?? 0)}
          />
          <StatCard
            icon={<Hourglass className="w-5 h-5" />}
            iconClass="text-[#141414]"
            label="In Progress"
            value={statsLoading ? "—" : (stats?.inProgress ?? 0)}
          />
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5" />}
            iconClass="text-green-500"
            label="Done"
            value={statsLoading ? "—" : (stats?.completed ?? 0)}
          />
        </div>
      </div>

      <BottomNavigation />
    </main>
  );
}
