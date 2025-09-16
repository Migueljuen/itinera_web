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
import toast, { Toaster } from "react-hot-toast";

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
        {/* <Clock
          size={16}
          className="absolute left-3 text-gray-400 z-10 pointer-events-none"
        /> */}
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
          timeIntervals={30}
          timeCaption="Time"
          dateFormat="h:mm aa"
          placeholderText={placeholder}
          className="w-full bg-gray-50 rounded-xl p-3 cursor-pointer text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
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

  // const isValid = () => {
  //   const selectedCompanions = formData.travel_companions || [];
  //   const availability = formData.availability || [];

  //   if (selectedCompanions.length === 0) {
  //     toast.error("Please select at least one travel companion");
  //     return false;
  //   }

  //   if (availability.length === 0) {
  //     toast.error("Please add at least one availability slot");
  //     return false;
  //   }

  //   return true;
  // };
  const handleContinue = () => {
    if (!formData.availability || formData.availability.length === 0) {
      toast.error("Please set at least one availability slot.");
      return;
    }

    if (!selectedCompanions || selectedCompanions.length === 0) {
      toast.error("Please select at least one travel companion.");
      return;
    }

    // ✅ If all good, proceed
    onNext();
  };

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />

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
                  onClick={handleContinue}
                  className="px-8 py-3 rounded-lg font-medium bg-black/80 text-white text-sm hover:bg-black/70 cursor-pointer max-h-[44px]"
                >
                  Continue
                </button>
              </div>
            </div>

            {/* TWO COL */}
            <div className="flex flex-row justify-between gap-8">
              {/* LEFT - Availability */}
              <div className="flex flex-col gap-4 border rounded-xl p-4 border-gray-300 flex-[0.6]">
                <div className="flex flex-col items-left">
                  <div>
                    <label className="block font-medium py-2 text-left text-black/80 ">
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
                  className="w-full rounded-xl p-3 flex items-center justify-start  transition-colors mb-3"
                >
                  {showAddForm ? (
                    <ChevronUp size={18} className="text-[#376a63]" />
                  ) : (
                    <ChevronDown size={18} className="text-[#376a63]" />
                  )}
                  <span className="ml-2 text-[#376a63] font-medium text-sm">
                    {showAddForm ? "Hide Add Form" : "Add Time Slots"}
                  </span>
                </button>

                {/* Add Form */}
                {showAddForm && (
                  <div className=" rounded-xl w-full  space-y-6">
                    {/* Day Selection */}
                    <div className="grid grid-cols-7">
                      {daysOfWeek.map((day, index) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDaySelection(day)}
                          className={`min-w-[45px] text-center font-medium px-4 py-2 text-xs whitespace-nowrap transition-colors
        border-t border-b 
        ${index !== daysOfWeek.length - 1 ? "border-r" : ""} 
        ${
          selectedDays.includes(day)
            ? "bg-black/80 text-white"
            : "bg-white border-gray-300 text-black/80 hover:bg-gray-50"
        }`}
                        >
                          {daysShort[index]}
                        </button>
                      ))}
                    </div>

                    {/* Time Selection */}
                    <div className="flex justify-between items-center  ">
                      <div className="flex-[0.5]">
                        <TimePickerWrapper
                          value={start}
                          onChange={setStart}
                          placeholder="From"
                          className="text-sm "
                        />
                      </div>
                      <ArrowRight size={16} className="flex-[0.1]" />
                      <div className="flex-[0.5]">
                        <TimePickerWrapper
                          value={end}
                          onChange={setEnd}
                          placeholder="To"
                          className="text-sm"
                        />
                      </div>
                    </div>

                    {/* Add Button */}
                    <button
                      type="button"
                      onClick={addAvailability}
                      disabled={!start || !end || selectedDays.length === 0}
                      className={`w-full py-3 rounded-xl font-medium text-sm transition-colors ${
                        start && end && selectedDays.length > 0
                          ? "bg-black/80 text-white hover:bg-black/70 cursor-pointer"
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
                        Add time slots above
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
                                  className="flex justify-between items-center py-4 px-2 border-b border-gray-300"
                                >
                                  <span className="text-black/80 text-sm">
                                    {formatTimeForDisplay(slot.start_time)} -{" "}
                                    {formatTimeForDisplay(slot.end_time)}
                                  </span>
                                  <button
                                    onClick={() => removeSlot(index, i)}
                                    className="p-1 text-black/60 hover:text-black/50 transition-colors"
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
              <div className="flex flex-col gap-4 border rounded-xl p-4 border-gray-300 flex-[0.4] h-fit">
                <div className="pb-4">
                  <label className="block font-medium py-2 text-left text-black/80 ">
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
