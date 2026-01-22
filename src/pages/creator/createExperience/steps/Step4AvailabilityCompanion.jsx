import React, { useMemo, useState } from "react";
import {
  Loader2,
  X,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  Save,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast, { Toaster } from "react-hot-toast";

const TRAVEL_COMPANIONS = [
  { id: "Solo", label: "Solo", description: "Perfect for solo travelers" },
  { id: "Partner", label: "Couple", description: "Romantic experiences for two" },
  { id: "Family", label: "Family", description: "Great for families with kids" },
  { id: "Friends", label: "Friends", description: "Fun group activities" },
  { id: "Group", label: "Large Group", description: "Suitable for bigger groups" },
  { id: "Any", label: "Anyone", description: "Works for all group sizes" },
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

// --------------------
// Helpers
// --------------------
const formatTimeWithSeconds = (time) => {
  if (!time) return "";
  return time.length === 5 ? `${time}:00` : time;
};

const parseTimeToMinutes = (hhmm) => {
  // accepts "HH:mm" or "HH:mm:ss"
  if (!hhmm) return 0;
  const [h, m] = hhmm.split(":");
  return parseInt(h, 10) * 60 + parseInt(m, 10);
};

const minutesToHHMM = (mins) => {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

const buildGeneratedSlots = ({
  start,
  end,
  durationMins,
  gapMins,
}) => {
  const startM = parseTimeToMinutes(start);
  const endM = parseTimeToMinutes(end);

  if (endM <= startM) return [];

  const slots = [];
  let cursor = startM;

  while (cursor + durationMins <= endM) {
    const s = minutesToHHMM(cursor);
    const e = minutesToHHMM(cursor + durationMins);

    slots.push({
      start_time: formatTimeWithSeconds(s),
      end_time: formatTimeWithSeconds(e),
    });

    cursor = cursor + durationMins + gapMins;
  }

  return slots;
};

const dedupeSlots = (slots) => {
  const seen = new Set();
  const out = [];
  for (const s of slots) {
    const key = `${s.start_time}-${s.end_time}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
};

// Custom styled DatePicker wrapper
const TimePickerWrapper = ({ value, onChange, placeholder, className = "" }) => {
  const timeValue = value ? new Date(`2000-01-01T${value}:00`) : null;

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center">
        <DatePicker
          selected={timeValue}
          onChange={(time) => {
            if (time) {
              const hours = time.getHours().toString().padStart(2, "0");
              const minutes = time.getMinutes().toString().padStart(2, "0");
              onChange(`${hours}:${minutes}`);
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
    className={`relative p-3 rounded-xl border border-gray-300 transition-all duration-200 text-left ${isSelected
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
      <div className={`ml-2 ${isSelected ? "text-[#376a63]" : "text-gray-400"}`}>
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
  isEditMode = false,
  onSave,
  isSaving = false,
}) => {
  const [selectedDays, setSelectedDays] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [expandedDay, setExpandedDay] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // NEW: add mode + slot generator controls
  const [addMode, setAddMode] = useState("single"); // "single" | "generate"
  const [slotDurationMins, setSlotDurationMins] = useState(60);
  const [gapMins, setGapMins] = useState(0);

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
    setSelectedDays((prev) => {
      if (prev.includes(day)) return prev.filter((d) => d !== day);
      return [...prev, day];
    });
  };

  const formatTimeForDisplay = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const previewSlots = useMemo(() => {
    if (addMode !== "generate") return [];
    if (!start || !end) return [];
    if (!slotDurationMins || slotDurationMins <= 0) return [];

    return buildGeneratedSlots({
      start,
      end,
      durationMins: slotDurationMins,
      gapMins,
    });
  }, [addMode, start, end, slotDurationMins, gapMins]);

  const addAvailability = () => {
    if (!start || !end || selectedDays.length === 0) {
      toast.error("Pick at least one day, start time, and end time.");
      return;
    }

    const startTimeDate = new Date(`2000-01-01T${start}`);
    const endTimeDate = new Date(`2000-01-01T${end}`);

    if (endTimeDate <= startTimeDate) {
      toast.error("End time must be after start time.");
      return;
    }

    let slotsToAdd = [];

    if (addMode === "single") {
      slotsToAdd = [
        {
          start_time: formatTimeWithSeconds(start),
          end_time: formatTimeWithSeconds(end),
        },
      ];
    } else {
      slotsToAdd = buildGeneratedSlots({
        start,
        end,
        durationMins: slotDurationMins,
        gapMins,
      });

      if (slotsToAdd.length === 0) {
        toast.error("No slots generated. Check duration/gap.");
        return;
      }

      const endM = parseTimeToMinutes(end);
      const last = slotsToAdd[slotsToAdd.length - 1];
      const lastEndM = parseTimeToMinutes(last.end_time);

      // optional helpful warning if it doesn't perfectly land on end time
      if (lastEndM !== endM) {
        toast(
          "Note: your timeframe doesn't divide evenly — leftover minutes were ignored.",
          { icon: "🕒" }
        );
      }
    }

    const updatedAvailability = [...(formData.availability || [])];

    selectedDays.forEach((day) => {
      const dayIndex = updatedAvailability.findIndex(
        (slot) => slot.day_of_week === day
      );

      if (dayIndex !== -1) {
        const merged = dedupeSlots([
          ...(updatedAvailability[dayIndex].time_slots || []),
          ...slotsToAdd,
        ]);

        updatedAvailability[dayIndex] = {
          ...updatedAvailability[dayIndex],
          time_slots: merged,
        };
      } else {
        updatedAvailability.push({
          day_of_week: day,
          time_slots: dedupeSlots([...slotsToAdd]),
        });
      }
    });

    setFormData((prev) => ({
      ...prev,
      availability: updatedAvailability,
    }));

    // Keep selectedDays (as you wanted)
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

  const toggleDayExpansion = (day) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  const selectedCompanions = formData.travel_companions || [];
  const availabilityCount = (formData.availability || []).length;

  const handleContinue = () => {
    if (!formData.availability || formData.availability.length === 0) {
      toast.error("Please set at least one availability slot.");
      return;
    }

    if (!selectedCompanions || selectedCompanions.length === 0) {
      toast.error("Please select at least one travel companion.");
      return;
    }

    onNext();
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave();
    }
  };

  return (
    <>
      <Toaster position="top-center" />
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

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onBack}
                  className="flex items-center justify-center gap-2 px-8 py-3 text-sm border-2 border-gray-300 text-gray-700 rounded-xl max-h-[44px] font-medium hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft size={20} />
                  Previous Step
                </button>

                {isEditMode && onSave && (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-3 rounded-lg font-medium bg-[#376a63] text-white text-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 max-h-[44px]"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={handleContinue}
                  disabled={isSaving}
                  className="px-8 py-3 rounded-lg font-medium bg-black/80 text-white text-sm hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed max-h-[44px]"
                >
                  Continue
                </button>
              </div>
            </div>

            {/* TWO COL */}
            <div className="flex flex-row justify-between gap-8">
              {/* LEFT - Availability */}
              <div className="flex flex-col gap-4 border rounded-xl p-4 border-gray-300 flex-[0.7]">
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
                    <ChevronUp size={18} className="text-[#0e63be]" />
                  ) : (
                    <ChevronDown size={18} className="text-[#0e63be]" />
                  )}
                  <span className="ml-2 text-[#0e63be] font-medium text-sm">
                    {showAddForm ? "Hide Add Form" : "Add Time Slots"}
                  </span>
                </button>

                {/* Add Form */}
                {showAddForm && (
                  <div className="rounded-xl w-full space-y-6">
                    {/* Day Selection */}
                    <div className="grid grid-cols-7 gap-1">
                      {daysOfWeek.map((day, index) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDaySelection(day)}
                          className={`min-w-[45px] text-center font-medium px-2 py-2 text-xs whitespace-nowrap transition-colors rounded-full
                            ${selectedDays.includes(day)
                              ? "bg-blue-100 text-[#0e63be]"
                              : "bg-white border-white text-black/80 hover:bg-gray-50"
                            }`}
                        >
                          {daysShort[index]}
                        </button>
                      ))}
                    </div>

                    {/* NEW: Mode selector */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAddMode("single")}
                        className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${addMode === "single"
                            ? "bg-black/80 text-white border-black/80"
                            : "bg-white text-black/70 border-gray-200 hover:bg-gray-50"
                          }`}
                      >
                        Single slot
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddMode("generate")}
                        className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${addMode === "generate"
                            ? "bg-black/80 text-white border-black/80"
                            : "bg-white text-black/70 border-gray-200 hover:bg-gray-50"
                          }`}
                      >
                        Generate slots
                      </button>
                    </div>

                    {/* Time Selection */}
                    <div className="flex justify-between items-center">
                      <div className="flex-[0.5]">
                        <TimePickerWrapper
                          value={start}
                          onChange={setStart}
                          placeholder="From"
                          className="text-sm"
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

                    {/* NEW: Generator controls */}
                    {addMode === "generate" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                          <label className="block text-xs font-semibold text-black/70 mb-2">
                            Slot duration
                          </label>
                          <select
                            value={slotDurationMins}
                            onChange={(e) =>
                              setSlotDurationMins(parseInt(e.target.value, 10))
                            }
                            className="w-full bg-white border border-gray-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value={30}>30 minutes</option>
                            <option value={45}>45 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={90}>1 hour 30 mins</option>
                            <option value={120}>2 hours</option>
                          </select>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                          <label className="block text-xs font-semibold text-black/70 mb-2">
                            Gap between slots (optional)
                          </label>
                          <select
                            value={gapMins}
                            onChange={(e) =>
                              setGapMins(parseInt(e.target.value, 10))
                            }
                            className="w-full bg-white border border-gray-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value={0}>No gap</option>
                            <option value={10}>10 minutes</option>
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                          </select>
                        </div>

                        {/* Preview */}
                        <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-black/80">
                              Preview
                            </p>
                            <p className="text-xs text-black/50">
                              {previewSlots.length} slot
                              {previewSlots.length !== 1 ? "s" : ""}
                            </p>
                          </div>

                          {(!start || !end) && (
                            <p className="text-xs text-black/50">
                              Pick From/To to preview generated slots.
                            </p>
                          )}

                          {start && end && previewSlots.length === 0 && (
                            <p className="text-xs text-red-500">
                              No slots generated — check duration/gap.
                            </p>
                          )}

                          {previewSlots.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {previewSlots.slice(0, 10).map((s, i) => (
                                <div
                                  key={i}
                                  className="text-xs bg-blue-50 border border-blue-100 text-[#0e63be] rounded-full px-3 py-1"
                                >
                                  {formatTimeForDisplay(s.start_time)}–{" "}
                                  {formatTimeForDisplay(s.end_time)}
                                </div>
                              ))}
                              {previewSlots.length > 10 && (
                                <div className="text-xs text-black/50 px-2 py-1">
                                  +{previewSlots.length - 10} more…
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      {/* Add Button */}
                      <button
                        type="button"
                        onClick={addAvailability}
                        disabled={!start || !end || selectedDays.length === 0}
                        className={`px-6 py-3 rounded-xl font-medium text-sm transition-colors ${start && end && selectedDays.length > 0
                            ? "bg-black/80 text-white hover:bg-black/70 cursor-pointer"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                      >
                        Add to Selected Days
                      </button>
                    </div>
                  </div>
                )}

                {/* Current Schedule - Calendar View */}
                <div className="max-h-96 overflow-y-auto">
                  {(formData.availability || []).length === 0 ? (
                    <div className="bg-gray-50 p-4 rounded-xl text-center">
                      <Calendar size={32} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No availability set</p>
                      <p className="text-gray-400 text-xs mt-1">
                        Add time slots above
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-7 gap-2">
                        {/* Header row */}
                        {daysShort.map((day, index) => (
                          <div
                            key={index}
                            className="text-center text-xs font-semibold text-black/80 py-2"
                          >
                            {day}
                          </div>
                        ))}

                        {/* Calendar cells */}
                        {daysOfWeek.map((fullDay, index) => {
                          const dayData = (formData.availability || []).find(
                            (item) => item.day_of_week === fullDay
                          );
                          const timeSlots = dayData?.time_slots || [];
                          const isExpanded = expandedDay === fullDay;

                          return (
                            <div
                              key={index}
                              className={`flex flex-col justify-start min-h-[100px] relative p-3 rounded-lg border transition-all ${timeSlots.length > 0
                                  ? "bg-white border-gray-200 hover:border-blue-300"
                                  : "bg-gray-50 border-gray-200"
                                }`}
                            >
                              {timeSlots.length > 0 ? (
                                <div className="space-y-2">
                                  {timeSlots
                                    .slice(0, isExpanded ? timeSlots.length : 2)
                                    .map((slot, slotIndex) => (
                                      <div key={slotIndex} className="group relative">
                                        <div
                                          className="text-sm bg-blue-50 border-l-4 border-[#0e63be]/70 rounded-lg py-1.5 px-2 text-[#0e63be] cursor-pointer hover:bg-blue-100 transition-colors"
                                          title={`${formatTimeForDisplay(
                                            slot.start_time
                                          )} - ${formatTimeForDisplay(slot.end_time)}`}
                                        >
                                          <div className="flex flex-col items-center justify-center">
                                            <span className="text-xs">
                                              {formatTimeForDisplay(slot.start_time)}
                                            </span>

                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const dayIndex = (
                                                  formData.availability || []
                                                ).findIndex(
                                                  (item) => item.day_of_week === fullDay
                                                );
                                                removeSlot(dayIndex, slotIndex);
                                              }}
                                              className="opacity-0 group-hover:opacity-100 absolute -top-2 -right-2 transition-opacity p-0.5 hover:bg-gray-100 rounded-full"
                                            >
                                              <X size={16} className="text-b-500" />
                                            </button>
                                          </div>

                                          <span className="text-xs text-[#0e63be]">
                                            {formatTimeForDisplay(slot.end_time)}
                                          </span>
                                        </div>
                                      </div>
                                    ))}

                                  {timeSlots.length > 2 && (
                                    <button
                                      onClick={() => toggleDayExpansion(fullDay)}
                                      className="w-full text-xs text-[#0e63be] font-medium hover:bg-blue-50 py-1 rounded transition-colors"
                                    >
                                      {isExpanded ? (
                                        <span className="flex items-center justify-center gap-1">
                                          <ChevronUp size={12} />
                                          Show less
                                        </span>
                                      ) : (
                                        `+${timeSlots.length - 2} more`
                                      )}
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT - Travel Companions */}
              <div className="flex flex-col gap-4 border rounded-xl p-4 border-gray-300 flex-[0.3] h-fit">
                <div className="pb-4">
                  <label className="block font-medium py-2 text-left text-black/80 ">
                    Who is this experience perfect for?
                  </label>
                  <p className="text-left text-sm text-black/60">
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
            {/* /TWO COL */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Step4AvailabilityCompanion;
