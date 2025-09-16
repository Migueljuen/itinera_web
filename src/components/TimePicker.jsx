// components/TimePicker.jsx
import React, { useEffect, useState, useRef } from "react";
import { Clock, X } from "lucide-react";

const TimePicker = ({ value, onChange, placeholder, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedHour, setSelectedHour] = useState(9);
    const [selectedMinute, setSelectedMinute] = useState(0);
    const [selectedPeriod, setSelectedPeriod] = useState('AM');

    const hourRef = useRef(null);
    const minuteRef = useRef(null);
    const periodRef = useRef(null);

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 60 }, (_, i) => i);
    const periods = ['AM', 'PM'];

    // Initialize from value prop
    useEffect(() => {
        if (value) {
            const [hours, minutes] = value.split(':');
            const hourNum = parseInt(hours);
            const minuteNum = parseInt(minutes);

            if (hourNum === 0) {
                setSelectedHour(12);
                setSelectedPeriod('AM');
            } else if (hourNum === 12) {
                setSelectedHour(12);
                setSelectedPeriod('PM');
            } else if (hourNum > 12) {
                setSelectedHour(hourNum - 12);
                setSelectedPeriod('PM');
            } else {
                setSelectedHour(hourNum);
                setSelectedPeriod('AM');
            }

            setSelectedMinute(minuteNum);
        }
    }, [value]);

    const formatTime = (hour, minute, period) => {
        let hour24 = hour;
        if (period === 'AM' && hour === 12) {
            hour24 = 0;
        } else if (period === 'PM' && hour !== 12) {
            hour24 = hour + 12;
        }

        return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    };

    const formatDisplayTime = (hour, minute, period) => {
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
    };

    const handleSet = () => {
        const timeString = formatTime(selectedHour, selectedMinute, selectedPeriod);
        onChange(timeString);
        setIsOpen(false);
    };

    const handleCancel = () => {
        setIsOpen(false);
    };

    const handleSetNow = () => {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();

        if (hour === 0) {
            setSelectedHour(12);
            setSelectedPeriod('AM');
        } else if (hour === 12) {
            setSelectedHour(12);
            setSelectedPeriod('PM');
        } else if (hour > 12) {
            setSelectedHour(hour - 12);
            setSelectedPeriod('PM');
        } else {
            setSelectedHour(hour);
            setSelectedPeriod('AM');
        }

        setSelectedMinute(minute);
    };

    const ScrollableColumn = ({ items, selected, onSelect, formatItem, containerRef }) => {
        const itemHeight = 40;
        const visibleItems = 5;
        const containerHeight = itemHeight * visibleItems;

        useEffect(() => {
            if (containerRef?.current) {
                const selectedIndex = items.indexOf(selected);
                const scrollTop = selectedIndex * itemHeight - (containerHeight / 2) + (itemHeight / 2);
                containerRef.current.scrollTop = Math.max(0, scrollTop);
            }
        }, [selected, items, containerRef]);

        const handleScroll = (e) => {
            const scrollTop = e.target.scrollTop;
            const selectedIndex = Math.round((scrollTop + containerHeight / 2 - itemHeight / 2) / itemHeight);
            const clampedIndex = Math.max(0, Math.min(items.length - 1, selectedIndex));
            onSelect(items[clampedIndex]);
        };

        return (
            <div className="flex flex-col items-center relative">
                <div
                    ref={containerRef}
                    className="overflow-y-auto scrollbar-hide relative"
                    style={{ height: containerHeight }}
                    onScroll={handleScroll}
                >
                    {/* Padding items at the start */}
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={`pad-start-${i}`} className="h-10 flex items-center justify-center" />
                    ))}

                    {items.map((item, index) => (
                        <div
                            key={item}
                            className={`h-10 flex items-center justify-center text-lg font-medium cursor-pointer transition-all duration-200 ${selected === item
                                    ? 'text-black font-semibold'
                                    : 'text-gray-400'
                                }`}
                            onClick={() => onSelect(item)}
                        >
                            {formatItem ? formatItem(item) : item}
                        </div>
                    ))}

                    {/* Padding items at the end */}
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={`pad-end-${i}`} className="h-10 flex items-center justify-center" />
                    ))}
                </div>

                {/* Selection indicator */}
                <div
                    className="absolute bg-gray-100 rounded-lg pointer-events-none"
                    style={{
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '90%',
                        height: itemHeight,
                        zIndex: 1
                    }}
                />
            </div>
        );
    };

    return (
        <>
            <div className={`relative ${className}`}>
                {/* Input Field */}
                <div className="flex items-center">
                    <Clock size={16} className="absolute left-3 text-gray-400 z-10 pointer-events-none" />
                    <input
                        type="text"
                        value={value ? formatDisplayTime(selectedHour, selectedMinute, selectedPeriod) : ''}
                        placeholder={placeholder}
                        onClick={() => setIsOpen(true)}
                        readOnly
                        className="w-full bg-white border border-gray-300 rounded-xl p-3 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors cursor-pointer"
                    />
                </div>

                {/* Modal Overlay */}
                {isOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center">
                        <div className="bg-white rounded-2xl shadow-xl w-80 mx-4">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Set time</h3>
                                <button
                                    onClick={handleCancel}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Current Time Display */}
                            <div className="px-4 py-3 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-light text-gray-900">
                                        {formatDisplayTime(selectedHour, selectedMinute, selectedPeriod)}
                                    </span>
                                    <button
                                        onClick={handleSetNow}
                                        className="text-blue-500 font-medium hover:text-blue-600 transition-colors"
                                    >
                                        NOW
                                    </button>
                                </div>
                            </div>

                            {/* Time Picker */}
                            <div className="p-4">
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="text-center">
                                        <div className="text-sm font-medium text-gray-600 mb-2">Hour</div>
                                        <ScrollableColumn
                                            items={hours}
                                            selected={selectedHour}
                                            onSelect={setSelectedHour}
                                            containerRef={hourRef}
                                        />
                                    </div>

                                    <div className="text-center">
                                        <div className="text-sm font-medium text-gray-600 mb-2">Minute</div>
                                        <ScrollableColumn
                                            items={minutes}
                                            selected={selectedMinute}
                                            onSelect={setSelectedMinute}
                                            formatItem={(item) => item.toString().padStart(2, '0')}
                                            containerRef={minuteRef}
                                        />
                                    </div>

                                    <div className="text-center">
                                        <div className="text-sm font-medium text-gray-600 mb-2">AM/PM</div>
                                        <ScrollableColumn
                                            items={periods}
                                            selected={selectedPeriod}
                                            onSelect={setSelectedPeriod}
                                            containerRef={periodRef}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 p-4 pt-0">
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 py-3 px-4 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSet}
                                    className="flex-1 py-3 px-4 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
                                >
                                    Set
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </>
    );
};

export default TimePicker;