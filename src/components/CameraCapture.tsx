'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { processAndWatermarkImage, WatermarkData } from '@/lib/watermark';

interface CameraCaptureProps {
  watermarkData: WatermarkData;
  onCaptured: (watermarkedBase64: string) => void;
  onCancel?: () => void;
}

export default function CameraCapture({ watermarkData, onCaptured, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function initCamera() {
      try {
        setErrorMsg(null);
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const s = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: facingMode,
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
          activeStream = s;
          setStream(s);
          setHasPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        } else {
          setHasPermission(false);
          setErrorMsg('Kamera tidak disokong oleh pelayar ini.');
        }
      } catch (err: any) {
        console.warn('Camera access denied or unavailable:', err);
        setHasPermission(false);
        setErrorMsg('Sila benarkan akses kamera hadapan pada peranti anda.');
      }
    }

    initCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const handleCapture = async () => {
    if (!videoRef.current) return;
    setIsProcessing(true);
    try {
      const watermarked = await processAndWatermarkImage(videoRef.current, watermarkData);
      setPreviewImage(watermarked);
    } catch (err: any) {
      console.error('Error watermarking image:', err);
      setErrorMsg('Gagal memproses gambar: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Fallback simulator for desktop/test environments without physical webcam
  const handleSimulateCapture = async () => {
    setIsProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw simulated security guard avatar silhouette
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, 640, 480);
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(320, 200, 100, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(320, 420, 160, 120, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SIMULASI SWAFOTO PENGAWAL', 320, 50);
      }

      const img = new Image();
      img.src = canvas.toDataURL('image/jpeg');
      await new Promise((r) => (img.onload = r));

      const watermarked = await processAndWatermarkImage(img, watermarkData);
      setPreviewImage(watermarked);
    } catch (err: any) {
      setErrorMsg('Ralat simulasi: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmPhoto = () => {
    if (previewImage) {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      onCaptured(previewImage);
    }
  };

  const retakePhoto = () => {
    setPreviewImage(null);
  };

  const switchCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between">
      {/* Top Header */}
      <div className="p-4 bg-slate-900/90 backdrop-blur-md flex items-center justify-between text-white border-b border-slate-800">
        <div>
          <h3 className="font-bold text-base flex items-center gap-2">
            <Camera className="w-5 h-5 text-sky-400" />
            Pengesahan Swafoto Langsung
          </h3>
          <p className="text-xs text-slate-400">Posisikan muka anda di dalam bulatan panduan</p>
        </div>
        {onCancel && (
          <button
            onClick={() => {
              if (stream) stream.getTracks().forEach((t) => t.stop());
              onCancel();
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
          >
            Batal
          </button>
        )}
      </div>

      {/* Camera Viewport / Preview */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-slate-950">
        {previewImage ? (
          // Watermarked Preview View
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
            <img
              src={previewImage}
              alt="Swafoto Pengesahan"
              className="max-h-[75vh] w-auto rounded-2xl shadow-2xl border-2 border-emerald-500/50 object-contain"
            />
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-emerald-500/90 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur">
              <CheckCircle className="w-3.5 h-3.5" />
              Tera air masa nyata berjaya ditambah!
            </div>
          </div>
        ) : hasPermission === false ? (
          // No Camera Permission / Fallback View
          <div className="text-center p-6 max-w-sm text-slate-300">
            <AlertCircle className="w-14 h-14 mx-auto text-amber-400 mb-3" />
            <h4 className="text-lg font-bold text-white mb-2">Akses Kamera Diperlukan</h4>
            <p className="text-xs text-slate-400 mb-5">{errorMsg || 'Sila benarkan akses kamera untuk pengesahan wajah.'}</p>
            <button
              onClick={handleSimulateCapture}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition"
            >
              <Sparkles className="w-4 h-4" />
              Gunakan Simulasi Swafoto (Mod Ujian)
            </button>
          </div>
        ) : (
          // Active Live Camera Feed
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
              style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
            />

            {/* Circular Face Guide Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-64 h-80 sm:w-72 sm:h-96 border-4 border-dashed border-sky-400/80 rounded-[50%] shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] animate-pulse flex items-center justify-center">
                <span className="text-xs text-white/90 bg-slate-900/80 px-3 py-1 rounded-full backdrop-blur-md mb-auto mt-4 font-medium">
                  Bulatan Panduan Wajah
                </span>
              </div>
            </div>

            {/* Switch Camera Button (if device has multiple) */}
            <button
              onClick={switchCamera}
              className="absolute top-4 right-4 p-3 rounded-full bg-slate-900/70 text-white backdrop-blur-md border border-slate-700/60 active:scale-95 transition"
              title="Tukar Kamera"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Action Controls */}
      <div className="p-5 bg-slate-900/95 border-t border-slate-800 flex items-center justify-center gap-4">
        {previewImage ? (
          <>
            <button
              onClick={retakePhoto}
              className="flex-1 py-3.5 px-4 rounded-xl bg-slate-800 text-slate-200 font-semibold text-sm hover:bg-slate-700 active:scale-95 transition"
            >
              Tangkap Semula
            </button>
            <button
              onClick={confirmPhoto}
              className="flex-1 py-3.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 shadow-lg shadow-emerald-900/40 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Gunakan Swafoto Ini
            </button>
          </>
        ) : (
          <div className="flex items-center gap-6">
            <button
              onClick={handleSimulateCapture}
              className="text-xs text-slate-400 underline hover:text-slate-200"
            >
              Simulasi Ujian
            </button>

            {/* Giant Circular Shutter Button */}
            <button
              onClick={handleCapture}
              disabled={isProcessing || hasPermission === false}
              className="w-20 h-20 rounded-full border-4 border-white p-1.5 active:scale-90 transition disabled:opacity-50"
            >
              <div className="w-full h-full rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center shadow-lg">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
