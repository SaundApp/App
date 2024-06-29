import Avatar from "@/components/account/Avatar";
import Message from "@/components/dm/Message";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { axiosClient } from "@/lib/axios";
import type { PublicUser } from "@/types/prisma";
import type { Message as MessageType } from "@repo/backend-common/types";
import { useAudioRecorder } from "@repo/react-audio-voice-recorder";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaCamera, FaChevronLeft } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import VoiceRecorder from "../../components/dm/VoiceRecorder";
import { Capacitor } from "@capacitor/core";
import { Microphone } from "@mozartec/capacitor-microphone";
import Attachment from "@/components/dm/Attachment";
import { getImageUrl } from "@/lib/utils";
import Await from "@/components/Await";

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
    !text?.startsWith(import.meta.env.VITE_APP_URL) ? text : "" || "",
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
  const { data: user, isLoading } = useQuery<PublicUser>({
    queryKey: ["user", username],
    queryFn: async () =>
      axiosClient.get(`/users/${username}`).then((res) => res.data),
  });
  const uploadAttachment = useMutation({
    mutationKey: ["attachment"],
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", file.type.split("/")[0]);

      const { data } = await axiosClient.post("/attachments/upload", formData);

      webSocket?.send(
        "+" + `${import.meta.env.VITE_APP_URL}/?attachment=${data.id}`,
      );

      if (image.current) image.current.value = "";
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: t("toast.error.base"),
      });
    },
  });
  const recorderControls = useAudioRecorder();

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log("Connecting to websocket...");
      const webSocket = new WebSocket(
        `${import.meta.env.VITE_WS_URL}/${username}?token=${localStorage.getItem("token")}`,
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
            setTimeout(() => {
              const chat = document.getElementById("chat");
              chat?.scrollTo({
                top: chat.scrollHeight,
                behavior: "smooth",
              });

              axiosClient.post(`/dm/${username}/read`).catch(() => {});
            }, 100);
            break;
          case "-":
            setMessages((prev) => prev.filter((msg) => msg.id !== message));
            break;
          case "!":
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === message.slice(0, 24)
                  ? { ...msg, text: message.slice(24) }
                  : msg,
              ),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);
  useEffect(() => {
    setMessages(data || []);
  }, [data]);
  useEffect(() => {
    if (editing) {
      setMessage(messages.find((msg) => msg.id === editing)?.text || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const handleSubmit = () => {
    if (!message || !message.length) return;
    if (editing) webSocket?.send(`!${editing}${message}`);
    else if (replying) webSocket?.send("@" + replying + message);
    else webSocket?.send("+" + message);

    setMessage("");
    setEditing(null);
    setReplying(null);
  };

  if (isLoading) return <Spinner className="m-auto" />;

  return (
    <div
      className="flex flex-col justify-between gap-3"
      style={{
        height: "calc(100vh - 5rem)",
      }}
    >
      <div className="flex items-center gap-3">
        <Link to="/dm">
          <FaChevronLeft fontSize={25} />
        </Link>

        <Link
          className="flex items-center gap-3"
          to={`/account/${user?.username}`}
        >
          {user && <Avatar user={user} width={40} height={40} />}

          <div>
            <h5 className="max-w-40 truncate text-left">{user?.name}</h5>
            <p className="muted max-w-40 truncate text-left">
              @{user?.username}
            </p>
          </div>
        </Link>
      </div>

      <div
        className="flex h-full flex-col-reverse gap-3 overflow-y-auto"
        id="chat"
        style={{
          maxHeight:
            Capacitor.getPlatform() === "ios"
              ? !replying
                ? "70vh"
                : "65vh"
              : !replying
                ? "83vh"
                : "76vh",
        }}
      >
        {uploadAttachment.isPending && (
          <Await promise={getImageUrl(uploadAttachment.variables)}>
            {(imageUrl) => (
              <Attachment
                postId={`local-${
                  uploadAttachment.variables.type.startsWith("image")
                    ? "IMAGE"
                    : "VIDEO"
                }-${imageUrl}`}
                self={true}
                websocket={webSocket}
                setEditing={() => {}}
                setReplying={() => {}}
              />
            )}
          </Await>
        )}

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
          className={
            "absolute bottom-4 left-2 flex items-end justify-center gap-3" +
            (Capacitor.getPlatform() === "ios" ? " bottom-8" : "")
          }
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
              if (e.target.files) uploadAttachment.mutate(e.target.files[0]);
            }}
          />
          {!recorderControls.isRecording && !recorderControls.isPaused && (
            <>
              <button
                className="mt-auto flex size-10 items-center justify-center"
                onClick={() => {
                  image.current?.click();
                }}
              >
                <FaCamera size={20} />
              </button>

              <div className="w-4/5">
                {replying && (
                  <div className="flex justify-between">
                    <div className="flex w-fit gap-1 py-2">
                      <span
                        className="muted"
                        onClick={() => {
                          document
                            .querySelector(`[data-message="${replying}"]`)
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        {t("dm.replying", {
                          message: messages
                            .find((msg) => msg.id === replying)
                            ?.text.startsWith(
                              `${import.meta.env.VITE_APP_URL}/`,
                            )
                            ? t("dm.attachment")
                            : messages.find((msg) => msg.id === replying)?.text,
                        })}
                      </span>
                    </div>

                    <button onClick={() => setReplying(null)}>
                      <FaXmark className="muted" />
                    </button>
                  </div>
                )}

                <Textarea
                  placeholder={t("dm.placeholder")}
                  className="h-10 min-h-0 w-full resize-none items-center bg-secondary"
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
          <button
            className="flex h-full items-center justify-center"
            onClick={async () => {
              await Microphone.requestPermissions();
            }}
          >
            <VoiceRecorder controls={recorderControls} websocket={webSocket} />
          </button>
        </div>
      </form>
    </div>
  );
}
