"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, SwitchCamera, X, Plus, AlertCircle } from "lucide-react";
import { MAX_PHOTOS } from "@/data/reportConstants";

export default function CameraSection({ photos, setPhotos }) {
  const [camState, setCamState] = useState("idle");
  const [camError, setCamError] = useState("");
  const [facing, setFacing] = useState("environment");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startStream = useCallback(async (facingMode) => {
    stopStream();
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (e) {
      const msgs = {
        NotAllowedError:  "Camera access denied. Please allow camera permission.",
        NotFoundError:    "No camera found on this device.",
        NotReadableError: "Camera is in use by another app.",
      };
      setCamError(msgs[e.name] || "Could not access camera.");
      setCamState("error");
    }
  }, []);

  const openCamera = useCallback(async () => {
    if (photos.length >= MAX_PHOTOS) return;
    setCamState("active");
    await startStream(facing);
  }, [photos.length, facing, startStream]);

  const closeCamera = useCallback(() => {
    stopStream();
    setCamState("idle");
  }, []);

  const switchCamera = useCallback(async () => {
    const next = facing === "environment" ? "user" : "environment";
    setFacing(next);
    await startStream(next);
  }, [facing, startStream]);

  const takePhoto = useCallback(() => {
    const vid = videoRef.current;
    const canvas = canvasRef.current;
    if (!vid || !canvas) return;
    canvas.width = vid.videoWidth;
    canvas.height = vid.videoHeight;
    canvas.getContext("2d").drawImage(vid, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPhotos((prev) => {
      const next = [...prev, dataUrl];
      if (next.length >= MAX_PHOTOS) closeCamera();
      return next;
    });
  }, [closeCamera, setPhotos]);

  const deletePhoto = (idx) => setPhotos((prev) => prev.filter((_, i) => i !== idx));

  useEffect(() => () => stopStream(), []);

  const remaining = MAX_PHOTOS - photos.length;

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {camState === "idle" && photos.length === 0 && (
        <div className="flex items-center justify-between px-4 py-3.5 bg-gray-50">
          <div className="flex items-center gap-3">
            <Camera size={22} className="text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Take a photo of the issue</p>
              <p className="text-xs text-gray-400 mt-0.5">Up to {MAX_PHOTOS} photos — camera only</p>
            </div>
          </div>
          <button onClick={openCamera} className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 transition">
            <Camera size={14} /> Open camera
          </button>
        </div>
      )}

      {camState === "active" && (
        <div className="bg-black">
          <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-64 object-cover block" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-900">
            <button onClick={switchCamera} className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-white transition" aria-label="Switch camera">
              <SwitchCamera size={20} />
              <span className="text-[10px]">Flip</span>
            </button>
            <button onClick={takePhoto} className="w-14 h-14 rounded-full bg-white border-4 border-gray-400 flex items-center justify-center hover:scale-95 transition" aria-label="Take photo">
              <Camera size={22} className="text-gray-800" />
            </button>
            <button onClick={closeCamera} className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-white transition" aria-label="Close camera">
              <X size={20} />
              <span className="text-[10px]">Close</span>
            </button>
          </div>
        </div>
      )}

      {camState === "error" && (
        <div className="flex items-center gap-3 px-4 py-3.5 bg-red-50">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <span className="text-xs text-red-700 flex-1">{camError}</span>
          <button onClick={openCamera} className="text-xs px-2.5 py-1 rounded-lg border border-red-300 bg-white text-red-600">Retry</button>
        </div>
      )}

      {photos.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-3 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">{photos.length} photo{photos.length !== 1 ? "s" : ""} taken</span>
            {remaining > 0
              ? <span className="text-xs text-gray-400">{remaining} more allowed</span>
              : <span className="text-xs text-orange-500 font-medium">Maximum reached</span>
            }
          </div>
          <div className="flex gap-2 flex-wrap">
            {photos.map((src, i) => (
              <div key={i} className="relative w-[72px] h-[72px]">
                <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover rounded-lg border border-gray-200" />
                <button onClick={() => deletePhoto(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center" aria-label={`Delete photo ${i + 1}`}>
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
            {remaining > 0 && (
              <button onClick={openCamera} className="w-[72px] h-[72px] rounded-lg border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-1 text-gray-400 hover:bg-gray-100 transition" aria-label="Add more photos">
                <Plus size={20} />
                <span className="text-[10px]">Add more</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
