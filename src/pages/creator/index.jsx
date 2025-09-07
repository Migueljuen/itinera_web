import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Star, Activity, Circle, Menu } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../constants/api";
import envelope from "../../assets/icons/envelope.svg";
import bell from "../../assets/icons/bell.svg";
import Button from "../../components/Button";

import SubscriptionBanner from "../../components/SubscriptionBanner";
import CalendarView from "../../components/Calendar";

const CreatorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const isSubscribed = 0;

  const demoEvents = [
    {
      id: 1,
      title: "Team Meeting",
      start: new Date(2025, 8, 10, 9, 0), // Sept 10, 9 AM
      end: new Date(2025, 8, 10, 11, 0), // Sept 10, 11 AM
    },
    {
      id: 2,
      title: "Lunch with Client",
      start: new Date(2025, 8, 12, 12, 0),
      end: new Date(2025, 8, 12, 13, 0),
    },
  ];

  return (
    <div className="flex flex-col ">
      {/* HEADER */}
      <header className="px-12 pt-4 py-8">
        <div className="flex items-center justify-between">
          <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={24} />
          </button>
          <div className="flex-1 lg:flex-none">
            <h1 className="text-2xl font-semibold text-gray-900 capitalize">
              Hello, {user?.first_name || "Creator"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-4 border-r border-gray-400 px-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-gray-300 grid place-items-center">
                <img
                  src={envelope}
                  alt="Inbox"
                  className="w-5 cursor-pointer"
                />
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-gray-300 grid place-items-center">
                <img
                  src={bell}
                  alt="Notifications"
                  className="w-5 cursor-pointer"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user?.profile_pic ? (
                <img
                  src={`${API_URL}/${user.profile_pic}`}
                  alt="Profile"
                  className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-lg">
                    {user?.first_name?.[0] || "U"}
                  </span>
                </div>
              )}
              <div className="text-right hidden sm:block">
                <p className="text-base font-medium text-gray-900 capitalize">
                  {user?.first_name} {user?.last_name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="flex flex-1 w-full gap-8 px-8 ">
        {/* LEFT COLUMN */}
        <div className="flex flex-col flex-[0.7]  gap-8 ">
          {/* Subscription Banner */}
          {!isSubscribed && <SubscriptionBanner />}

          {/* Calendar */}
          <div className="flex-1 min-h-[600px]">
            <CalendarView events={demoEvents} />
          </div>

          {/* Blue div at bottom */}
          <div className="bg-blue-200 h-72 rounded-4xl flex-shrink-0"></div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-3/6 bg-white rounded-4xl flex flex-[0.3] items-center justify-center flex-shrink-0">
          30%
        </div>
      </div>
    </div>
  );
};
export default CreatorDashboard;
