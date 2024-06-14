import { useEffect, useRef, useState } from "react";
import { FaCirclePause, FaCirclePlay } from "react-icons/fa6";

export default function AudioPlayer({ src }: { src: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    if (playing) {
      ref.current.play();
    } else {
      ref.current.pause();
    }
  }, [playing]);

  return (
    <div className="bg-secondary rounded-md w-full p-3 flex items-center gap-3">
      <button onClick={() => setPlaying(!playing)}>
        {playing ? (
          <FaCirclePause fontSize={25} />
        ) : (
          <FaCirclePlay fontSize={25} />
        )}
      </button>

      <div className="block relative w-32 rounded-full h-1 bg-gray-400">
        <span
          className="absolute rounded-full bg-primary h-1 left-0 top-0"
          style={{
            width:
              ((ref.current?.currentTime || 0) / (ref.current?.duration || 1)) *
                100 +
              "%",
          }}
        ></span>
      </div>

      <audio
        hidden
        ref={ref}
        onPause={() => {
          setPlaying(false);
        }}
      >
        <source src={src} />
      </audio>
    </div>
  );
}
