import Await from "@/components/Await";
import { useSession } from "@/components/SessionContext";
import Attachment from "@/components/dm/Attachment";
import ChatNavbar from "@/components/dm/ChatNavbar";
import Message from "@/components/dm/Message";
import VoiceRecorder from "@/components/dm/VoiceRecorder";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { axiosClient } from "@/lib/axios";
import { getImageUrl } from "@/lib/utils";
import type { PublicUser } from "@/types/prisma";
import type { Chat, Message as MessageType } from "@repo/backend-common/types";
import { useAudioRecorder } from "@repo/react-audio-voice-recorder";
import { Keyboard } from "@saundapp/keyboard";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaCamera } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { io, type Socket } from "socket.io-client";

export const Route = createLazyFileRoute("/dm/$id/")({
  component: Chat,
});

function Chat() {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { text, submit } = Route.useSearch<any>();
  const session = useSession();
  const navigate = Route.useNavigate();
  const [message, setMessage] = useState(
    (!text?.startsWith(import.meta.env.VITE_APP_URL) ? text : "") || "",
  );
  const [messages, setMessages] = useState<
    (MessageType & {
      sender: PublicUser;
    })[]
  >([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [replying, setReplying] = useState<string | null>(null);
  const [keyboard, isKeyboard] = useState(false);
  const { id } = Route.useParams();
  const { toast } = useToast();
  const image = useRef<HTMLInputElement>(null);
  const chatContainer = useRef<HTMLDivElement>(null);
  const { data: chat, isLoading } = useQuery<Chat>({
    queryKey: ["dm", id],
    queryFn: async () => axiosClient.get(`/dm/${id}`).then((res) => res.data),
  });
  const { data: history } = useQuery<
    (MessageType & {
      sender: PublicUser;
    })[]
  >({
    queryKey: ["dm", id, "messages"],
    queryFn: async () =>
      axiosClient.get(`/dm/${id}/messages`).then((res) => res.data),
  });
  const uploadAttachment = useMutation({
    mutationKey: ["attachment"],
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", file.type.split("/")[0]);

      const { data } = await axiosClient.post("/attachments/upload", formData);

      socket?.emit(
        "send",
        `${import.meta.env.VITE_APP_URL}/?attachment=${data.id}`,
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
      const socket = io(import.meta.env.VITE_WS_URL!, {
        auth: {
          token: localStorage.getItem("token"),
        },
        query: {
          chat: id,
        },
      });

      socket.on("connect", () => {
        setTimeout(() => {
          if (
            submit &&
            text &&
            text.startsWith(`${import.meta.env.VITE_APP_URL}/?post=`)
          ) {
            socket.emit("send", text);
            setMessage("");
            navigate({});
          }
        }, 500);
      });

      socket.on(
        "send",
        (
          message: MessageType & {
            sender: PublicUser;
          },
        ) => {
          setMessages((prev) => [message, ...prev]);
          setTimeout(() => {
            const chat = document.getElementById("chat");
            chat?.scrollTo({
              top: chat.scrollHeight,
              behavior: "smooth",
            });

            axiosClient.post(`/dm/${id}/read`).catch(() => {});
          }, 100);
        },
      );

      socket.on("delete", (messageId: string) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      });

      socket.on("edit", (messageId: string, text: string) => {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? { ...msg, text } : msg)),
        );
      });

      setSocket(socket);
    }, 200);

    return () => {
      clearTimeout(timeout);
      socket?.close();
      setSocket(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  useEffect(() => {
    setMessages(history || []);
  }, [history]);
  useEffect(() => {
    if (editing) {
      setMessage(messages.find((msg) => msg.id === editing)?.text || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);
  useEffect(() => {
    Keyboard.addListener("keyboardWillShow", () => isKeyboard(true));
    Keyboard.addListener("keyboardWillHide", () => isKeyboard(false));
  }, []);

  useEffect(() => {
    const container = chatContainer.current;
    if (!container) return;

    container.addEventListener("scroll", () => {
      localStorage.setItem(`scroll-[dm/${id}]`, container.scrollTop.toString());
    });

    const scroll = localStorage.getItem(`scroll-[dm/${id}]`);
    if (scroll)
      setTimeout(() => {
        container.scrollTop = parseInt(scroll);
      }, 10);
  }, [chatContainer, id]);

  const handleSubmit = () => {
    if (!message || !message.length) return;
    if (editing) socket?.emit("edit", editing, message);
    else if (replying) socket?.emit("reply", replying, message);
    else socket?.emit("send", message);

    setMessage("");
    setEditing(null);
    setReplying(null);
  };

  if (isLoading) return <Spinner className="m-auto" />;

  return (
    <div
      className="flex flex-col justify-start gap-3"
      style={{
        height: "calc(100vh - 8rem)",
      }}
    >
      <ChatNavbar chat={chat} />

      <div
        className="flex h-full flex-col-reverse gap-3 overflow-y-auto"
        id="chat"
        ref={chatContainer}
        style={{
          maxHeight: keyboard
            ? !replying
              ? "65vh"
              : "57vh"
            : !replying
              ? "100vh"
              : "74vh",
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
                chatSize={chat?.userIds.length ?? 0}
                self={true}
                socket={socket}
                setEditing={() => {}}
                setReplying={() => {}}
              />
            )}
          </Await>
        )}

        {messages.map((message) => (
          <Message
            key={message.id}
            chatSize={chat?.userIds.length ?? 0}
            message={message}
            self={message.senderId === session?.id}
            socket={socket}
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
          className="absolute bottom-[1.6rem] left-2 flex items-end justify-center gap-3"
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
          {message.length > 0 ? (
            <Button type="submit" className="size-10 rounded-2xl p-0">
              <Send size={15} />
            </Button>
          ) : (
            <button className="flex h-full items-center justify-center">
              <VoiceRecorder controls={recorderControls} socket={socket} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
