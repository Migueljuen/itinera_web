import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Edit3,
  Eye,
  EyeOff,
  Trash2,
  Calendar,
  Clock,
  Users,
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  Download,
  MoreHorizontal,
  ImageIcon,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../constants/api";
import toast, { Toaster } from "react-hot-toast";
const BookingManagement = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedTab, setSelectedTab] = useState("All");
  const [myExperiences, setMyExperiences] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const dayOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Create a mapping for day shortcuts
  const dayShortcuts = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
  };

  function summarizeAvailability(availability) {
    if (!availability || availability.length === 0) return [];

    const days = availability.map((a) => a.day_of_week);

    const sortedDays = days
      .map((d) => ({ day: d, index: dayOrder.indexOf(d) }))
      .sort((a, b) => a.index - b.index)
      .map((d) => d.day);

    const ranges = [];
    let start = sortedDays[0];
    let prevIndex = dayOrder.indexOf(sortedDays[0]);

    for (let i = 1; i < sortedDays.length; i++) {
      const currDay = sortedDays[i];
      const currIndex = dayOrder.indexOf(currDay);

      if (currIndex !== prevIndex + 1) {
        // Use shortcuts for range display
        ranges.push(
          start === dayOrder[prevIndex]
            ? dayShortcuts[start]
            : `${dayShortcuts[start]}-${dayShortcuts[dayOrder[prevIndex]]}`
        );
        start = currDay;
      }
      prevIndex = currIndex;
    }

    // Use shortcuts for final range
    ranges.push(
      start === dayOrder[prevIndex]
        ? dayShortcuts[start]
        : `${dayShortcuts[start]}-${dayShortcuts[dayOrder[prevIndex]]}`
    );

    return ranges;
  }
  // Function to fetch experiences
  const fetchExperiences = async () => {
    if (!user?.user_id) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/experience/user/${user.user_id}`
      );

      const processed = response.data.map((exp) => ({
        ...exp,
        availabilitySummary: summarizeAvailability(exp.availability),
      }));

      console.log("First processed exp:", processed[0]);

      setMyExperiences(processed);
    } catch (error) {
      console.error("Error fetching experiences:", error);
      setMyExperiences([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    if (user?.user_id) {
      fetchExperiences();
    }
  }, [user]);

  // Reset to first page when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab, searchText]);

  const filteredExperiences = myExperiences.filter((exp) => {
    const matchesSearch =
      exp.title.toLowerCase().includes(searchText.toLowerCase()) ||
      exp.destination_name.toLowerCase().includes(searchText.toLowerCase());
    const matchesTab =
      selectedTab === "All" ||
      exp.status.toLowerCase() === selectedTab.toLowerCase();
    return matchesSearch && matchesTab;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredExperiences.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedExperiences = filteredExperiences.slice(startIndex, endIndex);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-[#EAFFE7] text-[#27661E] ";
      case "draft":
        return "bg-yellow-100 text-yellow-700";
      case "inactive":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Function to update experience status
  const updateExperienceStatus = async (experienceId, newStatus) => {
    try {
      setUpdatingStatus(true);

      const response = await axios.patch(
        `${API_URL}/experience/${experienceId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setMyExperiences((prevExperiences) =>
          prevExperiences.map((exp) =>
            exp.experience_id === experienceId
              ? { ...exp, status: newStatus }
              : exp
          )
        );

        toast.success(`Experience status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error("Error updating experience status:", error);

      if (error.response?.status === 500) {
        await fetchExperiences();
      }

      toast.error("Failed to update experience status. Please try again.");
    } finally {
      setUpdatingStatus(false);
      setOpenDropdownId(false);
      setSelectedExperience(null);
    }
  };

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
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
      <div className="min-h-screen ">
        {/* <div className="max-w-[99%] mx-auto py-6"> */}
        <div className="">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Booking Management
              </h1>
              <p className="text-gray-600 mt-1">Manage your bookings</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download size={16} />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-black/80 text-white rounded-lg hover:bg-black/70 cursor-pointer">
                <Plus size={16} />
                Add Experience
              </button>
            </div>
          </div>

          {/* Experiences Table */}
          <div className="bg-white rounded-lg  ">
            {/* Table Header */}
            <div className=" py-4">
              {/* Search and Filters */}
              <div className="bg-white rounded-lg   mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Search "
                      className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              {/* Use a stable column template and vertically center items */}
              <div className="bg-[#f8f8f8] px-4 rounded-lg py-4 grid grid-cols-[24px_1fr_180px_120px_200px_56px] gap-6 items-center text-sm font-base text-black/90">
                <div className="justify-self-start">
                  <input type="checkbox" className="rounded" />
                </div>

                <div className="justify-self-start">Activity Name</div>

                <div className="justify-self-center">Availability</div>

                <div className="justify-self-center">Price</div>

                <div className="justify-self-center">Status</div>

                <div className="justify-self-end">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {paginatedExperiences.map((item) => (
                <div key={item.experience_id} className="py-4 hover:bg-gray-50">
                  <div className="px-4 grid grid-cols-[24px_1fr_180px_120px_200px_56px] gap-6 items-center">
                    {/* Checkbox */}
                    <div className="justify-self-start">
                      <input type="checkbox" className="rounded" />
                    </div>

                    {/* Activity Name */}
                    <div className="flex items-center gap-3 justify-self-start">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        {/* <ImageIcon size={24} className="text-gray-400" /> */}
                        <img
                          src={`${API_URL}/${item.images[0]}`}
                          size={24}
                          className="object-cover w-full h-full rounded-lg"
                        />
                      </div>
                      <div>
                        <h3 className="font-base text-sm text-black/80">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin size={14} className="text-gray-400" />
                          <span className="text-sm text-black/60">
                            {item.destination_name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Availability */}
                    <div className="text-sm text-gray-600 justify-self-center">
                      {item.availabilitySummary?.join(", ")}
                    </div>

                    {/* Price */}
                    <div className="font-normal text-sm text-black/60 justify-self-center">
                      ₱{item.price.toLocaleString()}/{item.unit}
                    </div>

                    <div className="justify-self-center">
                      <div className="flex flex-col gap-2 items-center relative">
                        <button
                          onClick={() => toggleDropdown(item.experience_id)}
                          className={`flex items-center justify-between gap-2 px-2 py-1 rounded-md text-sm font-normal capitalize ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status} <ChevronDown size={16} />
                        </button>

                        {/* Dropdown */}
                        {openDropdownId === item.experience_id && (
                          <div className="absolute  top-full mt-1 w-32 bg-white shadow-lg/5  rounded-md  z-50">
                            {["active", "inactive", "draft"].map((status) => (
                              <button
                                key={status}
                                onClick={() =>
                                  updateExperienceStatus(
                                    item.experience_id,
                                    status
                                  )
                                }
                                className="block w-full text-left p-4 text-sm text-black/80 hover:bg-gray-100 capitalize"
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="justify-self-end">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1}-
                {Math.min(
                  startIndex + ITEMS_PER_PAGE,
                  filteredExperiences.length
                )}{" "}
                of {filteredExperiences.length} activities
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>

                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 border rounded-lg ${
                        currentPage === page
                          ? "bg-[#274b46] text-white/90 cursor-pointer hover:bg-[#376a63]"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BookingManagement;
