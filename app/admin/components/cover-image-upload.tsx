"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";

interface CoverImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function CoverImageUpload({ value, onChange }: CoverImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: form });
      const { url } = await res.json();
      onChange(url);
    } finally {
      setUploading(false);
    }
  };

  if (value) {
    return (
      <div className="relative rounded-xl overflow-hidden group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="Cover" className="w-full h-48 object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute top-2.5 right-2.5 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Remove image"
        >
          <X className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white text-xs font-grotesk rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          Replace
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
    );
  }

  return (
    <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-white/60 rounded-xl bg-white/30 backdrop-blur-sm cursor-pointer hover:bg-white/50 hover:border-amber-300/60 transition-all group">
      {uploading ? (
        <>
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-2" />
          <span className="text-sm text-gray-500 font-grotesk">Uploading…</span>
        </>
      ) : (
        <>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"
            style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)" }}
          >
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm font-grotesk text-gray-700">Click to upload cover image</span>
          <span className="text-xs text-gray-400 font-techstack mt-1">
            PNG, JPG, WebP · Max 10 MB
          </span>
        </>
      )}
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </label>
  );
}
