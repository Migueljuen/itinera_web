import React from "react";

export default function RecentBooking() {
  return (
    <>
      {/* Container for all bookings */}
      <div className="w-11/12 mx-auto flex flex-col gap-4 ">
        {/* -------------------- Single Booking Item -------------------- */}
        <div className="flex w-full items-center cursor-pointer justify-between bg-gray-50 p-4 rounded-4xl hover:bg-gray-100 transition">
          {/* User Info (Avatar + Name + Activity Booked) */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-blue-200 flex items-center justify-center">
              <span className="text-blue-500 text-lg">J</span>
            </div>
            <div>
              <p className="font-medium text-primary">Jane Doe</p>
              <p className="text-sm text-black/60">
                Booked: Kayaking Adventure
              </p>
            </div>
          </div>

          {/* Booking Date */}
          <div className="text-sm text-gray-400 mb-8">Sept 5, 2025</div>
        </div>

        {/* -------------------- Another Booking Item -------------------- */}
        <div className="flex w-full items-center justify-between cursor-pointer bg-gray-50 p-4 rounded-4xl hover:bg-gray-100 transition">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-purple-200 flex items-center justify-center">
              <span className="text-purple-500 text-lg">D</span>
            </div>
            <div>
              <p className="font-medium text-primary">Dan Smith</p>
              <p className="text-sm text-black/60">
                Booked: Sunset Photography Tour
              </p>
            </div>
          </div>

          {/* Booking Date */}
          <div className="text-sm text-gray-400 mb-8">Sept 4, 2025</div>
        </div>

        <div className="flex w-full items-center justify-between cursor-pointer bg-gray-50 p-4 rounded-4xl hover:bg-gray-100 transition">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full  bg-yellow-100 flex items-center justify-center">
              <span className="text-yellow-500 text-lg">L</span>
            </div>
            <div>
              <p className="font-medium text-primary">Lenuelito Betita</p>
              <p className="text-sm text-black/60">
                Booked: Sunset Photography Tour
              </p>
            </div>
          </div>

          {/* Booking Date */}
          <div className="text-sm text-gray-400 mb-8">Sept 4, 2025</div>
        </div>
      </div>
    </>
  );
}
