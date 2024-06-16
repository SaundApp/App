import Message from "@/components/dm/Message";
import { Textarea } from "@/components/ui/textarea";
import { axiosClient } from "@/lib/axios";
import { Message as MessageType, User } from "@/types/prisma/models";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAudioRecorder } from "react-audio-voice-recorder";
import { useTranslation } from "react-i18next";
import { FaCamera, FaChevronLeft, FaReplyAll } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import VoiceRecorder from "../../components/dm/VoiceRecorder";
import { useToast } from "@/components/ui/use-toast";
import Avatar from "@/components/account/Avatar";

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
  const { toast } = useToast();
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
        height: "calc(100vh - 3.75rem)",
      }}
    >
      <Link
        to={`/account/@${user?.username}`}
        className="flex gap-3 items-center"
      >
        <Link to="/dm">
          <FaChevronLeft fontSize={25} />
        </Link>

        {user && <Avatar user={user} width={40} height={40}/>}

        <div>
          <h5 className="max-w-[14rem] text-ellipsis whitespace-nowrap overflow-hidden">
            {user?.name}
          </h5>
          <p className="muted max-w-[14rem] text-ellipsis whitespace-nowrap overflow-hidden">
            @{user?.username}
          </p>
        </div>
      </Link>

      <div
        className="flex gap-3 h-full overflow-y-auto flex-col-reverse"
        style={{
          maxHeight: !replying ? "83vh" : "80vh",
        }}
      >
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            self={message.senderId !== user?.id}
            websocket={webSocket}
            setEditing={setEditing}
            setReplying={setReplying}
            reply={
              message.replyId
                ? messages.find((msg) => msg.id === message.replyId)
                : undefined
            }
          />
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div
          className="absolute bottom-4 left-2 flex justify-center items-end gap-3"
          style={{
            width: "calc(100% - 1rem)",
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
                    "+" +
                      `${import.meta.env.VITE_APP_URL}/?attachment=${data.id}`
                  );
                })
                .catch(() => {
                  toast({
                    variant: "destructive",
                    description: t("dm.message.attachment_error"),
                  });
                });

              e.target.value = "";
            }}
          />
          {!recorderControls.isRecording && !recorderControls.isPaused && (
            <>
              <button
                className="w-10 h-10 flex items-center justify-center mt-auto"
                onClick={() => {
                  image.current?.click();
                }}
              >
                <FaCamera size={20} />
              </button>

              <div className="w-4/5">
                {replying && (
                  <div className="flex justify-between">
                    <div className="flex gap-1 w-fit">
                      <div className="flex items-center gap-1">
                        <FaReplyAll className="muted" />
                        <span className="muted">{t("dm.message.reply")}</span>
                      </div>

                      <span className="max-w-[3rem] text-ellipsis whitespace-nowrap overflow-hidden">
                        {messages
                          .find((msg) => msg.id === replying)
                          ?.text.startsWith(`${import.meta.env.VITE_APP_URL}/`)
                          ? t("dm.message.attachment")
                          : messages.find((msg) => msg.id === replying)?.text}
                      </span>
                    </div>

                    <button onClick={() => setReplying(null)}>
                      <FaXmark className="muted" />
                    </button>
                  </div>
                )}

                <Textarea
                  placeholder={t("messages.send")}
                  className="bg-secondary w-full h-10 items-center min-h-0 resize-none"
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
              </div>
            </>
          )}
          <button className="flex items-center justify-center h-full">
            <VoiceRecorder controls={recorderControls} websocket={webSocket} />
          </button>
        </div>
      </form>
    </div>
  );
}
