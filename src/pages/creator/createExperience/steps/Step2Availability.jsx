import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, X, Calendar, Clock, Trash2 } from 'lucide-react';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const daysShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const Step2Availability = ({ formData, setFormData, onNext, onBack }) => {
    const [selectedDays, setSelectedDays] = useState([]);
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [expandedDay, setExpandedDay] = useState(null);
    const [showAddForm, setShowAddForm] = useState(true);

    const toggleDaySelection = (day) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
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
            window.alert('End time must be after start time');
            return;
        }

        const newTimeSlot = {
            start_time: formatTimeWithSeconds(start),
            end_time: formatTimeWithSeconds(end)
        };

        const updatedAvailability = [...formData.availability];

        selectedDays.forEach(day => {
            const dayIndex = updatedAvailability.findIndex(slot => slot.day_of_week === day);

            if (dayIndex !== -1) {
                updatedAvailability[dayIndex] = {
                    ...updatedAvailability[dayIndex],
                    time_slots: [...updatedAvailability[dayIndex].time_slots, newTimeSlot]
                };
            } else {
                updatedAvailability.push({
                    day_of_week: day,
                    time_slots: [newTimeSlot]
                });
            }
        });

        setFormData(prev => ({
            ...prev,
            availability: updatedAvailability
        }));

        // Clear UI selections
        setSelectedDays([]);
        setStart('');
        setEnd('');
    };

    const removeSlot = (dayIndex, slotIndex) => {
        const updated = [...formData.availability];
        updated[dayIndex].time_slots.splice(slotIndex, 1);
        if (updated[dayIndex].time_slots.length === 0) {
            updated.splice(dayIndex, 1);
        }
        setFormData({ ...formData, availability: updated });
    };

    const formatTimeForDisplay = (time) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const toggleDayExpansion = (day) => {
        setExpandedDay(expandedDay === day ? null : day);
    };

    const getTotalSlots = () => {
        return formData.availability.reduce((total, day) => total + day.time_slots.length, 0);
    };

    const clearAllAvailability = () => {
        if (window.confirm('Are you sure you want to remove all availability slots?')) {
            setFormData(prev => ({
                ...prev,
                availability: []
            }));
        }
    };

    return (
        <div className="relative flex flex-col h-full bg-white min-h-screen">
            {/* Fixed Header */}
            <div className="px-4 pt-6 pb-4 bg-white border-b border-gray-200">
                <h2 className="text-center text-xl font-semibold mb-2">Set Availability</h2>
                <p className="text-center text-sm text-gray-500">
                    Choose when this experience will be available to others
                </p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
                {/* Summary Card */}
                <div className="bg-blue-600 rounded-xl p-4 mb-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-white font-semibold text-lg">
                                {formData.availability.length} Days Active
                            </h3>
                            <p className="text-white/80 text-sm">
                                {getTotalSlots()} total time slots
                            </p>
                        </div>
                        <div className="bg-white/20 px-3 py-1 rounded-full">
                            <span className="text-white text-sm">
                                {formData.availability.length > 0 ? 'In Progress' : 'Getting Started'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Add New Button */}
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="w-full bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex items-center justify-center hover:bg-green-100 transition-colors"
                >
                    {showAddForm ? (
                        <X size={24} className="text-green-700" />
                    ) : (
                        <Plus size={24} className="text-green-700" />
                    )}
                    <span className="ml-2 text-green-700 font-medium">
                        {showAddForm ? 'Hide Add Form' : 'Add Time Slots'}
                    </span>
                </button>

                {/* Add Form - Collapsible */}
                {showAddForm && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        {/* Day Selection - Compact */}
                        <label className="block font-medium mb-2">Select Days</label>
                        <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto">
                            {daysOfWeek.map((day, index) => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => toggleDaySelection(day)}
                                    className={`px-3 py-2 rounded-full border whitespace-nowrap transition-colors ${selectedDays.includes(day)
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {daysShort[index]}
                                </button>
                            ))}
                        </div>

                        {/* Time Selection - Side by Side */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block font-medium mb-2 text-sm">Start Time</label>
                                <input
                                    type="time"
                                    value={start}
                                    onChange={(e) => setStart(e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-2 text-sm">End Time</label>
                                <input
                                    type="time"
                                    value={end}
                                    onChange={(e) => setEnd(e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Add Button */}
                        <button
                            type="button"
                            onClick={addAvailability}
                            disabled={!start || !end || selectedDays.length === 0}
                            className={`w-full p-3 rounded-lg font-medium transition-colors ${start && end && selectedDays.length > 0
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            Add to Selected Days
                        </button>
                    </div>
                )}

                {/* Current Schedule - Compact View */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-lg">Current Schedule</h3>
                        {formData.availability.length > 0 && (
                            <button
                                onClick={clearAllAvailability}
                                className="px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {formData.availability.length === 0 ? (
                        <div className="bg-gray-50 p-6 rounded-xl text-center">
                            <Calendar size={48} className="text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">No availability set yet</p>
                            <p className="text-gray-400 text-sm mt-1">
                                Add your first time slots above to get started
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {formData.availability.map((item, index) => (
                                <div key={`${item.day_of_week}-${index}`} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                    {/* Day Header */}
                                    <button
                                        onClick={() => toggleDayExpansion(item.day_of_week)}
                                        className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center flex-1">
                                            <div className="bg-blue-100 p-2 rounded-lg mr-3 w-16 flex items-center justify-center">
                                                <span className="text-blue-600 font-semibold text-sm">
                                                    {item.day_of_week.substring(0, 3).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h4 className="font-semibold text-gray-800">{item.day_of_week}</h4>
                                                <p className="text-sm text-gray-500">
                                                    {item.time_slots.length} time slot{item.time_slots.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                        {expandedDay === item.day_of_week ? (
                                            <ChevronUp size={20} className="text-gray-400" />
                                        ) : (
                                            <ChevronDown size={20} className="text-gray-400" />
                                        )}
                                    </button>

                                    {/* Expanded Time Slots */}
                                    {expandedDay === item.day_of_week && (
                                        <div className="px-4 pb-4 border-t border-gray-100">
                                            {item.time_slots.map((slot, i) => (
                                                <div
                                                    key={`${item.day_of_week}-${i}`}
                                                    className="flex justify-between items-center py-2"
                                                >
                                                    <div className="flex items-center">
                                                        <Clock size={16} className="text-gray-400 mr-2" />
                                                        <span className="text-gray-700">
                                                            {formatTimeForDisplay(slot.start_time)} - {formatTimeForDisplay(slot.end_time)}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => removeSlot(index, i)}
                                                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                                    >
                                                        <Trash2 size={18} />
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

            {/* Fixed Bottom Navigation */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
                <div className="flex gap-4">
                    <button
                        onClick={onBack}
                        className="flex-1 border border-blue-600 text-gray-800 p-4 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                        Previous
                    </button>
                    <button
                        onClick={formData.availability.length > 0 ? onNext : undefined}
                        disabled={formData.availability.length === 0}
                        className={`flex-1 p-4 rounded-xl font-medium transition-colors ${formData.availability.length > 0
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Step2Availability;