"use client";

import { useState } from "react";
import { Images, X, ChevronLeft, ChevronRight, ZoomIn, Droplets, AlertTriangle, MapPin } from "lucide-react";

export default function LocationImages({ images, locationName, location }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!images || images.length === 0) return null;

  const closeLightbox = () => setLightboxIndex(null);
  const prev = (e) => {
    e.stopPropagation();
    setLightboxIndex((i) => (i - 1 + images.length) % images.length);
  };
  const next = (e) => {
    e.stopPropagation();
    setLightboxIndex((i) => (i + 1) % images.length);
  };

  const [first, ...rest] = images;

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Images className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-900">Location Photos</span>
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {images.length} photo{images.length !== 1 ? "s" : ""}
          </span>
        </div>

        {locationName && (
          <p className="text-xs text-gray-500 px-4 pt-2">{locationName}</p>
        )}

        {/* Featured first image */}
        <div className="px-4 pt-3">
          <button
            onClick={() => setLightboxIndex(0)}
            className="relative group w-full aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
          >
            <img
              src={first.image_url}
              alt={first.caption || "Location photo"}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
            </div>
            {first.image_type && first.image_type !== "general" && (
              <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/50 text-white capitalize backdrop-blur-sm">
                {first.image_type}
              </span>
            )}
            {first.caption && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                <p className="text-white text-xs truncate">{first.caption}</p>
              </div>
            )}
          </button>
        </div>

        {/* Thumbnail strip for remaining images */}
        {rest.length > 0 && (
          <div className="px-4 pt-2 pb-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {rest.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setLightboxIndex(i + 1)}
                  className="relative group shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
                >
                  <img
                    src={img.image_url}
                    alt={img.caption || `Photo ${i + 2}`}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {rest.length === 0 && <div className="pb-2" />}

        {/* Location meta info — fills the gap below the image */}
        <div className="border-t border-gray-100 px-4 py-3 flex flex-wrap gap-3">
          {location?.type && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-600 capitalize">{location.type}</span>
            </div>
          )}
          {location?.water_access !== undefined && (
            <div className="flex items-center gap-1.5">
              <Droplets className={`w-3.5 h-3.5 ${location.water_access ? "text-blue-400" : "text-gray-300"}`} />
              <span className="text-xs text-gray-600">
                Water access: <span className={location.water_access ? "text-blue-600 font-medium" : "text-gray-400"}>{location.water_access ? "Yes" : "No"}</span>
              </span>
            </div>
          )}
          {location?.climate_risk && (
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-gray-600 capitalize">
                Climate risk: <span className="text-amber-600 font-medium">{location.climate_risk}</span>
              </span>
            </div>
          )}
          {location?.status && (
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${location.status === "operational" ? "bg-emerald-400" : "bg-red-400"}`} />
              <span className="text-xs text-gray-600 capitalize">{location.status}</span>
            </div>
          )}
          {!location?.type && !location?.climate_risk && (
            <p className="text-xs text-gray-400">Photos from this location</p>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Top bar */}
          <div className="absolute top-0 inset-x-0 flex items-center justify-between px-5 py-4 bg-gradient-to-b from-black/60 to-transparent">
            <div>
              {images[lightboxIndex].caption && (
                <p className="text-white text-sm font-medium">
                  {images[lightboxIndex].caption}
                </p>
              )}
              {locationName && (
                <p className="text-white/50 text-xs mt-0.5">{locationName}</p>
              )}
            </div>
            <button
              onClick={closeLightbox}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Main image */}
          <div
            className="w-full max-w-4xl px-16 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightboxIndex].image_url}
              alt={images[lightboxIndex].caption || `Photo ${lightboxIndex + 1}`}
              className="max-h-[75vh] w-full object-contain rounded-xl shadow-2xl"
            />
          </div>

          {/* Prev / Next */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Bottom thumbnail strip */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-4">
            <div className="flex items-center justify-center gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition ${
                    i === lightboxIndex
                      ? "border-white scale-110"
                      : "border-white/20 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt={`Thumb ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            <p className="text-white/40 text-xs text-center mt-2">
              {lightboxIndex + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
