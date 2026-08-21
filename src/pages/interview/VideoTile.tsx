/**
 * VideoTile — renders a MediaStream into a <video> element.
 * Handles stream reference changes and srcObject updates correctly.
 */
import { useEffect, useRef } from "react";
import { MicOff, VideoOff } from "lucide-react";

interface VideoTileProps {
  stream: MediaStream | null;
  label?: string;
  muted?: boolean;
  micOn?: boolean;
  camOn?: boolean;
  className?: string;
  mirror?: boolean;
}

export default function VideoTile({
  stream,
  label,
  muted = false,
  micOn = true,
  camOn = true,
  className = "",
  mirror = false,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Update srcObject whenever the stream changes (including null → stream transitions)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.srcObject !== stream) {
      video.srcObject = stream;
      if (stream) {
        // Ensure playback starts — browsers may pause on srcObject change
        video.play().catch(() => {/* autoplay policy — user gesture needed */});
      }
    }
  });  // runs every render intentionally — cheap check, ensures sync

  const hasVideo = !!stream && camOn;

  return (
    <div
      className={`relative bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center ${className}`}
    >
      {/* Video element always in DOM so srcObject assignment works reliably */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          hasVideo ? "opacity-100" : "opacity-0 absolute"
        } ${mirror ? "scale-x-[-1]" : ""}`}
      />

      {/* Camera-off placeholder */}
      {!hasVideo && (
        <div className="flex flex-col items-center gap-2 text-zinc-500 select-none">
          <VideoOff className="h-8 w-8" />
          <span className="text-xs">{stream ? "Camera off" : "No video"}</span>
        </div>
      )}

      {/* Label + mic indicator */}
      {label && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent px-2.5 py-2 flex items-center gap-1.5 pointer-events-none">
          <span className="text-white text-xs font-medium truncate flex-1">{label}</span>
          {!micOn && <MicOff className="h-3 w-3 text-red-400 shrink-0" />}
        </div>
      )}
    </div>
  );
}
