"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const prev = (e) => { e.stopPropagation(); setIdx((i) => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setIdx((i) => (i + 1) % images.length); };

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center" onClick={onClose}>
      <div className="absolute top-0 inset-x-0 flex items-center justify-between px-5 py-4 bg-gradient-to-b from-black/60 to-transparent">
        <div>
          {images[idx].caption && <p className="text-white text-sm font-medium">{images[idx].caption}</p>}
          <p className="text-white/40 text-xs mt-0.5">{idx + 1} / {images.length}</p>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center">
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="w-full max-w-4xl px-16 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <img src={images[idx].image_url} alt={images[idx].caption || `Photo ${idx + 1}`}
          className="max-h-[75vh] w-full object-contain rounded-xl shadow-2xl" />
      </div>

      {images.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center">
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-4">
        <div className="flex items-center justify-center gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button key={img.id} onClick={(e) => { e.stopPropagation(); setIdx(i); }}
              className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition ${i === idx ? "border-white scale-110" : "border-white/20 opacity-60 hover:opacity-100"}`}>
              <img src={img.image_url} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
