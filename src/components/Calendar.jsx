import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

export default function CalendarView({ events }) {
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const navigate = useNavigate();

  // Handle event click - navigate to booking page with selected booking ID
  const handleSelectEvent = (event) => {
    navigate(`/owner/bookings?selectedId=${event.id}`);
  };

  return (
    <div className="bg-white w-[780px] rounded-4xl p-8 relative z-10 flex flex-col h-full border border-gray-300">
      {/* Calendar fills remaining space */}
      <div className="flex-1">
        <Calendar
          className="calendar"
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          date={date}
          onView={setView}
          onNavigate={setDate}
          onSelectEvent={handleSelectEvent}
          style={{ height: "100%", width: "100%" }}
        />
      </div>
    </div>
  );
}