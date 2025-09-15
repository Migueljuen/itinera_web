import React, { useEffect, useState } from "react";
import {
  Loader2,
  Search,
  X,
  Users,
  Tag,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Calendar,
  Clock,
  Trash2,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const TRAVEL_COMPANIONS = [
  {
    id: "Solo",
    label: "Solo",
    description: "Perfect for solo travelers",
  },
  {
    id: "Partner",
    label: "Couple",
    description: "Romantic experiences for two",
  },
  {
    id: "Family",
    label: "Family",
    description: "Great for families with kids",
  },
  {
    id: "Friends",
    label: "Friends",
    description: "Fun group activities",
  },
  {
    id: "Group",
    label: "Large Group",
    description: "Suitable for bigger groups",
  },
  {
    id: "Any",
    label: "Anyone",
    description: "Works for all group sizes",
  },
];

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const daysShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Custom styled DatePicker wrapper
const TimePickerWrapper = ({
  value,
  onChange,
  placeholder,
  className = "",
}) => {
  const timeValue = value ? new Date(`2000-01-01T${value}:00`) : null;

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center">
        <Clock
          size={16}
          className="absolute left-3 text-gray-400 z-10 pointer-events-none"
        />
        <DatePicker
          selected={timeValue}
          onChange={(time) => {
            if (time) {
              const hours = time.getHours().toString().padStart(2, "0");
              const minutes = time.getMinutes().toString().padStart(2, "0");
              const timeString = `${hours}:${minutes}`;
              onChange(timeString);
            } else {
              onChange("");
            }
          }}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={15}
          timeCaption="Time"
          dateFormat="h:mm aa"
          placeholderText={placeholder}
          className="w-full bg-white border border-gray-300 rounded-xl p-3 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
          wrapperClassName="w-full"
          popperClassName="custom-time-picker-popper"
        />
      </div>
    </div>
  );
};

const CompanionCard = ({ companion, isSelected, onToggle }) => (
  <button
    onClick={() => onToggle(companion.id)}
    className={`relative p-3 rounded-xl border border-gray-300 transition-all duration-200 text-left ${
      isSelected
        ? "border-gray-900 bg-[#376a63]/5"
        : "border-gray-200 bg-white hover:border-gray-900"
    }`}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-gray-600 text-sm">
            {companion.label}
          </h4>
        </div>
        <p className="text-xs text-gray-600">{companion.description}</p>
      </div>
      <div
        className={`ml-2 ${isSelected ? "text-[#376a63]" : "text-gray-400"}`}
      >
        {isSelected ? <CheckCircle2 size={18} /> : <Circle size={18} />}
      </div>
    </div>
  </button>
);

const Step4AvailabilityCompanion = ({
  formData = { travel_companions: [], availability: [] },
  setFormData,
  onNext,
  onBack,
}) => {
  const [selectedDays, setSelectedDays] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [expandedDay, setExpandedDay] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const toggleCompanion = (companion) => {
    const currentCompanions = formData.travel_companions || [];
    if (currentCompanions.includes(companion)) {
      setFormData({
        ...formData,
        travel_companions: currentCompanions.filter((c) => c !== companion),
      });
    } else {
      setFormData({
        ...formData,
        travel_companions: [...currentCompanions, companion],
      });
    }
  };

  const toggleDaySelection = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const formatTimeWithSeconds = (time) => {
    return time.length === 5 ? `${time}:00` : time;
  };

  const addAvailability = () => {
    if (!start || !end || selectedDays.length === 0) return;

    const startTimeDate = new Date(`2000-01-01T${start}`);
    const endTimeDate = new Date(`2000-01-01T${end}`);

    if (endTimeDate <= startTimeDate) {
      window.alert("End time must be after start time");
      return;
    }

    const newTimeSlot = {
      start_time: formatTimeWithSeconds(start),
      end_time: formatTimeWithSeconds(end),
    };

    const updatedAvailability = [...(formData.availability || [])];

    selectedDays.forEach((day) => {
      const dayIndex = updatedAvailability.findIndex(
        (slot) => slot.day_of_week === day
      );

      if (dayIndex !== -1) {
        updatedAvailability[dayIndex] = {
          ...updatedAvailability[dayIndex],
          time_slots: [
            ...updatedAvailability[dayIndex].time_slots,
            newTimeSlot,
          ],
        };
      } else {
        updatedAvailability.push({
          day_of_week: day,
          time_slots: [newTimeSlot],
        });
      }
    });

    setFormData((prev) => ({
      ...prev,
      availability: updatedAvailability,
    }));

    // Clear UI selections
    setSelectedDays([]);
    setStart("");
    setEnd("");
  };

  const removeSlot = (dayIndex, slotIndex) => {
    const updated = [...(formData.availability || [])];
    updated[dayIndex].time_slots.splice(slotIndex, 1);
    if (updated[dayIndex].time_slots.length === 0) {
      updated.splice(dayIndex, 1);
    }
    setFormData({ ...formData, availability: updated });
  };

  const formatTimeForDisplay = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const toggleDayExpansion = (day) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  const getTotalSlots = () => {
    return (formData.availability || []).reduce(
      (total, day) => total + day.time_slots.length,
      0
    );
  };

  const selectedCompanions = formData.travel_companions || [];
  const availabilityCount = (formData.availability || []).length;

  const canProceed = selectedCompanions.length > 0;

  const isValid = () => {
    const selectedCompanions = formData.travel_companions || [];
    return selectedCompanions.length > 0;
  };

  return (
    <>
      {/* Add custom styles for react-datepicker */}
      <style jsx global>{`
        /* Main datepicker container */
        .react-datepicker {
          border: 1px solid #e5e7eb !important;
          border-radius: 12px !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          font-family: inherit !important;
          background: white !important;
        }

        /* Remove header since we only show time */
        .react-datepicker__header {
          display: none !important;
        }

        /* Time container styling */
        .react-datepicker__time-container {
          border: none !important;
          border-radius: 12px !important;
          width: 200px !important;
        }

        .react-datepicker__time {
          border-radius: 12px !important;
          background: white !important;
        }

        .react-datepicker__time .react-datepicker__time-box {
          width: 100% !important;
          border-radius: 12px !important;
        }

        /* Time list styling */
        .react-datepicker__time-list {
          scrollbar-width: thin !important;
          scrollbar-color: #d1d5db transparent !important;
          padding: 8px 0 !important;
        }

        .react-datepicker__time-list::-webkit-scrollbar {
          width: 6px !important;
        }

        .react-datepicker__time-list::-webkit-scrollbar-track {
          background: transparent !important;
        }

        .react-datepicker__time-list::-webkit-scrollbar-thumb {
          background: #d1d5db !important;
          border-radius: 3px !important;
        }

        .react-datepicker__time-list::-webkit-scrollbar-thumb:hover {
          background: #9ca3af !important;
        }

        /* Individual time items */
        .react-datepicker__time-list-item {
          height: auto !important;
          padding: 10px 16px !important;
          font-size: 14px !important;
          line-height: 1.4 !important;
          color: #374151 !important;
          border: none !important;
          margin: 0 8px 2px 8px !important;
          border-radius: 8px !important;
          transition: all 0.15s ease !important;
          font-weight: 500 !important;
        }

        .react-datepicker__time-list-item:hover {
          background-color: #f9fafb !important;
          color: #111827 !important;
        }

        /* Selected time item */
        .react-datepicker__time-list-item--selected {
          background-color: #376a63 !important;
          color: white !important;
          font-weight: 600 !important;
        }

        .react-datepicker__time-list-item--selected:hover {
          background-color: #2d5550 !important;
          color: white !important;
        }

        /* Disabled items */
        .react-datepicker__time-list-item--disabled {
          color: #9ca3af !important;
          background-color: transparent !important;
        }

        .react-datepicker__time-list-item--disabled:hover {
          background-color: transparent !important;
          color: #9ca3af !important;
          cursor: not-allowed !important;
        }

        /* Popper positioning */
        .react-datepicker-popper {
          z-index: 9999 !important;
        }

        .react-datepicker-popper[data-placement^="bottom"] {
          margin-top: 4px !important;
        }

        .react-datepicker-popper[data-placement^="top"] {
          margin-bottom: 4px !important;
        }

        /* Triangle arrow */
        .react-datepicker-popper[data-placement^="bottom"]
          .react-datepicker__triangle {
          border-bottom-color: white !important;
          border-top: none !important;
        }

        .react-datepicker-popper[data-placement^="top"]
          .react-datepicker__triangle {
          border-top-color: white !important;
          border-bottom: none !important;
        }

        .react-datepicker__triangle {
          border-color: transparent !important;
        }

        .react-datepicker__triangle::before {
          border-bottom-color: #e5e7eb !important;
          border-top-color: #e5e7eb !important;
        }
      `}</style>

      <div className="min-h-screen w-full">
        <div className="mx-auto">
          <div className="text-center py-2">
            <div className="flex items-center justify-between ">
              <div>
                <h2 className="text-left text-xl font-semibold mb-2 text-black/90">
                  Getting Started
                </h2>
                <p className="text-left text-sm text-black/60 mb-6">
                  Please fill the form below. Feel free to add as much detail as
                  needed.
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-x-4">
                <button
                  onClick={onBack}
                  className="flex items-center justify-center gap-2 px-8 py-3 text-sm border-2 border-gray-300 text-gray-700 rounded-xl max-h-[44px] font-medium hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft size={20} />
                  Previous Step
                </button>

                <button
                  onClick={isValid() ? onNext : undefined}
                  disabled={!isValid()}
                  className="px-8 py-3 rounded-lg font-medium bg-black/80 text-white text-sm hover:bg-black/70 cursor-pointer max-h-[44px]"
                >
                  Continue
                </button>
              </div>
            </div>

            {/* TWO COL */}
            <div className="flex flex-row justify-between gap-8">
              {/* LEFT - Availability */}
              <div className="flex flex-col gap-4 border rounded-xl p-4 border-gray-300 flex-1">
                <div className="flex flex-col items-left">
                  <div>
                    <label className="block font-medium py-2 text-left text-black/90 ">
                      Set the availability for this experience
                    </label>
                    <p className="text-left text-sm text-black/60 mb-4">
                      Choose when this activity will be available to others.
                    </p>
                  </div>
                </div>

                {/* Summary */}
                <div className="border border-black/60 rounded-xl p-3 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-black/80 font-medium text-left flex items-center gap-2">
                        <span className="text-4xl">·</span> {availabilityCount}{" "}
                        Days Active
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Add New Button */}
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="w-full bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-center hover:bg-green-100 transition-colors mb-3"
                >
                  {showAddForm ? (
                    <ChevronUp size={18} className="text-green-700" />
                  ) : (
                    <ChevronDown size={18} className="text-green-700" />
                  )}
                  <span className="ml-2 text-green-700 font-medium text-sm">
                    {showAddForm ? "Hide Add Form" : "Add Time Slots"}
                  </span>
                </button>

                {/* Add Form */}
                {showAddForm && (
                  <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-3 border border-gray-300">
                    {/* Day Selection */}
                    <div>
                      <label className="block font-medium text-sm mb-2">
                        Select Days
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map((day, index) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDaySelection(day)}
                            className={`min-w-[45px] text-center px-2 py-1 rounded-sm border text-xs whitespace-nowrap transition-colors ${
                              selectedDays.includes(day)
                                ? "bg-[#376a63] text-white"
                                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {daysShort[index]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time Selection */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-medium text-xs mb-1">
                          Start Time
                        </label>
                        <TimePickerWrapper
                          value={start}
                          onChange={setStart}
                          placeholder="Start time"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-xs mb-1">
                          End Time
                        </label>
                        <TimePickerWrapper
                          value={end}
                          onChange={setEnd}
                          placeholder="End time"
                          className="text-sm"
                        />
                      </div>
                    </div>

                    {/* Add Button */}
                    <button
                      type="button"
                      onClick={addAvailability}
                      disabled={!start || !end || selectedDays.length === 0}
                      className={`w-full p-2 rounded-xl font-medium text-sm transition-colors ${
                        start && end && selectedDays.length > 0
                          ? "bg-[#376a63] text-white hover:bg-[#376a63]/80 cursor-pointer"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Add to Selected Days
                    </button>
                  </div>
                )}

                {/* Current Schedule */}
                <div className="max-h-64 overflow-y-auto">
                  {(formData.availability || []).length === 0 ? (
                    <div className="bg-gray-50 p-4 rounded-xl text-center">
                      <Calendar
                        size={32}
                        className="text-gray-400 mx-auto mb-2"
                      />
                      <p className="text-gray-500 text-sm">
                        No availability set
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        Add time slots above (optional)
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(formData.availability || []).map((item, index) => (
                        <div
                          key={`${item.day_of_week}-${index}`}
                          className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                        >
                          {/* Day Header */}
                          <button
                            onClick={() => toggleDayExpansion(item.day_of_week)}
                            className="w-full flex justify-between items-center p-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center flex-1">
                              <div className="bg-blue-100 p-1 rounded-lg mr-2 w-12 flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-xs">
                                  {item.day_of_week
                                    .substring(0, 3)
                                    .toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 text-left">
                                <h4 className="font-semibold text-gray-800 text-sm">
                                  {item.day_of_week}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {item.time_slots.length} slot
                                  {item.time_slots.length !== 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                            {expandedDay === item.day_of_week ? (
                              <ChevronUp size={16} className="text-gray-400" />
                            ) : (
                              <ChevronDown
                                size={16}
                                className="text-gray-400"
                              />
                            )}
                          </button>

                          {/* Expanded Time Slots */}
                          {expandedDay === item.day_of_week && (
                            <div className="px-3 pb-3 border-t border-gray-100">
                              {item.time_slots.map((slot, i) => (
                                <div
                                  key={`${item.day_of_week}-${i}`}
                                  className="flex justify-between items-center py-2"
                                >
                                  <div className="flex items-center">
                                    <Clock
                                      size={14}
                                      className="text-gray-400 mr-2"
                                    />
                                    <span className="text-gray-700 text-sm">
                                      {formatTimeForDisplay(slot.start_time)} -{" "}
                                      {formatTimeForDisplay(slot.end_time)}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => removeSlot(index, i)}
                                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT - Travel Companions */}
              <div className="flex flex-col gap-4 border rounded-xl p-4 border-gray-300 flex-1 h-fit">
                <div className="pb-4">
                  <label className="block font-medium py-2 text-left text-black/90 ">
                    Who is this experience perfect for?
                  </label>
                  <p className="text-left text-sm text-black/60  ">
                    Select all group types that would enjoy this experience.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {TRAVEL_COMPANIONS.map((companion) => (
                    <CompanionCard
                      key={companion.id}
                      companion={companion}
                      isSelected={selectedCompanions.includes(companion.id)}
                      onToggle={toggleCompanion}
                    />
                  ))}
                </div>

                {selectedCompanions.length > 0 && (
                  <div className="bg-[#376a63]/10 rounded-xl p-3">
                    <p className="text-black/60 text-sm">
                      Selected for {selectedCompanions.length} group type
                      {selectedCompanions.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Step4AvailabilityCompanion;
