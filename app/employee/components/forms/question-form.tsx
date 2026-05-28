"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { PRIORITY_LEVELS } from "@/src/modules/requests/requests.dto";

interface QuestionFormProps {
  onSuccess: (ticketNumber: string) => void;
}

export function QuestionForm({ onSuccess }: QuestionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<{
    question: string;
    priority: string;
  }>({
    question: "",
    priority: "medium",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedQuestion = formData.question.trim();
    if (!trimmedQuestion) {
      setFieldErrors({ question: "Please enter your question" });
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "question",
          question: trimmedQuestion,
          priority: formData.priority,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create request");
      }

      const data = await response.json();
      onSuccess(data.ticketNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Question */}
      <div>
        <label className="block text-sm font-medium text-gray-900 uppercase mb-2">
          Your question
        </label>
        <Textarea
          placeholder="Write your question here..."
          value={formData.question}
          onChange={(e) => {
            setFormData({ ...formData, question: e.target.value });
            if (fieldErrors.question) setFieldErrors({ ...fieldErrors, question: "" });
          }}
          rows={8}
          className="w-full"
        />
        {fieldErrors.question && (
          <p className="text-red-500 text-xs mt-1">{fieldErrors.question}</p>
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

      {/* Note About Response Time */}
      <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">
        We usually respond within 24 hours
      </p>

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading || !formData.question.trim()}
        className="w-full bg-[#141414] hover:bg-black text-white py-3 rounded-lg font-semibold text-lg transition"
      >
        {loading ? "Submitting..." : "Submit Request →"}
      </Button>
    </form>
  );
}
