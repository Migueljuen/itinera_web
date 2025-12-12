import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Edit3,
  Eye,
  EyeOff,
  Trash2,
  Calendar,
  LayoutGrid,
  List,
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
const ExperienceManagement = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [viewMode, setViewMode] = useState("card"); // or 'table'
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

  const handleCreateListing = useCallback(() => {
    navigate("/owner/create");
  }, [navigate]);

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
      <div className="min-h-screen">
        <div className="">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Activity Management
              </h1>
              <p className="text-black/60 mt-1">
                Manage your experiential offerings
              </p>
            </div>
            <div className="flex gap-3">
              {/* <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download size={16} />
                Export
              </button> */}
              <button
                onClick={handleCreateListing}
                className="flex items-center gap-2 px-4 py-2 bg-black/80 text-white rounded-lg hover:bg-black/70 cursor-pointer"
              >
                <Plus size={16} />
                Create Listing
              </button>
            </div>
          </div>

          {/* Activities Table */}
          <div className="bg-white rounded-lg">
            {/* Table Header */}
            <div className="py-4">
              {/* Search and Filters */}
              <div className="bg-white rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  {/* Tab Navigation */}
                  <div className="flex bg-gray-50 rounded-lg w-fit p-2">
                    {["All", "Active", "Inactive", "Draft", "Pending"].map(
                      (tab) => (
                        <button
                          key={tab}
                          onClick={() => setSelectedTab(tab)}
                          className={`px-8 font-medium transition-colors py-2 rounded-lg ${
                            selectedTab === tab
                              ? "bg-white text-black/80 shadow-sm/10"
                              : "text-black/50 hover:text-black/70"
                          }`}
                        >
                          {tab}
                        </button>
                      )
                    )}
                  </div>

                  {/* Layout Toggle and Search */}
                  <div className="flex items-center gap-4">
                    {/* Layout Toggle */}
                    <div className="flex bg-gray-50 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode("card")}
                        className={`p-2 rounded transition-colors ${
                          viewMode === "card"
                            ? "bg-white text-black/80 shadow-sm"
                            : "text-black/50 hover:text-black/70"
                        }`}
                        title="Card view"
                      >
                        <LayoutGrid size={16} />
                      </button>
                      <button
                        onClick={() => setViewMode("table")}
                        className={`p-2 rounded transition-colors ${
                          viewMode === "table"
                            ? "bg-white text-black/80 shadow-sm"
                            : "text-black/50 hover:text-black/70"
                        }`}
                        title="Table view"
                      >
                        <List size={16} />
                      </button>
                    </div>

                    {/* Search */}
                    <div className="relative h-fit">
                      <Search
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <input
                        type="text"
                        placeholder="Search activities..."
                        className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading activities...</p>
                </div>
              ) : paginatedExperiences.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-500">No activities found</p>
                </div>
              ) : viewMode === "card" ? (
                // CARD VIEW
                paginatedExperiences.map((item) => (
                  <div
                    key={item.experience_id}
                    className="py-6 mb-4 flex items-center justify-between border rounded-xl border-gray-300 hover:bg-gray-50"
                  >
                    <div className="grid grid-cols-[100px_300px_220px] gap-4">
                      {/* Activity Image */}
                      <div className="text-center px-4">
                        <div className="w-24 h-24 bg-gray-200 rounded-lg mx-auto flex items-center justify-center overflow-hidden">
                          <img
                            src={`${API_URL}/${item.images[0]}`}
                            alt={item.title}
                            className="object-cover w-full h-full rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Activity Details */}
                      <div className="text-sm font-medium text-black/60 px-4 flex flex-col justify-around">
                        <div>
                          <h3 className="font-medium text-base text-black/80 mb-1">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-black/60" />
                            <span className="text-sm">
                              {item.destination_name}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar size={16} className="text-black/60" />
                          <span className="text-sm">
                            {item.availabilitySummary?.join(", ") ||
                              "No availability set"}
                          </span>
                        </div>
                      </div>

                      {/* Price and Status */}
                      <div className="flex flex-col justify-around px-4">
                        <div>
                          <span className="text-lg font-semibold text-black/80">
                            ₱{item.price.toLocaleString()}
                          </span>
                          <span className="text-sm text-black/60">
                            /{item.unit}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              item.status === "active"
                                ? "bg-green-500"
                                : item.status === "inactive"
                                ? "bg-gray-500"
                                : "bg-yellow-500"
                            }`}
                          ></div>
                          <span className="text-sm capitalize text-black/70">
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Dropdown */}
                    <div className="flex flex-col gap-2 items-center relative px-8">
                      <button
                        onClick={() => toggleDropdown(item.experience_id)}
                        className="flex items-center justify-between gap-2 px-2 py-1 rounded-md text-sm font-normal capitalize"
                      >
                        More <ChevronDown size={16} />
                      </button>

                      {/* Dropdown */}

                      {openDropdownId === item.experience_id && (
                        <div className="absolute top-full mt-1 right-4  w-60 bg-white shadow-lg/10 rounded-md z-50 pb-4">
                          <p className="text-sm p-4 font-medium text-black/80">
                            General
                          </p>

                          {/* Edit button with navigation */}
                          <button
                            onClick={() => {
                              navigate(`/owner/edit/${item.experience_id}`);
                              setOpenDropdownId(null); // Close dropdown after click
                            }}
                            className="block w-full text-left px-4 py-1 text-sm text-black/60 hover:bg-gray-100"
                          >
                            Edit
                          </button>

                          {/* View Details button */}
                          {/* <button
                            onClick={() => {
                              console.log("View details");
                              setOpenDropdownId(null); // Close dropdown after click
                            }}
                            className="block w-full text-left px-4 py-1 text-sm text-black/60 hover:bg-gray-100"
                          >
                            View Details
                          </button> */}

                          <div className="border-t border-gray-200">
                            <p className="text-sm p-4 font-medium text-black/80">
                              Status
                            </p>
                            {["active", "inactive", "draft"].map((status) => (
                              <button
                                key={status}
                                onClick={() => {
                                  if (item.status === "pending") return; // prevent change
                                  updateExperienceStatus(
                                    item.experience_id,
                                    status
                                  );
                                  setOpenDropdownId(null);
                                }}
                                disabled={item.status === "pending"} // disable button
                                className={`block w-full text-left px-4 py-1 text-sm capitalize ${
                                  item.status === "pending"
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-black/60 hover:bg-gray-100"
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                // TABLE VIEW
                <>
                  {/* Table Header */}
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

                  {/* Table Rows */}
                  {paginatedExperiences.map((item) => (
                    <div
                      key={item.experience_id}
                      className="py-4 hover:bg-gray-50"
                    >
                      <div className="px-4 grid grid-cols-[24px_1fr_180px_120px_200px_56px] gap-6 items-center">
                        {/* Checkbox */}
                        <div className="justify-self-start">
                          <input type="checkbox" className="rounded" />
                        </div>

                        {/* Activity Name */}
                        <div className="flex items-center gap-3 justify-self-start">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <img
                              src={`${API_URL}/${item.images[0]}`}
                              alt={item.title}
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
                          {item.availabilitySummary?.join(", ") ||
                            "No availability"}
                        </div>

                        {/* Price */}
                        <div className="font-normal text-sm text-black/60 justify-self-center">
                          ₱{item.price.toLocaleString()}/{item.unit}
                        </div>

                        <div className="justify-self-center">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                item.status === "active"
                                  ? "bg-green-500"
                                  : item.status === "inactive"
                                  ? "bg-gray-500"
                                  : "bg-yellow-500"
                              }`}
                            ></div>
                            <span className="text-sm capitalize text-black/70">
                              {item.status}
                            </span>
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
                </>
              )}
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

export default ExperienceManagement;
