import React, { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";

const BookingFilters = ({
  bookings = [],
  searchText,
  setSearchText,
  onFilterChange
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });
  const [selectedExperience, setSelectedExperience] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get unique experiences from bookings
  const uniqueExperiences = [...new Set(bookings.map(b => b.experience_title))].sort();

  // Count active filters
  const activeFiltersCount = [
    dateFilter !== "all",
    selectedExperience !== "all",
    statusFilter !== "all",
  ].filter(Boolean).length;

  // Apply filters
  React.useEffect(() => {
    onFilterChange({
      dateFilter,
      customDateRange,
      selectedExperience,
      statusFilter,
    });
  }, [dateFilter, customDateRange, selectedExperience, statusFilter]);

  const clearAllFilters = () => {
    setDateFilter("all");
    setCustomDateRange({ start: "", end: "" });
    setSelectedExperience("all");
    setStatusFilter("all");
  };

  return (
    <div className="bg-white rounded-lg">


      {/* Advanced Filters Panel */}
      <AnimatePresence>

        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="pb-4 rounded-lg ">
            <div className="flex justify-between items-center mb-4">

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <X size={14} />
                  Clear all filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>

                {dateFilter === "custom" && (
                  <div className="mt-2 space-y-2">
                    <input
                      type="date"
                      value={customDateRange.start}
                      onChange={(e) =>
                        setCustomDateRange({
                          ...customDateRange,
                          start: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Start date"
                    />
                    <input
                      type="date"
                      value={customDateRange.end}
                      onChange={(e) =>
                        setCustomDateRange({
                          ...customDateRange,
                          end: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="End date"
                    />
                  </div>
                )}
              </div>

              {/* Experience Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity
                </label>
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Activity</option>
                  {uniqueExperiences.map((exp) => (
                    <option key={exp} value={exp}>
                      {exp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Booking Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Active Filters Summary */}
            {activeFiltersCount > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {dateFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    Date: {dateFilter === "custom"
                      ? `${customDateRange.start ? dayjs(customDateRange.start).format('MMM D') : '...'} - ${customDateRange.end ? dayjs(customDateRange.end).format('MMM D') : '...'}`
                      : dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1)}
                    <button
                      onClick={() => {
                        setDateFilter("all");
                        setCustomDateRange({ start: "", end: "" });
                      }}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                {selectedExperience !== "all" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {selectedExperience}
                    <button
                      onClick={() => setSelectedExperience("all")}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                {statusFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                    <button
                      onClick={() => setStatusFilter("all")}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>

      </AnimatePresence>
    </div>
  );
};

export default BookingFilters;