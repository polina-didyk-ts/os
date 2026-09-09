"use client";

import { useState } from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
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
  const [shaking, setShaking] = useState(false);
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
      noValidate
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
          className="w-full bg-white/50 backdrop-blur-sm border-white/60 focus-visible:ring-amber-400/50"
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
        <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2 font-grotesk">
          Quantity
        </label>
        <Input
          type="number"
          value={formData.quantity}
          onChange={(e) => {
            setFormData({ ...formData, quantity: e.target.value });
            if (fieldErrors.quantity) setFieldErrors({ ...fieldErrors, quantity: "" });
          }}
          className={`w-full bg-white/50 backdrop-blur-sm ${fieldErrors.quantity ? "border-red-400 focus-visible:ring-red-400" : "border-white/60 focus-visible:ring-amber-400/50"}`}
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
        <label className="block text-xs text-gray-500 uppercase tracking-widest mb-3 font-grotesk">
          Priority
        </label>
        <div className="flex gap-2 flex-wrap">
          {(
            [
              { level: PRIORITY_LEVELS.LOW,    label: "Low",    dot: "bg-green-500",  ring: "74,222,128" },
              { level: PRIORITY_LEVELS.MEDIUM, label: "Medium", dot: "bg-amber-400",  ring: "251,191,36" },
              { level: PRIORITY_LEVELS.HIGH,   label: "High",   dot: "bg-red-500",    ring: "239,68,68"  },
            ] as const
          ).map(({ level, label, dot, ring }) => {
            const active = formData.priority === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setFormData({ ...formData, priority: level })}
                className="px-4 py-2 rounded-full text-sm font-grotesk flex items-center gap-2 cursor-pointer transition-all duration-200 active:scale-95"
                style={{
                  background: "linear-gradient(160deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.11) 55%, rgba(255,255,255,0.06) 100%)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  border: "1px solid rgba(255,255,255,0.70)",
                  boxShadow: [
                    active ? `0 0 0 1.5px rgba(${ring},0.55)` : "0 0 0 0.5px rgba(0,0,0,0.10)",
                    "0 2px 8px rgba(0,0,0,0.09)",
                    "0 1px 2px rgba(0,0,0,0.06)",
                    "inset 0 1.5px 0 rgba(255,255,255,0.88)",
                    "inset 1.5px 0 0 rgba(255,255,255,0.30)",
                    "inset -1.5px 0 0 rgba(255,255,255,0.20)",
                    "inset 0 -1px 0 rgba(0,0,0,0.07)",
                  ].join(", "),
                }}
              >
                <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
                <span className={active ? "text-gray-900" : "text-gray-500"}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2 font-grotesk">
          Reason / Comment
        </label>
        <Textarea
          placeholder="Please specify color or model if relevant..."
          value={formData.comment}
          maxLength={500}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value.slice(0, 500) })}
          className="w-full bg-white/50 backdrop-blur-sm border-white/60 focus-visible:ring-amber-400/50 min-h-24"
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
        className="w-full text-white py-3 rounded-xl font-grotesk font-normal text-lg cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(249,115,22,0.3)] disabled:translate-y-0 disabled:shadow-none disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ea580c 100%)" }}
      >
        {loading ? "Submitting..." : <span className="flex items-center justify-center gap-1.5">Submit Request <ArrowRight className="w-4 h-4" /></span>}
      </Button>
    </form>
  );
}
