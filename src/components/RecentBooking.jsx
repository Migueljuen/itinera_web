// export default function RecentBooking() {
//   const bookings = [
//     {
//       name: "Jane Doe",
//       activity: "Booked: Kayaking Adventure",
//       date: "9/11/25",
//       avatar: "J",
//       bgColor: "bg-blue-200",
//       textColor: "text-blue-500",
//     },

//     {
//       name: "Dan Smith",
//       activity: "Booked: Sunset Photography Tour",
//       date: "8/25/25",
//       avatar: "D",
//       bgColor: "bg-purple-200",
//       textColor: "text-purple-500",
//     },
//     {
//       name: "Lenuelito Betita",
//       activity: "Booked: Bird Watching At Balaring",
//       date: "7/13/25",
//       avatar: "L",
//       bgColor: "bg-yellow-100",
//       textColor: "text-yellow-500",
//     },
//   ];

//   return (
//     <div className="w-full px-4 flex flex-col gap-3">
//       {bookings.map((booking, index) => (
//         <div
//           key={index}
//           className="flex w-full items-start cursor-pointer bg-gray-50 p-3 rounded-3xl hover:bg-gray-100 transition"
//         >
//           {/* Avatar - Fixed size */}
//           <div
//             className={`w-10 h-10 rounded-full ${booking.bgColor} flex items-center justify-center flex-shrink-0`}
//           >
//             <span
//               className={`${booking.textColor} text-base leading-none font-semibold`}
//             >
//               {booking.avatar}
//             </span>
//           </div>

//           {/* Content Container */}
//           <div className="flex-1 ml-3 min-w-0">
//             {/* Top row: Name and Date */}
//             <div className="flex items-center justify-between mb-1">
//               <p className="font-medium text-gray-800 truncate text-sm">
//                 {booking.name}
//               </p>
//               <span className="text-xs text-gray-400 font-mono ml-2 flex-shrink-0">
//                 {booking.date}
//               </span>
//             </div>

//             {/* Bottom row: Activity */}
//             <p className="text-sm text-black/60 truncate leading-tight">
//               {booking.activity}
//             </p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import axios from "axios";

import API_URL from "../constants/api"; // Adjust path as needed
import { useAuth } from "../contexts/AuthContext";

export default function RecentBooking() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Function to get user initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  };

  // Function to generate avatar colors based on name
  const getAvatarColors = (name) => {
    if (!name) return { bgColor: "bg-gray-200", textColor: "text-gray-500" };

    const colors = [
      { bgColor: "bg-blue-200", textColor: "text-blue-500" },
      { bgColor: "bg-purple-200", textColor: "text-purple-500" },
      { bgColor: "bg-yellow-100", textColor: "text-yellow-500" },
      { bgColor: "bg-green-200", textColor: "text-green-500" },
      { bgColor: "bg-pink-200", textColor: "text-pink-500" },
      { bgColor: "bg-indigo-200", textColor: "text-indigo-500" },
      { bgColor: "bg-red-200", textColor: "text-red-500" },
      { bgColor: "bg-orange-200", textColor: "text-orange-500" },
    ];

    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString();
    const day = date.getDate().toString();
    const year = date.getFullYear().toString().slice(-2);

    return `${month}/${day}/${year}`;
  };

  // Function to fetch bookings
  const fetchBookings = async () => {
    if (!user?.user_id) return;

    try {
      setLoading(true);
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await axios.get(
        `${API_URL}/booking/creator/${user.user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const fetchedBookings = response.data.bookings || [];

      // Sort bookings by date (most recent first) and take top 3
      const sortedBookings = fetchedBookings
        .sort(
          (a, b) =>
            new Date(b.created_at || b.booking_date) -
            new Date(a.created_at || a.booking_date)
        )
        .slice(0, 3);

      // Transform the data to match your component structure
      const transformedBookings = sortedBookings.map((booking) => {
        // Build full customer name from first and last name
        const firstName = booking.traveler_first_name || "";
        const lastName = booking.traveler_last_name || "";
        const fullName =
          `${firstName} ${lastName}`.trim() || "Unknown Customer";

        const activityName =
          booking.experience_title || booking.activity_name || "Activity";
        const colors = getAvatarColors(fullName);

        return {
          id: booking.booking_id || booking.id,
          name: fullName,
          activity: `Booked: ${activityName}`,
          date: formatDate(booking.created_at || booking.booking_date),
          avatar: getInitials(fullName),
          bgColor: colors.bgColor,
          textColor: colors.textColor,
          // Keep original fields for easier access
          traveler_first_name: firstName,
          traveler_last_name: lastName,
          experience_title: activityName,
          booking_date: formatDate(booking.booking_date),
          rawData: booking, // Keep original data if needed
        };
      });

      setBookings(transformedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
      // Optionally show toast error message
      // toast.error("Failed to fetch recent bookings");
    } finally {
      setLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    if (user?.user_id) {
      fetchBookings();
    }
  }, [user?.user_id]);

  // Loading state
  if (loading) {
    return (
      <div className="w-full px-4 flex flex-col gap-3">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="flex w-full items-start bg-gray-50 p-3 rounded-3xl animate-pulse"
          >
            <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>
            <div className="flex-1 ml-3 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
                <div className="h-3 bg-gray-300 rounded w-16"></div>
              </div>
              <div className="h-3 bg-gray-300 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (bookings.length === 0) {
    return (
      <div className="w-full px-4 py-8 text-center">
        <p className="text-gray-500 text-sm">No recent bookings found</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 flex flex-col gap-3">
      {bookings.map((booking, index) => (
        <div
          key={booking.id || index}
          className="flex w-full items-start cursor-pointer bg-gray-50 p-3 rounded-3xl hover:bg-gray-100 transition"
        >
          {/* Avatar - Fixed size */}
          <div
            className={`w-10 h-10 rounded-full ${booking.bgColor} flex items-center justify-center flex-shrink-0`}
          >
            <span
              className={`${booking.textColor} text-base leading-none font-semibold`}
            >
              {booking.avatar}
            </span>
          </div>

          {/* Content Container */}
          <div className="flex-1 ml-3 min-w-0">
            {/* Top row: Name and Date */}
            <div className="flex items-center justify-between mb-1">
              <p className="font-medium text-gray-800 truncate text-sm">
                {booking.name}
              </p>
              <span className="text-xs text-gray-400 font-mono ml-2 flex-shrink-0">
                {booking.date}
              </span>
            </div>

            {/* Bottom row: Activity */}
            <p className="text-sm text-black/60 truncate leading-tight">
              {booking.experience_title}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
