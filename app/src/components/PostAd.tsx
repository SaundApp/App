import { Link } from "@tanstack/react-router";
import { AdmobAds, type AdResult } from "capacitor-admob-ads";

const viewAd = (id: string) => {
  AdmobAds.triggerNativeAd({ id });
};

export default function PostAd({ ad }: { ad: AdResult }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={ad.icon}
            alt={ad.headline}
            width={40}
            height={40}
            style={{
              objectFit: "cover",
              width: 40,
              height: 40,
            }}
            className="rounded-full"
          />

          <div>
            <h5 className="max-w-56 truncate">{ad.headline}</h5>
            <p className="muted max-w-56 truncate">{ad.body}</p>
          </div>
        </div>

        <Link to={ad.adChoicesUrl}>
          <img
            src="/adchoices.svg"
            alt="AdChoices"
            className="adchoices-icon"
            width={19}
            height={15}
          />
        </Link>
      </div>

      <div className="relative flex flex-col gap-3">
        <img
          width={490}
          height={490}
          src={ad.cover}
          alt={ad.headline}
          className="rounded-2xl object-cover"
          draggable={false}
        />

        <div className="absolute top-1/2 flex h-1/2 w-full flex-col justify-between p-3">
          <div className="mt-auto flex items-center justify-end">
            <div className="flex w-fit items-center gap-3 rounded-3xl bg-black px-6 py-3 text-white">
              <h5
                className="z-10 max-w-20 truncate"
                onClick={() => viewAd(ad.id)}
              >
                {ad.cta}
              </h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
