"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { PRIORITY_LEVELS } from "@/src/modules/requests/requests.dto";

interface OrderFormProps {
  onSuccess: (ticketNumber: string) => void;
}

export function OrderForm({ onSuccess }: OrderFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<{
    what: string;
    quantity: string;
    priority: string;
    comment: string;
  }>({
    what: "",
    quantity: "1",
    priority: "medium",
    comment: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "order",
          what: formData.what,
          quantity: parseInt(formData.quantity, 10),
          priority: formData.priority,
          comment: formData.comment || undefined,
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

      {/* What */}
      <div>
        <label className="block text-sm font-medium text-gray-900 uppercase mb-2">
          What to order?
        </label>
        <Input
          type="text"
          placeholder="E.g. Whiteboard markers"
          value={formData.what}
          onChange={(e) => setFormData({ ...formData, what: e.target.value })}
          required
          className="w-full bg-gray-50 border-gray-200"
        />
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-gray-900 uppercase mb-2">
          Quantity
        </label>
        <Input
          type="number"
          min="1"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          required
          className="w-full bg-gray-50 border-gray-200"
        />
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
          Reason / Comment
        </label>
        <Textarea
          placeholder="Please specify color or model if relevant..."
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          className="w-full bg-gray-50 border-gray-200 min-h-24"
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading || !formData.what}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-lg transition"
      >
        {loading ? "Submitting..." : "Submit Request →"}
      </Button>
    </form>
  );
}
