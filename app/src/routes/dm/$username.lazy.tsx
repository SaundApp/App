import Message from "@/components/dm/Message";
import { Textarea } from "@/components/ui/textarea";
import { axiosClient } from "@/lib/axios";
import { Message as MessageType, User } from "@/types/prisma/models";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAudioRecorder } from "react-audio-voice-recorder";
import { useTranslation } from "react-i18next";
import { FaCamera, FaChevronLeft } from "react-icons/fa";
import VoiceRecorder from "../../components/dm/VoiceRecorder";

export const Route = createLazyFileRoute("/dm/$username")({
  component: Chat,
});

function Chat() {
  const { t } = useTranslation();
  const { text, submit } = Route.useSearch<{
    text: string | undefined;
    submit: boolean;
  }>();
  const navigate = Route.useNavigate();
  const [message, setMessage] = useState(
    !text?.startsWith(import.meta.env.VITE_APP_URL) ? text : "" || ""
  );
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [replying, setReplying] = useState<string | null>(null);
  const { username } = Route.useParams();
  const image = useRef<HTMLInputElement>(null);
  const { data } = useQuery<MessageType[]>({
    queryKey: ["dm", username],
    queryFn: async () =>
      axiosClient.get(`/dm/${username}`).then((res) => res.data),
  });
  const { data: user } = useQuery<User>({
    queryKey: ["user", username],
    queryFn: async () =>
      axiosClient.get(`/users/${username}`).then((res) => res.data),
  });
  const recorderControls = useAudioRecorder();

  useEffect(() => {
    const timeout = setTimeout(() => {
      const webSocket = new WebSocket(
        `ws://localhost:8000/dm/${username}/ws?token=${localStorage.getItem("token")}`
      );

      webSocket.onopen = () => {
        if (
          submit &&
          text &&
          text.startsWith(`${import.meta.env.VITE_APP_URL}/?post=`)
        ) {
          webSocket?.send("+" + text);
          setMessage("");
          navigate({ search: "" });
        }
      };

      webSocket.onmessage = (event) => {
        const action = event.data[0];
        const message = event.data.slice(1);

        switch (action) {
          case "+":
            setMessages((prev) => [JSON.parse(message), ...prev]);
            break;
          case "-":
            setMessages((prev) => prev.filter((msg) => msg.id !== message));
            break;
          case "!":
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === message.slice(0, 24)
                  ? { ...msg, text: message.slice(24) }
                  : msg
              )
            );
            break;
        }
      };

      setWebSocket(webSocket);
    }, 200);

    return () => {
      clearTimeout(timeout);
      webSocket?.close();
      setWebSocket(null);
    };
  }, [username]);

  useEffect(() => {
    setMessages(data || []);
  }, [data]);

  useEffect(() => {
    if (editing) {
      setMessage(messages.find((msg) => msg.id === editing)?.text || "");
    }
  }, [editing]);

  const handleSubmit = () => {
    if (!message || !message.length) return;
    if (editing) webSocket?.send(`!${editing}${message}`);
    if (replying) webSocket?.send("@" + replying + message);
    else webSocket?.send("+" + message);

    setMessage("");
    setEditing(null);
    setReplying(null);
  };

  return (
    <div
      className="flex flex-col gap-3 justify-between"
      style={{
        height: "calc(100vh - 4.75rem)",
      }}
    >
      <div className="flex gap-3 items-center">
        <Link to="/dm">
          <FaChevronLeft fontSize={25} />
        </Link>

        <img
          src={user?.avatarId}
          alt={user?.name}
          draggable={false}
          className="w-10 h-10 rounded-full"
        />

        <div>
          <h4 className="max-w-[14rem] text-ellipsis whitespace-nowrap overflow-hidden">
            {user?.name}
          </h4>
          <p className="muted max-w-[14rem] text-ellipsis whitespace-nowrap overflow-hidden">
            @{user?.username}
          </p>
        </div>
      </div>
      <div className="flex gap-3 h-full max-h-[83vh] overflow-y-auto flex-col-reverse">
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            self={message.senderId !== user?.id}
            websocket={webSocket}
            setEditing={setEditing}
            setReplying={setReplying}
          />
        ))}
      </div>

      <form
        className="absolute bottom-4 left-2 flex justify-center items-center gap-3"
        style={{
          width: "calc(100% - 1rem)",
        }}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <input
          type="file"
          id="file"
          hidden
          accept="image/png,video/mp4"
          ref={image}
          onChange={(e) => {
            const formData = new FormData();
            formData.append("file", e.target.files![0]);
            formData.append("type", e.target.files![0].type.split("/")[0]);

            axiosClient
              .post("/attachments/upload", formData)
              .then((res) => res.data)
              .then((data) => {
                webSocket?.send(
                  "+" + `${import.meta.env.VITE_APP_URL}/?attachment=${data.id}`
                );
              });

            e.target.value = "";
          }}
        />
        {!recorderControls.isRecording && !recorderControls.isPaused && (
          <>
            <button
              className="w-10 h-10 flex items-center justify-center my-auto"
              onClick={() => {
                image.current?.click();
              }}
            >
              <FaCamera size={20} />
            </button>

            <Textarea
              placeholder={t("messages.send")}
              className="bg-secondary w-4/5 h-10 items-center min-h-0 resize-none"
              rows={1}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();

                  handleSubmit();
                }
              }}
            />
          </>
        )}
        <button className="flex items-center justify-center h-full">
          <VoiceRecorder controls={recorderControls} websocket={webSocket} />
        </button>
      </form>
    </div>
  );
}
