"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  FileText,
  Hourglass,
  CheckCircle2,
  MoreHorizontal,
  Upload,
  Trash2,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { EmployeeHeader, BottomNavigation } from "../components";
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
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function StatCard({
  icon,
  label,
  value,
  holoIndex,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  holoIndex: number;
}) {
  const HOLO = [
    "linear-gradient(135deg, #fde68a 0%, #fbbf24 32%, #f97316 65%, #ea580c 100%)",
    "linear-gradient(225deg, #fef08a 0%, #facc15 30%, #fb923c 65%, #ef4444 100%)",
    "linear-gradient(45deg,  #fef9c3 0%, #fde047 32%, #fb923c 65%, #f97316 100%)",
  ];
  return (
    <div className="flex-1 bg-white/28 backdrop-blur-xl rounded-2xl py-4 flex flex-col items-center gap-1 shadow-[0_8px_32px_rgba(20,20,20,0.11),inset_0_1px_0_rgba(255,255,255,0.55)] border border-white/15">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden"
        style={{ background: HOLO[holoIndex] }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/5 to-transparent" />
        <div className="relative z-10 text-white [&>*]:w-4 [&>*]:h-4">{icon}</div>
      </div>
      <span className="text-[10px] uppercase tracking-wide text-gray-400 mt-1 font-grotesk">
        {label}
      </span>
      <span className="text-2xl text-gray-900 font-grotesk">{value}</span>
    </div>
  );
}

export default function EmployeeProfilePage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [bio, setBio] = useState<string>("");
  const [bioEditing, setBioEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [bioSaving, setBioSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false);
      }
    };
    if (avatarMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [avatarMenuOpen]);

  useEffect(() => {
    if (session?.user.image) setAvatarUrl(session.user.image);
  }, [session?.user.image]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => setBio(data.bio ?? ""));
  }, [session]);

  const handleAvatarDelete = async () => {
    setDeletingAvatar(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: null }),
      });
      setAvatarUrl(null);
    } finally {
      setDeletingAvatar(false);
    }
  };

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

  const saveBio = async () => {
    setBioSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: bioDraft.trim() || null }),
      });
      setBio(bioDraft.trim());
      setBioEditing(false);
    } finally {
      setBioSaving(false);
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
    <main className="min-h-screen bg-transparent flex flex-col">
      <EmployeeHeader />

      <div className="flex-1 pb-28 px-4 py-4 flex flex-col gap-4">
        {/* Profile card */}
        <div className="bg-white/28 backdrop-blur-xl rounded-2xl px-6 py-8 flex flex-col items-center shadow-[0_8px_32px_rgba(20,20,20,0.11),inset_0_1px_0_rgba(255,255,255,0.55)] border border-white/15 animate-fade-up">
          {/* Avatar */}
          <div className="relative mb-4" ref={avatarMenuRef}>
            {/* Avatar circle */}
            <div className="relative w-24 h-24 rounded-full overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#141414] flex items-center justify-center text-white text-2xl font-bold select-none">
                  {initials}
                </div>
              )}
              {(uploadingAvatar || deletingAvatar) && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Three-dot button */}
            <button
              onClick={() => setAvatarMenuOpen((v) => !v)}
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 transition cursor-pointer"
              aria-label="Photo options"
            >
              <MoreHorizontal className="w-3.5 h-3.5 text-gray-500" />
            </button>

            {/* Dropdown */}
            {avatarMenuOpen && (
              <div className="absolute top-6 right-[-60px] z-20 w-44 bg-white/90 backdrop-blur-md rounded-xl shadow-[0_8px_24px_rgba(20,20,20,0.12)] border border-white/60 py-1 overflow-hidden">
                <button
                  onClick={() => {
                    setAvatarMenuOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-grotesk text-gray-700 hover:bg-amber-50 transition cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-amber-500" />
                  Upload photo
                </button>
                {avatarUrl && (
                  <button
                    onClick={() => {
                      setAvatarMenuOpen(false);
                      handleAvatarDelete();
                    }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-grotesk text-red-500 hover:bg-red-50 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove photo
                  </button>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          {/* Name & email */}
          <h2 className="text-xl text-gray-900 font-grotesk">{displayName}</h2>
          <p className="text-sm text-gray-500 mt-0.5 font-techstack">{email}</p>

          {/* Role badge */}
          <span className="mt-3 px-4 py-1 rounded-full bg-white/20 text-gray-600 text-xs uppercase tracking-wide border border-white/25 font-grotesk">
            Member
          </span>
        </div>

        {/* Bio */}
        <div className="bg-white/28 backdrop-blur-xl rounded-2xl px-5 py-4 shadow-[0_8px_32px_rgba(20,20,20,0.11),inset_0_1px_0_rgba(255,255,255,0.55)] border border-white/15 animate-fade-up [animation-delay:80ms]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-grotesk text-gray-500 uppercase tracking-widest">About me</p>
            {!bioEditing && (
              <button
                onClick={() => {
                  setBioDraft(bio);
                  setBioEditing(true);
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white/60 transition cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {bioEditing ? (
            <div className="space-y-2">
              <textarea
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                rows={3}
                maxLength={500}
                autoFocus
                placeholder="Write something about yourself…"
                className="w-full text-sm font-techstack text-gray-700 bg-white/20 border border-white/30 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-amber-400/50 placeholder:text-gray-300"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveBio}
                  disabled={bioSaving}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-grotesk rounded-lg cursor-pointer disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)" }}
                >
                  <Check className="w-3.5 h-3.5" />
                  {bioSaving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => setBioEditing(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 border border-white/30 text-gray-600 text-xs font-grotesk rounded-lg cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            </div>
          ) : bio ? (
            <p className="text-sm font-techstack text-gray-600 leading-relaxed">{bio}</p>
          ) : (
            <p className="text-sm font-techstack text-gray-300 italic">
              No bio yet. Tap the pencil to add one.
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-3 animate-fade-up [animation-delay:120ms]">
          <StatCard
            icon={<FileText />}
            holoIndex={0}
            label="Total"
            value={statsLoading ? "—" : (stats?.total ?? 0)}
          />
          <StatCard
            icon={<Hourglass />}
            holoIndex={1}
            label="In Progress"
            value={statsLoading ? "—" : (stats?.inProgress ?? 0)}
          />
          <StatCard
            icon={<CheckCircle2 />}
            holoIndex={2}
            label="Done"
            value={statsLoading ? "—" : (stats?.completed ?? 0)}
          />
        </div>
      </div>

      <BottomNavigation />
    </main>
  );
}
