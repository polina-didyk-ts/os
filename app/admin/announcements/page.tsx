"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertCircle, Megaphone } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { AdminHeader, BottomNavigation } from "../components";

type Channel = "email" | "slack" | "both";

interface Employee {
  id: string;
  name: string | null;
  email: string;
}

function parseManualEmails(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
}

export default function AnnouncementsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [manualEmails, setManualEmails] = useState("");
  const [channel, setChannel] = useState<Channel>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [sendResult, setSendResult] = useState<{
    sentEmail: number;
    sentSlack: number;
    slackErrors: string[];
    skippedEmails: string[];
  } | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error();
      setEmployees(await res.json());
    } catch {
      setError("Failed to load employees");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const toggleEmployee = (email: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === employees.length) setSelected(new Set());
    else setSelected(new Set(employees.map((e) => e.email)));
  };

  const parsedManual = parseManualEmails(manualEmails);
  const combined = Array.from(new Set([...selected, ...parsedManual]));
  const recipientCount = combined.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSendResult(null);

    const errors: Record<string, string> = {};
    if (!subject.trim()) errors.subject = "Subject is required";
    if (!message.trim()) errors.message = "Message is required";
    if (recipientCount === 0) errors.recipients = "Add at least one recipient";

    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), message: message.trim(), recipientEmails: combined, channel }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setSendResult(data);
      setSubject("");
      setMessage("");
      setManualEmails("");
      setSelected(new Set());
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-transparent flex flex-col">
      <AdminHeader />

      <div className="flex-1 pb-28 px-4 py-5 flex flex-col gap-5 max-w-xl mx-auto w-full">
        {/* Title */}
        <div className="animate-fade-up">
          <p className="text-xs font-grotesk uppercase tracking-widest text-gray-400">ADMIN</p>
          <h1 className="text-2xl font-grotesk text-gray-900 mt-0.5 flex items-center gap-2">
            <Megaphone className="w-6 h-6" strokeWidth={1.5} />
            Announcements
          </h1>
        </div>

        {/* Success */}
        {sendResult !== null && (
          <div className="p-4 bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-xl text-green-700 text-sm space-y-0.5">
            {sendResult.sentEmail > 0 && (
              <p className="font-techstack">✓ Email sent to {sendResult.sentEmail} recipient{sendResult.sentEmail !== 1 ? "s" : ""}</p>
            )}
            {sendResult.sentSlack > 0 && (
              <p className="font-techstack">✓ Slack DM sent to {sendResult.sentSlack} recipient{sendResult.sentSlack !== 1 ? "s" : ""}</p>
            )}
            {sendResult.skippedEmails.length > 0 && (
              <div className="text-yellow-700">
                <p>⚠ {sendResult.skippedEmails.length} Slack DM{sendResult.skippedEmails.length !== 1 ? "s" : ""} skipped — not found in workspace:</p>
                <ul className="mt-1 ml-4 list-disc text-xs">
                  {sendResult.skippedEmails.map((email) => <li key={email}>{email}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject */}
          <div>
            <label className="block text-xs font-grotesk text-gray-500 uppercase tracking-widest mb-2">Subject</label>
            <Input
              type="text"
              placeholder="E.g. Office closed on Friday"
              value={subject}
              maxLength={100}
              onChange={(e) => { setSubject(e.target.value); if (fieldErrors.subject) setFieldErrors({ ...fieldErrors, subject: "" }); }}
              className="w-full bg-white/50 backdrop-blur-sm border-white/60 focus-visible:ring-amber-400/50"
            />
            <div className={`text-right text-xs mt-1 ${subject.length >= 100 ? "text-red-500 font-medium" : "text-gray-400"}`}>
              {subject.length} / 100
            </div>
            {fieldErrors.subject && (
              <div className="flex items-center gap-1.5 mt-1">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="text-xs font-medium text-red-500">{fieldErrors.subject}</span>
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-grotesk text-gray-500 uppercase tracking-widest mb-2">Message</label>
            <Textarea
              placeholder="Write your announcement here..."
              value={message}
              maxLength={2000}
              rows={8}
              onChange={(e) => { setMessage(e.target.value.slice(0, 2000)); if (fieldErrors.message) setFieldErrors({ ...fieldErrors, message: "" }); }}
              className="w-full bg-white/50 backdrop-blur-sm border-white/60 focus-visible:ring-amber-400/50"
            />
            <div className={`text-right text-xs mt-1 ${message.length >= 2000 ? "text-red-500 font-medium" : "text-gray-400"}`}>
              {message.length} / 2000
            </div>
            {fieldErrors.message && (
              <div className="flex items-center gap-1.5 mt-1">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="text-xs font-medium text-red-500">{fieldErrors.message}</span>
              </div>
            )}
          </div>

          {/* Recipients */}
          <div>
            <label className="block text-xs font-grotesk text-gray-500 uppercase tracking-widest mb-3">Recipients</label>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl overflow-hidden mb-3 border border-white/40 shadow-[0_4px_12px_rgba(20,20,20,0.06)]">
              {loadingUsers ? (
                <div className="p-4 space-y-2">
                  {[1, 2, 3].map((i) => <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />)}
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="w-full flex items-center gap-3 px-4 py-3 border-b border-white/40 hover:bg-white/40 transition text-left cursor-pointer"
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                      selected.size === employees.length && employees.length > 0
                        ? "bg-amber-400 border-amber-400"
                        : "border-gray-300"
                    }`}>
                      {selected.size === employees.length && employees.length > 0 && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
                          <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs font-grotesk text-gray-500 uppercase tracking-wide">Select all ({employees.length})</span>
                  </button>

                  <div className="max-h-48 overflow-y-auto">
                    {employees.map((emp) => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => { toggleEmployee(emp.email); if (fieldErrors.recipients) setFieldErrors({ ...fieldErrors, recipients: "" }); }}
                        className="w-full flex items-center gap-3 px-4 py-3 border-b border-white/30 last:border-0 hover:bg-white/40 transition text-left cursor-pointer"
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                          selected.has(emp.email) ? "bg-amber-400 border-amber-400" : "border-gray-300"
                        }`}>
                          {selected.has(emp.email) && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
                              <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-grotesk text-gray-900 truncate">{emp.name ?? emp.email}</p>
                          {emp.name && <p className="text-xs text-gray-400 truncate font-techstack">{emp.email}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <label className="block text-xs font-grotesk text-gray-400 uppercase tracking-widest mb-2">Or add emails manually</label>
            <Textarea
              placeholder={"john@example.com, jane@example.com\nor one per line"}
              value={manualEmails}
              rows={3}
              onChange={(e) => { setManualEmails(e.target.value); if (fieldErrors.recipients) setFieldErrors({ ...fieldErrors, recipients: "" }); }}
              className="w-full text-sm bg-white/50 backdrop-blur-sm border-white/60 focus-visible:ring-amber-400/50"
            />
            {parsedManual.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">{parsedManual.length} valid email{parsedManual.length !== 1 ? "s" : ""} detected</p>
            )}

            {fieldErrors.recipients && (
              <div className="flex items-center gap-1.5 mt-2">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="text-xs font-medium text-red-500">{fieldErrors.recipients}</span>
              </div>
            )}

            {recipientCount > 0 && (
              <div className="mt-3 px-3 py-2 bg-amber-50/80 border border-amber-200 rounded-lg">
                <p className="text-xs font-grotesk text-amber-700">
                  {recipientCount} recipient{recipientCount !== 1 ? "s" : ""} selected
                </p>
              </div>
            )}
          </div>

          {/* Send via */}
          <div>
            <label className="block text-xs font-grotesk text-gray-500 uppercase tracking-widest mb-2">Send via</label>
            <Select value={channel} onValueChange={(v) => setChannel(v as Channel)}>
              <SelectTrigger className="w-full bg-white/50 backdrop-blur-sm border-white/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="slack">Slack</SelectItem>
                <SelectItem value="both">Email + Slack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading || recipientCount === 0 || !subject.trim() || !message.trim()}
            className="w-full text-white py-3 rounded-xl font-grotesk font-normal text-lg cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(249,115,22,0.3)] disabled:translate-y-0 disabled:shadow-none disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ea580c 100%)" }}
          >
            {loading ? "Sending..." : `Send Announcement${recipientCount > 0 ? ` → ${recipientCount}` : ""}`}
          </Button>
        </form>
      </div>

      <BottomNavigation />
    </main>
  );
}
