"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { PRIORITY_LEVELS } from "@/src/modules/requests/requests.dto";

interface IdeaFormProps {
  onSuccess: (ticketNumber: string) => void;
}

export function IdeaForm({ onSuccess }: IdeaFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [shaking, setShaking] = useState(false);
  const [formData, setFormData] = useState<{
    idea: string;
    priority: string;
  }>({
    idea: "",
    priority: "medium",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedIdea = formData.idea.trim();
    if (!trimmedIdea) {
      setFieldErrors({ idea: "Please share your idea or feedback" });
      setShaking(true);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "idea",
          idea: trimmedIdea,
          priority: formData.priority,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === "VALIDATION_ERROR" && Array.isArray(errorData.details)) {
          const MESSAGES: Record<string, string> = {
            idea: "Please share your idea or feedback",
          };
          const mapped: Record<string, string> = {};
          for (const d of errorData.details as { path: string; message: string }[]) {
            if (d.path && MESSAGES[d.path]) mapped[d.path] = MESSAGES[d.path];
          }
          if (Object.keys(mapped).length > 0) {
            setFieldErrors(mapped);
          } else {
            setError("Please check the highlighted fields");
          }
        } else {
          setError(errorData.error || "Something went wrong. Please try again.");
        }
        setShaking(true);
        setLoading(false);
        return;
      }

      const data = await response.json();
      onSuccess(data.ticketNumber);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-6 ${shaking ? "animate-shake" : ""}`}
      onAnimationEnd={() => setShaking(false)}
    >
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Idea */}
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2 font-grotesk">
          Your idea or feedback
        </label>
        <div className="relative">
          <Textarea
            placeholder="Share your thoughts, suggestions or feedback..."
            value={formData.idea}
            onChange={(e) => {
              setFormData({ ...formData, idea: e.target.value.slice(0, 500) });
              if (fieldErrors.idea) setFieldErrors({ ...fieldErrors, idea: "" });
            }}
            rows={8}
            maxLength={500}
            className="w-full bg-white/50 backdrop-blur-sm border-white/60 focus-visible:ring-amber-400/50"
          />
          <div
            className={`text-right text-xs mt-1 ${formData.idea.length >= 500 ? "text-red-500 font-medium" : "text-gray-400"}`}
          >
            {formData.idea.length} / 500
          </div>
        </div>
        {fieldErrors.idea && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="text-xs font-medium text-red-500">{fieldErrors.idea}</span>
          </div>
        )}
      </div>

      {/* Priority */}
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-widest mb-3 font-grotesk">Priority</label>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, priority: PRIORITY_LEVELS.LOW })}
            className={`px-4 py-2 rounded-full transition text-sm font-grotesk flex items-center gap-2 cursor-pointer ${
              formData.priority === PRIORITY_LEVELS.LOW
                ? "bg-green-100/80 text-green-700 border-2 border-green-400"
                : "bg-white/40 backdrop-blur-sm text-gray-600 border-2 border-white/60 hover:bg-white/60"
            }`}
          >
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500"></span>
            Low
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, priority: PRIORITY_LEVELS.MEDIUM })}
            className={`px-4 py-2 rounded-full transition text-sm font-grotesk flex items-center gap-2 cursor-pointer ${
              formData.priority === PRIORITY_LEVELS.MEDIUM
                ? "bg-amber-100/80 text-amber-700 border-2 border-amber-400"
                : "bg-white/40 backdrop-blur-sm text-gray-600 border-2 border-white/60 hover:bg-white/60"
            }`}
          >
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            Medium
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, priority: PRIORITY_LEVELS.HIGH })}
            className={`px-4 py-2 rounded-full transition text-sm font-grotesk flex items-center gap-2 cursor-pointer ${
              formData.priority === PRIORITY_LEVELS.HIGH
                ? "bg-red-100/80 text-red-700 border-2 border-red-400"
                : "bg-white/40 backdrop-blur-sm text-gray-600 border-2 border-white/60 hover:bg-white/60"
            }`}
          >
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500"></span>
            High
          </button>
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading || !formData.idea.trim()}
        className="w-full text-white py-3 rounded-xl font-grotesk font-normal text-lg cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(249,115,22,0.3)] disabled:translate-y-0 disabled:shadow-none disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ea580c 100%)" }}
      >
        {loading ? "Submitting..." : "Submit Request →"}
      </Button>
    </form>
  );
}
