import { useDate } from "@/lib/dates";
import type { Message } from "@repo/backend-common/types";
import { useEffect, useRef, useState } from "react";
import { FaCirclePause, FaCirclePlay } from "react-icons/fa6";

export default function AudioPlayer({
  src,
  message,
}: {
  src: string;
  message: Message;
}) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const { format } = useDate();

  useEffect(() => {
    if (!ref.current) return;

    if (playing) {
      ref.current.play();
    } else {
      ref.current.pause();
    }
  }, [playing]);

  return (
    <div>
      <div
        className={
          "daisy-chat " + (self ? "daisy-chat-end" : "daisy-chat-start")
        }
      >
        <div
          className={
            "daisy-chat-bubble flex max-w-72 items-center gap-3 break-words text-white " +
            (self ? "bg-primary" : "bg-secondary")
          }
        >
          <button onClick={() => setPlaying(!playing)}>
            {playing ? (
              <FaCirclePause fontSize={25} />
            ) : (
              <FaCirclePlay fontSize={25} />
            )}
          </button>

          <div className="relative block h-1 w-32 rounded-full bg-gray-400">
            <span
              className="absolute left-0 top-0 h-1 rounded-full bg-white"
              style={{
                width:
                  ((ref.current?.currentTime || 0) /
                    (ref.current?.duration || 1)) *
                    100 +
                  "%",
              }}
            ></span>
          </div>
        </div>
        <time className="muted daisy-chat-footer">
          {format(message.createdAt, "kk:mm")}
        </time>
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
