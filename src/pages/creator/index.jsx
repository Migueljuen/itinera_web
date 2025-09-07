import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Star, Activity, Circle, Menu } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../constants/api";
import envelope from "../../assets/icons/envelope.svg";
import bell from "../../assets/icons/bell.svg";
import Button from "../../components/Button";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
const CreatorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const isSubscribed = 0;
  const [stats, setStats] = useState({
    totalBookings: 85,
    avgRating: 4.8,
    activeBooking: 12,
  });

  const [expStats, setExpStats] = useState({
    active: 4,
    draft: 2,
    inactive: 3,
  });

  const StatCard = ({ icon, value, label }) => (
    <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100 text-center">
      <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-2xl lg:text-3xl font-semibold mb-1">{value}</h3>
      <p className="text-xs lg:text-sm text-gray-500">{label}</p>
    </div>
  );

  const ExperienceCard = ({ color, value, label }) => (
    <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100 text-center">
      <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-3">
        <div className={`w-5 h-5 rounded-full ${color}`}></div>
      </div>
      <h3 className="text-2xl lg:text-3xl font-semibold mb-1">{value}</h3>
      <p className="text-xs lg:text-sm text-gray-500">{label}</p>
    </div>
  );

  const FeedbackCard = ({ name, date, rating, avatar }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
      <div className="flex items-center gap-3 mb-2">
        <img
          src={avatar}
          alt={name}
          className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover"
        />
        <div>
          <h4 className="font-medium">{name}</h4>
          <p className="text-sm text-gray-500">{date}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            size={16}
            className={
              index < rating ? "fill-blue-500 text-blue-500" : "text-gray-300"
            }
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="">
      {/* Top Header */}
      <header className="px-8">
        <div className="flex items-center justify-between pb-4">
          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={24} />
          </button>

          {/* Page Title */}
          <div className="flex-1 lg:flex-none">
            <h1 className="text-2xl font-semibold text-gray-900 capitalize">
              Hello, {user?.first_name || "Creator"}
            </h1>
            {/* <p className="text-sm text-black/60 mt-1">
              Welcome back to Itinera!
            </p> */}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Buttons */}
            <div className="flex gap-4  border-r border-gray-400 px-4">
              {/* Inbox */}
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-gray-300 grid place-items-center">
                <img
                  src={envelope}
                  alt="Itinera Logo"
                  className="w-5 cursor-pointer transition-transform"
                />
              </div>
              {/* Notifications */}
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-gray-300 grid place-items-center">
                <img
                  src={bell}
                  alt="Itinera Logo"
                  className="w-5 cursor-pointer transition-transform"
                />
              </div>
            </div>
            {/* User Profile */}
            <div className="flex items-center gap-4">
              {/* profile picture */}
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
                {/* User full name */}
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-base font-medium text-gray-900 capitalize">
                  {user?.first_name} {user?.last_name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* GRID */}
      <div class="mt-4 flex w-full h-screen gap-4">
        {/* BANNER IF NO SUBSCRIPTION */}
        <div className="w-full flex flex-col gap-4">
          {!isSubscribed ? (
            <div class="bg-[url('assets/images/blob.svg')] h-80 bg-cover bg-center rounded-4xl flex flex-col items-start justify-around py-12 ">
              <p className=" text-white/90 text-sm tracking-widest pl-8">
                SUBSCRIPTION
              </p>
              <p className="text-white text-4xl pl-8">
                Unlock More Bookings.<br></br>
                Grow with Premium Tools.
              </p>
              <div className="pl-8 ">
                <button className="cursor-pointer flex items-center bg-black/90 hover:bg-[#2a2a2a] py-2 px-2 rounded-4xl transition-all duration-300 transform text-base">
                  <p className="text-white/90 px-4 ">Upgrade Now</p>{" "}
                  <div className="py-3 px-3 rounded-full bg-white">
                    <ChevronRightIcon className="h-5 text-black/90 " />
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <></>
          )}
          <div className="bg-blue-200 w-full h-72 rounded-4xl"> </div>
        </div>

        <div class="bg-green-300 flex items-center h-full rounded-4xl justify-center w-3/6 ">
          30%
        </div>
      </div>

      {/* Stats Overview */}
      <div className="hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-6 mb-8">
          <StatCard
            icon={<Calendar className="text-blue-500" />}
            value={stats.totalBookings}
            label="Total Bookings"
          />
          <StatCard
            icon={<Star className="text-yellow-500" />}
            value={stats.avgRating}
            label="Avg. Rating"
          />
          <StatCard
            icon={<div className="w-5 h-5 rounded-full bg-green-600"></div>}
            value={stats.activeBooking}
            label="Active Bookings"
          />
        </div>

        {/* Experience Overview */}
        <section className="mb-8">
          <h2 className="text-xl lg:text-2xl font-medium mb-4">
            My Activities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-6">
            <ExperienceCard
              color="bg-green-600"
              value={expStats.active}
              label="Active"
            />
            <ExperienceCard
              color="bg-yellow-400"
              value={expStats.draft}
              label="Draft"
            />
            <ExperienceCard
              color="bg-gray-300"
              value={expStats.inactive}
              label="Inactive"
            />
          </div>
        </section>

        {/* Recent Feedbacks */}
        <section className="mb-8">
          <h2 className="text-xl lg:text-2xl font-medium mb-4">
            Recent Feedbacks
          </h2>
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <FeedbackCard
              name="Miguel"
              date="March 11, 2025"
              rating={1}
              avatar="https://ui-avatars.com/api/?name=Miguel&background=random"
            />
            <FeedbackCard
              name="Jonathan"
              date="May 01, 2025"
              rating={3}
              avatar="https://ui-avatars.com/api/?name=Jonathan&background=random"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default CreatorDashboard;
