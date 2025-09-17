//components/calendar.jsx
import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

export default function CalendarView({ events }) {
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());

  return (
    <div className="bg-white min-w-[700px] rounded-4xl p-8 relative z-10 flex flex-col h-full border border-gray-300">
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
          style={{ height: "100%", width: "100%" }} // takes all flex-1 space
        />
      </div>
    </div>
  );
}
