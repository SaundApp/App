import { Message } from "@/types/prisma/models";
import moment from "moment";
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
      <div className={"chat " + (self ? "chat-end" : "chat-start")}>
        <div
          className={
            "chat-bubble flex items-center gap-3 text-white max-w-72 break-all " +
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

          <div className="block relative w-32 rounded-full h-1 bg-gray-400">
            <span
              className="absolute rounded-full bg-white h-1 left-0 top-0"
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
        <time className="chat-footer muted">
          {moment(message.createdAt).format("hh:mm")}
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
