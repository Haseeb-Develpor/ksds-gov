import { useEffect, useRef, useState } from 'react';
import { Camera, ImagePlus, X } from 'lucide-react';

type Props = {
  value: string;
  source: 'upload' | 'camera' | '';
  onChange: (dataUrl: string, source: 'upload' | 'camera') => void;
  onClear: () => void;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export default function IdCapture({ value, source, onChange, onClear }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [camError, setCamError] = useState('');

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  };

  useEffect(() => () => stopCamera(), []);

  const startCamera = async () => {
    setCamError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOn(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      });
    } catch {
      setCamError('Camera permission denied or not available. Allow camera, or upload a photo instead.');
      setCameraOn(false);
    }
  };

  const snap = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onChange(dataUrl, 'camera');
    stopCamera();
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setCamError('Please choose an image file.');
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setCamError('Image must be under 6MB.');
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    onChange(dataUrl, 'upload');
    e.target.value = '';
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 p-3 dark:border-white/10">
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">ID card photo</p>
      <p className="text-xs text-slate-500">Upload a clear photo or allow camera to capture live.</p>

      <div className="flex flex-wrap gap-2">
        <label className="btn-outline cursor-pointer px-3 py-2 text-sm">
          <ImagePlus size={16} /> Upload photo
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>
        {!cameraOn ? (
          <button type="button" onClick={startCamera} className="btn-outline px-3 py-2 text-sm">
            <Camera size={16} /> Live camera
          </button>
        ) : (
          <>
            <button type="button" onClick={snap} className="btn-primary px-3 py-2 text-sm">
              Capture photo
            </button>
            <button type="button" onClick={stopCamera} className="btn-ghost px-3 py-2 text-sm">
              Cancel camera
            </button>
          </>
        )}
      </div>

      {camError && <p className="text-xs text-red-600">{camError}</p>}

      {cameraOn && (
        <div className="overflow-hidden rounded-lg bg-black">
          <video ref={videoRef} playsInline muted className="max-h-56 w-full object-cover" />
        </div>
      )}

      {value && (
        <div className="relative">
          <img src={value} alt="ID preview" className="max-h-56 w-full rounded-lg object-contain bg-slate-50 dark:bg-white/5" />
          <p className="mt-1 text-xs text-slate-500">Source: {source === 'camera' ? 'Live camera' : 'Upload'}</p>
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
            aria-label="Remove photo"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
