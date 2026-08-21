/**
 * VideoTile — renders a MediaStream into a <video> element.
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

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`relative bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center ${className}`}>
      {stream && camOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className={`w-full h-full object-cover ${mirror ? "scale-x-[-1]" : ""}`}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-zinc-500">
          <VideoOff className="h-8 w-8" />
          <span className="text-xs">Camera off</span>
        </div>
      )}

      {/* Label bar */}
      {label && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 py-1.5 flex items-center gap-1.5">
          <span className="text-white text-xs font-medium truncate flex-1">{label}</span>
          {!micOn && <MicOff className="h-3 w-3 text-red-400 shrink-0" />}
        </div>
      )}
    </div>
  );
}
