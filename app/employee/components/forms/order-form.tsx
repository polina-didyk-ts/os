"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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

    const trimmedWhat = formData.what.trim();
    const rawQty = formData.quantity;
    const qty = Number(rawQty);
    const errors: Record<string, string> = {};

    if (!trimmedWhat) errors.what = "This field is required";

    if (!rawQty || rawQty.trim() === "") {
      errors.quantity = "Please enter a quantity";
    } else if (isNaN(qty)) {
      errors.quantity = "Please enter a quantity";
    } else if (!Number.isInteger(qty)) {
      errors.quantity = "Quantity must be a whole number";
    } else if (qty < 1) {
      errors.quantity = "Quantity must be at least 1";
    } else if (qty > 100) {
      errors.quantity = "Quantity cannot be greater than 100";
    }

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
          type: "order",
          what: trimmedWhat,
          quantity: qty,
          priority: formData.priority,
          comment: formData.comment.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === "VALIDATION_ERROR" && Array.isArray(errorData.details)) {
          const MESSAGES: Record<string, string> = {
            what: "This field is required",
            quantity: "Please enter a valid quantity",
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
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* What */}
      <div>
        <label className="block text-sm text-gray-900 uppercase mb-2 font-grotesk">
          What to order?
        </label>
        <Input
          type="text"
          placeholder="E.g. Whiteboard markers"
          value={formData.what}
          maxLength={255}
          onChange={(e) => {
            setFormData({ ...formData, what: e.target.value });
            if (fieldErrors.what) setFieldErrors({ ...fieldErrors, what: "" });
          }}
          className="w-full bg-[#FAF8F5] border-gray-200"
        />
        {fieldErrors.what && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="text-xs font-medium text-red-500">{fieldErrors.what}</span>
          </div>
        )}
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-sm text-gray-900 uppercase mb-2 font-grotesk">Quantity</label>
        <Input
          type="number"
          value={formData.quantity}
          onChange={(e) => {
            setFormData({ ...formData, quantity: e.target.value });
            if (fieldErrors.quantity) setFieldErrors({ ...fieldErrors, quantity: "" });
          }}
          className={`w-full bg-[#FAF8F5] ${fieldErrors.quantity ? "border-red-400 focus-visible:ring-red-400" : "border-gray-200"}`}
        />
        {fieldErrors.quantity && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="text-xs font-medium text-red-500">{fieldErrors.quantity}</span>
          </div>
        )}
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm text-gray-900 uppercase mb-3 font-grotesk">Priority</label>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, priority: PRIORITY_LEVELS.LOW })}
            className={`px-4 py-2 rounded-full transition text-sm font-grotesk flex items-center gap-2 ${
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
            className={`px-4 py-2 rounded-full transition text-sm font-grotesk flex items-center gap-2 ${
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
            className={`px-4 py-2 rounded-full transition text-sm font-grotesk flex items-center gap-2 ${
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
        <label className="block text-sm text-gray-900 uppercase mb-2 font-grotesk">
          Reason / Comment
        </label>
        <Textarea
          placeholder="Please specify color or model if relevant..."
          value={formData.comment}
          maxLength={500}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value.slice(0, 500) })}
          className="w-full bg-gray-50 border-gray-200 min-h-24"
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
        disabled={loading || !formData.what.trim() || !formData.quantity}
        className="w-full bg-[#141414] hover:bg-black text-white py-3 rounded-lg font-grotesk font-normal text-lg cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(20,20,20,0.12),0_2px_6px_rgba(20,20,20,0.08)] disabled:translate-y-0 disabled:shadow-none"
      >
        {loading ? "Submitting..." : "Submit Request →"}
      </Button>
    </form>
  );
}
