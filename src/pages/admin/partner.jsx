import React, { useState, useEffect } from "react";
import {
  User,
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  MapPin,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../constants/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

const PartnersManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [selectedTab, setSelectedTab] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const itemsPerPage = 16;

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/partner/all`);
      console.log("Partners:", response.data);
      setPartners(response.data || []);
    } catch (error) {
      console.error("Error fetching partners:", error);
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab, selectedRole, searchText]);

  const handleViewDetails = (id) => {
    console.log(`View details for user ${id}`);
    navigate(`/partner/${id}`);
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      Driver: "Transportation Provider",
      Creator: "Activity Partner",
      Guide: "Tour Guide",
    };
    return roleNames[role] || role;
  };

  // Role badge colors - softer/lighter
  const getRoleBadgeStyle = (role) => {
    const styles = {
      Driver: "bg-blue-50 text-blue-700",
      Creator: "bg-violet-50 text-violet-600",
      Guide: "bg-teal-50 text-green-600",
    };
    return styles[role] || "bg-gray-50 text-gray-500";
  };

  // Get location from profile based on role
  const getPartnerLocation = (partner) => {
    if (!partner.profile) return null;

    if (partner.role === "Guide") {
      return partner.profile.city;
    } else if (partner.role === "Driver") {
      return partner.profile.city;
    } else if (partner.role === "Creator") {
      return partner.profile.business_address || partner.profile.city;
    }
    return null;
  };

  // Get skills/tags from profile based on role
  const getPartnerSkills = (partner) => {
    if (!partner.profile) return [];

    if (partner.role === "Guide") {
      const skills = [];
      if (partner.profile.languages) {
        const langs = typeof partner.profile.languages === 'string'
          ? JSON.parse(partner.profile.languages)
          : partner.profile.languages;
        if (Array.isArray(langs)) skills.push(...langs.slice(0, 2));
      }
      if (partner.profile.specialization) skills.push(partner.profile.specialization);
      return skills.slice(0, 3);
    } else if (partner.role === "Driver") {
      const skills = [];
      if (partner.profile.vehicles && partner.profile.vehicles.length > 0) {
        partner.profile.vehicles.forEach(v => {
          if (v.vehicle_type && !skills.includes(v.vehicle_type)) {
            skills.push(v.vehicle_type);
          }
        });
      }
      return skills.slice(0, 3);
    } else if (partner.role === "Creator") {
      const skills = [];
      if (partner.profile.activity_types) {
        const types = typeof partner.profile.activity_types === 'string'
          ? JSON.parse(partner.profile.activity_types)
          : partner.profile.activity_types;
        if (Array.isArray(types)) skills.push(...types);
      }
      if (partner.profile.category) skills.push(partner.profile.category);
      return skills.slice(0, 3);
    }
    return [];
  };

  const filteredPartners = partners.filter((partner) => {
    const first = (partner.first_name || "").toLowerCase();
    const last = (partner.last_name || "").toLowerCase();
    const email = (partner.email || "").toLowerCase();
    const roleDisplay = getRoleDisplayName(partner.role || "")
      .toLowerCase()
      .trim();

    const q = searchText.toLowerCase().trim();

    const matchesSearch =
      !q ||
      first.includes(q) ||
      last.includes(q) ||
      email.includes(q) ||
      roleDisplay.includes(q);

    const matchesTab =
      selectedTab === "All" ||
      (partner.status || "").toLowerCase() === selectedTab.toLowerCase();

    const matchesRole =
      selectedRole === "All" ||
      (partner.role || "").toLowerCase() === selectedRole.toLowerCase();

    return matchesSearch && matchesTab && matchesRole;
  });

  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPartners = filteredPartners.slice(startIndex, endIndex);

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const updatePartnerStatus = async (userId, newStatus) => {
    try {
      const response = await axios.patch(`${API_URL}/partner/${userId}/status`, {
        status: newStatus,
      });

      if (response.status === 200) {
        setPartners((prevPartners) =>
          prevPartners.map((partner) =>
            partner.user_id === userId
              ? { ...partner, status: newStatus }
              : partner
          )
        );
      }
    } catch (error) {
      console.error("Error updating partner status:", error);
    } finally {
      setOpenDropdownId(null);
    }
  };

  return (
    <div className="min-h-screen ">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Partners Management
            </h1>
            <p className="text-black/60 mt-1">
              Manage your partner applications and profiles
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className=" rounded-lg mb-6">
          <div className="py-4">
            <div className="flex justify-between items-center">
              {/* Tab Navigation */}
              <div className="flex bg-gray-50 rounded-lg w-fit p-2">
                {["All", "Pending", "Approved", "Rejected"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`px-8 font-medium transition-colors py-2 rounded-lg ${selectedTab === tab
                      ? "bg-white text-black/80 shadow-sm/10"
                      : "text-black/50 hover:text-black/70"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Role Filter + Search */}
              <div className="flex items-center gap-3">
                {/* Role Filter */}
                <div className="relative">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2  -gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:-transparent text-black/80"
                  >
                    <option value="All">All roles</option>
                    <option value="Creator">Activity Partner</option>
                    <option value="Guide">Tour Guide</option>
                    <option value="Driver">Transportation Provider</option>
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                </div>

                {/* Search */}
                <div className="relative h-fit">
                  <Search
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search partners..."
                    className="w-full pl-4 pr-10 py-2  -gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:-transparent"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Partners Grid */}
        <div className=" rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-4">
            {loading ? (
              <div className="col-span-4 py-8 text-center">
                <div className="inline-block w-8 h-8 -4 -blue-500 -t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 mt-2">Loading partners...</p>
              </div>
            ) : paginatedPartners.length === 0 ? (
              <div className="col-span-4 py-8 text-center">
                <p className="text-gray-500">No partners found</p>
              </div>
            ) : (
              paginatedPartners.map((item) => {
                const location = getPartnerLocation(item);
                const skills = getPartnerSkills(item);

                return (
                  <div
                    key={item.user_id}
                    className="bg-white rounded-2xl  -gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-5"
                  >
                    {/* Card Layout - Profile left, Content right */}
                    <div className="flex gap-12">
                      {/* Left: Profile Picture & Buttons */}
                      <div className="flex flex-col items-center">
                        {/* Profile Picture */}
                        <div className="w-[120px] h-[120px] bg-gray-50 rounded-full flex items-center justify-center overflow-hidden -[3px] -white shadow-sm">
                          {item.profile_pic ? (
                            <img
                              src={`${API_URL}/${item.profile_pic}`}
                              alt={`${item.first_name} ${item.last_name}`}
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.parentElement.innerHTML =
                                  '<div class="flex items-center justify-center w-full h-full"><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>';
                              }}
                            />
                          ) : (
                            <User size={26} className="text-gray-300" />
                          )}
                        </div>

                        {/* Action Buttons - Under profile pic */}
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleViewDetails(item.user_id)}
                            className="px-3 py-1.5 text-sm font-medium text-black/80 bg-white hover:bg-gray-50 rounded-lg border border-gray-300 transition-colors"
                          >
                            View profile
                          </button>

                        </div>
                      </div>

                      {/* Right: Content */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        {/* Role Badge */}
                        <span
                          className={`inline-block px-3 py-1 rounded-md text-sm font-medium ${getRoleBadgeStyle(
                            item.role
                          )}`}
                        >
                          {getRoleDisplayName(item.role)}
                        </span>

                        {/* Name + Verification */}
                        <div className="flex items-center gap-1.5 mt-3">
                          <h3 className="font-semibold text-black/90 capitalize truncate">
                            {item.first_name} {item.last_name}
                          </h3>
                          {item?.status === "Approved" && (
                            <CheckBadgeIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                          )}
                        </div>

                        {/* Status + Location Row */}
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                          {/* <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${item.status === "Approved"
                              ? "bg-emerald-50 text-emerald-500"
                              : item.status === "Rejected"
                                ? "bg-rose-50 text-rose-400"
                                : "bg-amber-50 text-amber-500"
                              }`}
                          >
                            {item.status}
                          </span> */}
                          {location && (
                            <div className="flex items-center gap-1 text-black/80">
                              <MapPin size={16} />
                              <span className="text- truncate max-w-[100px]">
                                {location}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Skills/Tags */}
                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {skills.map((skill, index) => (
                              <span
                                key={index}
                                className="px-3 py-1.5 bg-gray-100 text-black/60 text-sm font-medium rounded-full truncate max-w-[90px]  -gray-100"
                                title={skill}
                              >
                                {skill.length > 10
                                  ? `${skill.substring(0, 8)}...`
                                  : skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-
              {Math.min(startIndex + itemsPerPage, filteredPartners.length)} of{" "}
              {filteredPartners.length} partners
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2  -gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>

              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2  rounded-lg ${currentPage === page
                      ? "bg-[#397ff1] text-white cursor-pointer hover:bg-[#2e6bd4]"
                      : "-gray-300 hover:bg-gray-50"
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
                className="p-2  -gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnersManagement;