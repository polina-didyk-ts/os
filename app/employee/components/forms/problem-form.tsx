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

    const trimmedWhat        = formData.what.trim();
    const trimmedDescription = formData.description.trim();
    const errors: Record<string, string> = {};
    if (!trimmedWhat) errors.what = "This field is required";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
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
            what:        "This field is required",
            description: "Maximum 1000 characters",
            comment:     "Maximum 500 characters",
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* What */}
      <div>
        <label className="block text-sm font-medium text-gray-900 uppercase mb-2">
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
          className="w-full"
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
        <label className="block text-sm font-medium text-gray-900 uppercase mb-2">
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
          className="w-full"
        />
        <div className={`text-right text-xs mt-1 ${formData.description.length >= 1000 ? "text-red-500 font-medium" : "text-gray-400"}`}>
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
        <label className="block text-sm font-medium text-gray-900 uppercase mb-3">
          Priority
        </label>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, priority: PRIORITY_LEVELS.LOW })}
            className={`px-4 py-2 rounded-full transition text-sm font-medium flex items-center gap-2 ${
              formData.priority === PRIORITY_LEVELS.LOW
                ? "bg-green-100 text-green-700 border-2 border-green-500"
                : "bg-gray-100 text-gray-700 border-2 border-gray-200"
            }`}
          >
            <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
            Low
          </button>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, priority: PRIORITY_LEVELS.MEDIUM })}
            className={`px-4 py-2 rounded-full transition text-sm font-medium flex items-center gap-2 ${
              formData.priority === PRIORITY_LEVELS.MEDIUM
                ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-500"
                : "bg-gray-100 text-gray-700 border-2 border-gray-200"
            }`}
          >
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-500"></span>
            Medium
          </button>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, priority: PRIORITY_LEVELS.HIGH })}
            className={`px-4 py-2 rounded-full transition text-sm font-medium flex items-center gap-2 ${
              formData.priority === PRIORITY_LEVELS.HIGH
                ? "bg-red-100 text-red-700 border-2 border-red-500"
                : "bg-gray-100 text-gray-700 border-2 border-gray-200"
            }`}
          >
            <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
            High
          </button>
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-gray-900 uppercase mb-2">
          Comment <span className="text-gray-500 text-xs font-normal">optional</span>
        </label>
        <Textarea
          placeholder="Any additional information..."
          value={formData.comment}
          maxLength={500}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value.slice(0, 500) })}
          className="w-full"
        />
        <div className={`text-right text-xs mt-1 ${formData.comment.length >= 500 ? "text-red-500 font-medium" : "text-gray-400"}`}>
          {formData.comment.length} / 500
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading || !formData.what.trim()}
        className="w-full bg-[#141414] hover:bg-black text-white py-3 rounded-lg font-semibold text-lg transition"
      >
        {loading ? "Submitting..." : "Submit Request →"}
      </Button>
    </form>
  );
}
