"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { X } from "lucide-react";

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  max?: number;
}

export function TagsInput({ value, onChange, max = 10 }: TagsInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (raw: string) => {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, "-").slice(0, 50);
    if (!tag || value.includes(tag) || value.length >= max) return;
    onChange([...value, tag]);
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div
      className="flex flex-wrap gap-1.5 items-center min-h-[38px] px-2.5 py-1.5 rounded-md border border-white/60 bg-white/50 backdrop-blur-sm focus-within:ring-1 focus-within:ring-amber-400/50 cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-techstack text-gray-700 border border-white/60"
          style={{ background: "linear-gradient(135deg, #fef3c7, #fed7aa)" }}
        >
          #{tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(tag);
            }}
            className="text-gray-500 hover:text-gray-800 transition cursor-pointer"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </span>
      ))}
      {value.length < max && (
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => addTag(input)}
          placeholder={value.length === 0 ? "Add tags… (Enter or comma to confirm)" : ""}
          className="flex-1 min-w-[120px] text-sm font-techstack text-gray-700 bg-transparent outline-none placeholder:text-gray-400"
        />
      )}
      {value.length >= max && (
        <span className="text-xs text-gray-400 font-techstack ml-1">max {max} tags</span>
      )}
    </div>
  );
}
