// CalendarView.jsx
import React, { useMemo, useState, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

// ---- Pastel color generator (stable per event) ----
const hashToHue = (str) => {
  let hash = 0;
  const s = String(str ?? "");
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
};

const pastelStyleFromKey = (key) => {
  const hue = hashToHue(key);
  return {
    backgroundColor: `hsl(${hue} 70% 92%)`,
    borderColor: `hsl(${hue} 55% 78%)`,
    color: `hsl(${hue} 35% 22%)`,
  };
};

const EventCard = ({ event, view }) => {
  const startLabel = moment(event.start).format("h:mm A");
  const endLabel = moment(event.end).format("h:mm A");

  const guestCount = Number(event.guest_count ?? event.guestCount ?? 0);
  const showGuests = Number.isFinite(guestCount) && guestCount > 0;

  const isTimeGrid = view === "week" || view === "day";

  return (
    <div className="w-full h-full">
      <div className="font-semibold text-[13px] leading-tight line-clamp-2">
        {event.title}
      </div>

      {/* Only show time inside card on MONTH view */}
      {!isTimeGrid && (
        <div className="mt-2 text-[12px] font-medium opacity-80">
          {startLabel} – {endLabel}
        </div>
      )}

      {showGuests && (
        <div className="text-[12px] font-semibold opacity-90 mt-1">
          Guests: {guestCount}
        </div>
      )}
    </div>
  );
};

const normalizeRangeToStartEnd = (range, view, date) => {
  // range can be:
  // - Array<Date> for week
  // - { start: Date, end: Date } for some views
  // - Date for day
  if (Array.isArray(range) && range.length) {
    const start = moment(range[0]).startOf("day").toDate();
    const end = moment(range[range.length - 1]).endOf("day").toDate();
    return { start, end };
  }

  if (range && range.start && range.end) {
    return {
      start: moment(range.start).startOf("day").toDate(),
      end: moment(range.end).endOf("day").toDate(),
    };
  }

  // day view sometimes gives a single date
  const d = range instanceof Date ? range : date;
  return {
    start: moment(d).startOf("day").toDate(),
    end: moment(d).endOf("day").toDate(),
  };
};

export default function CalendarView({ events = [] }) {
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());

  // visible range (for week/day auto-scroll)
  const [visibleRange, setVisibleRange] = useState(() =>
    normalizeRangeToStartEnd(date, "month", date)
  );

  const navigate = useNavigate();

  const handleSelectEvent = (event) => {
    navigate(`/owner/bookings?selectedId=${event.id}`);
  };

  const handleRangeChange = useCallback(
    (range) => {
      const next = normalizeRangeToStartEnd(range, view, date);
      setVisibleRange(next);
    },
    [view, date]
  );

  const eventPropGetter = useMemo(() => {
    return (event) => {
      const key = event.colorKey ?? event.id ?? event.title ?? "event";
      const pastel = pastelStyleFromKey(key);

      return {
        style: {
          backgroundColor: pastel.backgroundColor,
          border: `0px solid ${pastel.borderColor}`,
          color: pastel.color,
          borderRadius: 14,
          padding: "10px 12px",
          boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
          whiteSpace: "normal",
          overflow: "hidden",
        },
      };
    };
  }, []);

  // ✅ Auto-scroll target for week/day:
  const scrollToTime = useMemo(() => {
    const isTimeGrid = view === "week" || view === "day";
    if (!isTimeGrid) return moment().hour(8).minute(0).second(0).toDate();

    const startMs = new Date(visibleRange.start).getTime();
    const endMs = new Date(visibleRange.end).getTime();

    // filter events inside visible range
    const inRange = events.filter((e) => {
      const s = new Date(e.start).getTime();
      // keep if event starts within range (simple + works for your use-case)
      return s >= startMs && s <= endMs;
    });

    if (inRange.length === 0) {
      // default if no events
      return moment().hour(8).minute(0).second(0).toDate();
    }

    // earliest start
    let earliest = inRange[0].start;
    for (const e of inRange) {
      if (new Date(e.start).getTime() < new Date(earliest).getTime()) {
        earliest = e.start;
      }
    }

    // buffer so it scrolls a bit above the first event (e.g., 30 mins earlier)
    const m = moment(earliest).subtract(30, "minutes");

    // scrollToTime expects a Date; only time-of-day matters
    return moment()
      .startOf("day")
      .hour(m.hour())
      .minute(m.minute())
      .second(0)
      .toDate();
  }, [events, view, visibleRange]);

  return (
    <div className="bg-white relative z-10 flex flex-col h-full">
      <style>
        {`
          .rbc-time-view .rbc-timeslot-group { min-height: 80px; }
          .rbc-time-view .rbc-time-slot { min-height: 30px; }

          .rbc-time-view .rbc-event-label { display: none !important; }

          .rbc-month-view .rbc-event { min-height: 54px; }
          .rbc-time-view .rbc-event { min-height: 54px; }

          .rbc-event, .rbc-day-slot .rbc-background-event { background: transparent; }

          .rbc-event-content { white-space: normal; overflow: hidden; }
        `}
      </style>

      <div className="flex-1 border border-gray-300 rounded-4xl p-8 min-h-0">
        <Calendar
          className="calendar"
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          date={date}
          onView={setView}
          onNavigate={(nextDate) => {
            setDate(nextDate);
            // keep visibleRange in sync when navigating
            setVisibleRange(normalizeRangeToStartEnd(nextDate, view, nextDate));
          }}
          onRangeChange={handleRangeChange}
          onSelectEvent={handleSelectEvent}
          style={{ height: "100%", width: "100%" }}
          eventPropGetter={eventPropGetter}
          scrollToTime={scrollToTime}
          tooltipAccessor={(event) => {
            const startLabel = moment(event.start).format("h:mm A");
            const endLabel = moment(event.end).format("h:mm A");
            const guestCount = Number(event.guest_count ?? event.guestCount ?? 0);
            const guestsLine =
              Number.isFinite(guestCount) && guestCount > 0
                ? `\nGuests: ${guestCount}`
                : "";
            return `${event.title}\n${startLabel} – ${endLabel}${guestsLine}`;
          }}
          components={{
            event: (props) => <EventCard {...props} view={view} />,
          }}
        />
      </div>
    </div>
  );
}
