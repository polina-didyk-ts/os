"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { PRIORITY_LEVELS } from "@/src/modules/requests/requests.dto";

interface ProblemFormProps {
  onSuccess: (ticketNumber: string) => void;
}

export function ProblemForm({ onSuccess }: ProblemFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [shaking, setShaking] = useState(false);
  const [formData, setFormData] = useState<{
    what: string;
    description: string;
    priority: string;
    comment: string;
  }>({
    what: "",
    description: "",
    priority: "medium",
    comment: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedWhat = formData.what.trim();
    const trimmedDescription = formData.description.trim();
    const errors: Record<string, string> = {};
    if (!trimmedWhat) errors.what = "This field is required";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
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
          type: "problem",
          what: trimmedWhat,
          description: trimmedDescription || undefined,
          priority: formData.priority,
          comment: formData.comment.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === "VALIDATION_ERROR" && Array.isArray(errorData.details)) {
          const MESSAGES: Record<string, string> = {
            what: "This field is required",
            description: "Maximum 1000 characters",
            comment: "Maximum 500 characters",
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

      {/* What */}
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2 font-grotesk">
          What is the problem?
        </label>
        <Input
          type="text"
          placeholder="E.g. conditioner is not working"
          value={formData.what}
          maxLength={255}
          onChange={(e) => {
            setFormData({ ...formData, what: e.target.value });
            if (fieldErrors.what) setFieldErrors({ ...fieldErrors, what: "" });
          }}
          className="w-full bg-white/50 backdrop-blur-sm border-white/60 focus-visible:ring-amber-400/50"
        />
        {fieldErrors.what && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="text-xs font-medium text-red-500">{fieldErrors.what}</span>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2 font-grotesk">
          Problem Description
        </label>
        <Textarea
          placeholder="Describe in detail..."
          value={formData.description}
          maxLength={1000}
          onChange={(e) => {
            setFormData({ ...formData, description: e.target.value.slice(0, 1000) });
            if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: "" });
          }}
          className="w-full bg-white/50 backdrop-blur-sm border-white/60 focus-visible:ring-amber-400/50"
        />
        <div
          className={`text-right text-xs mt-1 ${formData.description.length >= 1000 ? "text-red-500 font-medium" : "text-gray-400"}`}
        >
          {formData.description.length} / 1000
        </div>
        {fieldErrors.description && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="text-xs font-medium text-red-500">{fieldErrors.description}</span>
          </div>
        )}
      </div>

      {/* Priority */}
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-widest mb-3 font-grotesk">
          Priority
        </label>
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

      {/* Comment */}
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2 font-grotesk">
          Comment{" "}
          <span className="text-gray-400 text-xs font-normal normal-case tracking-normal">
            optional
          </span>
        </label>
        <Textarea
          placeholder="Any additional information..."
          value={formData.comment}
          maxLength={500}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value.slice(0, 500) })}
          className="w-full bg-white/50 backdrop-blur-sm border-white/60 focus-visible:ring-amber-400/50"
        />
        <div
          className={`text-right text-xs mt-1 ${formData.comment.length >= 500 ? "text-red-500 font-medium" : "text-gray-400"}`}
        >
          {formData.comment.length} / 500
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading || !formData.what.trim()}
        className="w-full text-white py-3 rounded-xl font-grotesk font-normal text-lg cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(249,115,22,0.3)] disabled:translate-y-0 disabled:shadow-none disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ea580c 100%)" }}
      >
        {loading ? "Submitting..." : "Submit Request →"}
      </Button>
    </form>
  );
}
