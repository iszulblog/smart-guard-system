'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle, AlertCircle, SwitchCamera, X } from 'lucide-react';
import { processAndWatermarkImage, WatermarkData } from '@/lib/watermark';

interface CameraCaptureProps {
  watermarkData: WatermarkData;
  initialFacingMode?: 'user' | 'environment';
  onCaptured: (watermarkedBase64: string) => void;
  onCancel?: () => void;
  title?: string;
}

export default function CameraCapture({
  watermarkData,
  initialFacingMode = 'user',
  onCaptured,
  onCancel,
  title = 'Security Verification Camera',
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(initialFacingMode);
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
          setErrorMsg('Camera API is not supported on this browser.');
        }
      } catch (err: any) {
        console.warn('Camera access denied or unavailable:', err);
        setHasPermission(false);
        setErrorMsg('Please allow camera permissions in your device/browser settings.');
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
      setErrorMsg('Failed to process image: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    setPreviewImage(null);
    setErrorMsg(null);
  };

  const handleConfirm = () => {
    if (previewImage) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      onCaptured(previewImage);
    }
  };

  const toggleCameraFacing = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">{title}</h3>
              <p className="text-[10px] text-slate-500">Live timestamp & GPS watermark overlay</p>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Video or Preview Area */}
        <div className="relative bg-black aspect-[3/4] flex items-center justify-center overflow-hidden">
          {previewImage ? (
            <img src={previewImage} alt="Captured verification" className="w-full h-full object-cover" />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Viewfinder Target Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-48 h-48 border-2 border-dashed border-white/50 rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-sky-400"></div>
                </div>
                <p className="text-[11px] font-semibold text-white/90 bg-black/60 px-3 py-1 rounded-full mt-3 backdrop-blur-sm">
                  Align face / inspection target within circle
                </p>
              </div>

              {/* Switch Camera Button */}
              <button
                type="button"
                onClick={toggleCameraFacing}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm shadow transition"
                title="Switch Camera"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            </>
          )}

          {errorMsg && (
            <div className="absolute bottom-3 left-3 right-3 bg-rose-600/95 text-white p-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Controls Footer */}
        <div className="p-4 bg-white border-t border-slate-100">
          {previewImage ? (
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={handleRetake}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retake
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Confirm & Submit
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleCapture}
                disabled={isProcessing || hasPermission === false}
                className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                {isProcessing ? 'Watermarking...' : 'Take Verification Photo'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
