export default function RecentBooking() {
  const bookings = [
    {
      name: "Jane Doe",
      activity: "Booked: Kayaking Adventure",
      date: "9/11/25",
      avatar: "J",
      bgColor: "bg-blue-200",
      textColor: "text-blue-500"
    },
    {
      name: "Dan Smith",
      activity: "Booked: Sunset Photography Tour",
      date: "8/25/25",
      avatar: "D",
      bgColor: "bg-purple-200",
      textColor: "text-purple-500"
    },
    {
      name: "Lenuelito Betita",
      activity: "Booked: Bird Watching At Balaring",
      date: "7/13/25",
      avatar: "L",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-500"
    }
  ];

  return (
    <div className="w-full px-4 flex flex-col gap-3">
      {bookings.map((booking, index) => (
        <div key={index} className="flex w-full items-start cursor-pointer bg-gray-50 p-3 rounded-3xl hover:bg-gray-100 transition">
          {/* Avatar - Fixed size */}
          <div className={`w-10 h-10 rounded-full ${booking.bgColor} flex items-center justify-center flex-shrink-0`}>
            <span className={`${booking.textColor} text-base leading-none font-semibold`}>
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
            <p className="text-xs text-black/60 truncate leading-tight">
              {booking.activity}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}