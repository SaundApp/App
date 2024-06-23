import { Link } from "@tanstack/react-router";
import { AdmobAds, type AdResult } from "capacitor-admob-ads";

const viewAd = (id: string) => {
  AdmobAds.triggerNativeAd({ id });
};

export default function PostAd({ ad }: { ad: AdResult }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
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
            <h5 className="max-w-[14rem] text-ellipsis whitespace-nowrap overflow-hidden">
              {ad.headline}
            </h5>
            <p className="muted max-w-[14rem] text-ellipsis whitespace-nowrap overflow-hidden">
              {ad.body}
            </p>
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

      <div className="flex flex-col gap-3 relative">
        <img
          width={490}
          height={490}
          src={ad.cover}
          alt={ad.headline}
          className="rounded-2xl object-cover"
          draggable={false}
          crossOrigin="anonymous"
        />

        <div className="w-full h-1/2 flex flex-col justify-between absolute p-3 top-1/2">
          <div className="flex justify-end items-center mt-auto">
            <div className="w-fit bg-black text-white py-3 px-6 rounded-3xl flex items-center gap-3">
              <h5
                className="max-w-[5rem] text-ellipsis whitespace-nowrap overflow-hidden z-10"
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
