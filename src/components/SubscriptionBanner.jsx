import React from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
export default function SubscriptionBanner() {
  return (
    <div className="bg-[url('assets/images/blob.svg')] h-80 bg-cover bg-center rounded-4xl flex flex-col items-start justify-around py-12 gap-8 ">
      <p className="text-white/90 text-sm tracking-widest pl-8">SUBSCRIPTION</p>
      <p className="text-white text-4xl pl-8">
        Unlock More Bookings.
        <br />
        Grow with Premium Tools.
      </p>
      <div className="pl-8">
        <button className="cursor-pointer flex items-center bg-black/90 hover:bg-[#2a2a2a] py-2 px-2 rounded-4xl transition-all duration-300 transform text-base">
          <p className="text-white/90 px-4">Upgrade Now</p>{" "}
          <div className="py-3 px-3 rounded-full bg-white">
            <ChevronRightIcon className="h-5 text-black/90 " />
          </div>
        </button>
      </div>
    </div>
  );
}
