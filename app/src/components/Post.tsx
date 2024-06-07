import { User } from "@/types";
import moment from "moment";
import { BsBookmarkFill, BsThreeDots } from "react-icons/bs";
import { FaRegHeart, FaRegPaperPlane } from "react-icons/fa";
import { Button } from "./ui/button";

export default function Post({
  user,
  createdAt,
  comments,
  url,
  description,
  likes,
  name,
}: {
  user: User;
  createdAt: number;
  comments: number;
  url: string;
  description: string;
  name: string;
  likes: User[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.username}
            draggable={false}
            className="w-10 h-10 rounded-full"
          />

          <div>
            <h4 className="font-semibold">{user.name}</h4>
            <p className="muted">{moment(createdAt).fromNow()}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button>Segui</Button>
          <BsThreeDots fontSize={25} />
        </div>
      </div>

      <div className="relative">
        <img
          src={url}
          alt="Post image"
          draggable={false}
          className="w-full rounded-md blur-sm"
        />
        <img
          src={url}
          alt="Post image"
          draggable={false}
          className="w-1/2 h-1/2 animate-spin-disk rounded-full absolute top-1/4 left-1/4"
        />

        <div
          className="absolute w-full text-center"
          style={{
            bottom: "calc(25% - 45px)",
          }}
        >
          <h2 className="text-white">{name}</h2>
        </div>

        <span
          className="h-2 bg-black/30 block rounded-md absolute bottom-4 left-4"
          style={{ width: "calc(100% - 2rem)" }}
        />
        <span className="h-2 bg-white block rounded-md absolute bottom-4 left-4 w-1/3" />
      </div>

      <div className="flex justify-between">
        <div className="flex gap-3">
          <FaRegHeart fontSize={25} />
          <FaRegPaperPlane fontSize={25} />
        </div>

        <BsBookmarkFill fontSize={25} />
      </div>

      <div className="flex gap-1">
        <img
          src={likes[0].avatar}
          alt={likes[0].username}
          draggable={false}
          className="w-6 h-6 rounded-full"
        />
        <p>Piace a {likes[0].name} e altri</p>
      </div>

      <div>
        <div className="flex gap-1">
          <p className="font-semibold">{user.name}:</p> <p>{description}</p>
        </div>

        <p className="muted mt-1">Visualizza tutti e {comments} commenti</p>
      </div>
    </div>
  );
}
