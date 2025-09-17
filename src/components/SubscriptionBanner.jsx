import React from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

export default function SubscriptionBanner() {
  return (
    <div
      className="bg-[url('assets/images/blob.svg')] min-w-[700px] bg-cover bg-center rounded-4xl flex flex-col justify-center py-8 sm:py-12 gap-6 sm:gap-8 h-60 sm:h-72 lg:h-80
     px-6 sm:px-8"
    >
      {/* Label */}
      <p className="text-white/90 text-xs sm:text-sm tracking-widest">
        SUBSCRIPTION
      </p>

      {/* Heading */}
      <p className="text-white text-2xl sm:text-3xl lg:text-4xl leading-snug">
        Unlock More Bookings.
        <br />
        Grow with Premium Tools.
      </p>

      {/* Button */}
      <div>
        <button className="cursor-pointer flex items-center bg-black/90 hover:bg-[#2a2a2a] py-2 px-2 rounded-4xl transition-all duration-300 transform text-sm sm:text-base">
          <p className="text-white/90 px-4">Upgrade Now</p>
          <div className="py-2 sm:py-3 px-2 sm:px-3 rounded-full bg-white">
            <ChevronRightIcon className="h-4 sm:h-5 text-black/90" />
          </div>
        </button>
      </div>
    </div>
  );
}
