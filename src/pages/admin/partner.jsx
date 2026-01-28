import React, { useState, useEffect } from "react";
import {
  User,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MapPin,
  LayoutGrid,
  List,
  MoreHorizontal,
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

  const [viewMode, setViewMode] = useState("card"); // ✅ card | table

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
  }, [selectedTab, selectedRole, searchText, viewMode]);

  const handleViewDetails = (id) => {
    navigate(`/partner/${id}`);
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      Driver: "Transportation",
      Creator: "Activity Partner",
      Guide: "Tour Guide",
    };
    return roleNames[role] || role;
  };

  const getRoleBadgeStyle = (role) => {
    const styles = {
      Driver: "text-black/70",
      Creator: "text-black/70",
      Guide: "text-black/70",
    };
    return styles[role] || "text-gray-500";
  };

  const getPartnerLocation = (partner) => {
    if (!partner.profile) return null;

    if (partner.role === "Guide") return partner.profile.city;
    if (partner.role === "Driver") return partner.profile.city;
    if (partner.role === "Creator")
      return partner.profile.business_address || partner.profile.city;

    return null;
  };

  // ✅ Robust subscription getter (works even if backend shape changes)
  const getPartnerSubscriptionStatus = (partner) => {
    const sub =
      partner?.subscription ||
      partner?.partner_subscription ||
      partner?.partnerSubscription ||
      partner?.active_subscription ||
      partner?.activeSubscription ||
      partner?.subscription_details ||
      null;

    const raw =
      sub?.status ||
      partner?.subscription_status ||
      partner?.subscriptionStatus ||
      null;

    const s = String(raw || "").toLowerCase().trim();
    if (!s) return "—";

    // normalize expected enums: trialing | active | expired | canceled
    if (["trialing", "active", "expired", "canceled", "cancelled"].includes(s)) {
      return s === "cancelled" ? "canceled" : s;
    }
    return s; // fallback (in case you have "inactive" etc)
  };

  const getSubscriptionPillStyle = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "active") return "bg-green-50 text-green-700";
    if (s === "trialing") return "bg-blue-50 text-blue-700";
    if (s === "expired") return "bg-amber-50 text-amber-700";
    if (s === "canceled") return "bg-red-50 text-red-700";
    return "bg-gray-50 text-gray-700";
  };

  const getPartnerSkills = (partner) => {
    if (!partner.profile) return [];

    if (partner.role === "Guide") {
      const skills = [];
      if (partner.profile.languages) {
        const langs =
          typeof partner.profile.languages === "string"
            ? JSON.parse(partner.profile.languages)
            : partner.profile.languages;
        if (Array.isArray(langs)) skills.push(...langs.slice(0, 2));
      }
      if (partner.profile.specialization) skills.push(partner.profile.specialization);
      return skills.slice(0, 3);
    } else if (partner.role === "Driver") {
      const skills = [];
      if (partner.profile.vehicles && partner.profile.vehicles.length > 0) {
        partner.profile.vehicles.forEach((v) => {
          if (v.vehicle_type && !skills.includes(v.vehicle_type)) skills.push(v.vehicle_type);
        });
      }
      return skills.slice(0, 3);
    } else if (partner.role === "Creator") {
      const skills = [];
      if (partner.profile.activity_types) {
        const types =
          typeof partner.profile.activity_types === "string"
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
    const roleDisplay = getRoleDisplayName(partner.role || "").toLowerCase().trim();

    const q = searchText.toLowerCase().trim();

    const matchesSearch =
      !q || first.includes(q) || last.includes(q) || email.includes(q) || roleDisplay.includes(q);

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

  const getStatusDot = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "approved") return "bg-green-500";
    if (s === "rejected") return "bg-red-500";
    if (s === "pending") return "bg-yellow-500";
    return "bg-gray-400";
  };

  return (
    <div className="min-h-screen pb-48">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Partners Management</h1>
            <p className="text-black/60 mt-1">Manage your partner applications and profiles</p>
          </div>
        </div>

        {/* Filters + Controls */}
        <div className="bg-white rounded-lg mb-6">
          <div className="py-4">
            <div className="flex justify-between items-center">
              {/* Tab Navigation */}
              <div className="flexrounded-lg w-fit p-2">
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

              {/* Layout Toggle + Role Filter + Search */}
              <div className="flex items-center gap-4">
                {/* Layout Toggle */}
                <div className="flex bg-gray-50 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("card")}
                    className={`p-2 rounded transition-colors ${viewMode === "card"
                      ? "bg-white text-black/80 shadow-sm"
                      : "text-black/50 hover:text-black/70"
                      }`}
                    title="Card view"
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-2 rounded transition-colors ${viewMode === "table"
                      ? "bg-white text-black/80 shadow-sm"
                      : "text-black/50 hover:text-black/70"
                      }`}
                    title="Table view"
                  >
                    <List size={16} />
                  </button>
                </div>

                {/* Role Filter */}
                <div className="relative">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black/80"
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
                    className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="bg-white rounded-lg">
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
                <p className="text-gray-500 mt-2">Loading partners...</p>
              </div>
            ) : paginatedPartners.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">No partners found</p>
              </div>
            ) : viewMode === "card" ? (
              // CARD VIEW
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedPartners.map((item) => {
                  const location = getPartnerLocation(item);
                  const skills = getPartnerSkills(item);

                  return (
                    <div
                      key={item.user_id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-5"
                    >
                      <div className="flex gap-10">
                        {/* Left: Profile */}
                        <div className="flex flex-col items-center">
                          <div className="w-[120px] h-[120px] bg-gray-50 rounded-full flex items-center justify-center overflow-hidden border-[3px] border-white shadow-sm">
                            {item.profile_pic ? (
                              <img
                                src={`${API_URL}/${item.profile_pic}`}
                                alt={`${item.first_name} ${item.last_name}`}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <User size={26} className="text-gray-300" />
                            )}
                          </div>

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
                        <div className="flex-1 min-w-0 mt-8">
                          <span className={`text-xs font-medium ${getRoleBadgeStyle(item.role)}`}>
                            {getRoleDisplayName(item.role)}
                          </span>

                          <div className="flex items-center">
                            <h3 className="font-semibold text-black/90 capitalize truncate">
                              {item.first_name} {item.last_name}
                            </h3>
                            {item?.status === "Approved" && (
                              <CheckBadgeIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                            {location && (
                              <div className="flex items-center gap-1 text-black/80">
                                <MapPin size={16} />
                                <span className="truncate max-w-[140px]">{location}</span>
                              </div>
                            )}
                          </div>

                          {skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                              {skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1.5 bg-gray-100 text-black/60 text-sm font-medium rounded-full truncate max-w-[110px]"
                                  title={skill}
                                >
                                  {skill.length > 14 ? `${skill.substring(0, 12)}...` : skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // TABLE VIEW
              <>
                {/* Table Header */}
                <div className="bg-[#f8f8f8] px-4 rounded-lg py-4 grid grid-cols-[24px_1fr_160px_180px_180px_56px] gap-6 items-center text-sm font-base text-black/90">
                  <div className="justify-self-start">
                    <input type="checkbox" className="rounded" />
                  </div>
                  <div className="justify-self-start">Partner</div>
                  <div className="justify-self-center">Role</div>
                  {/* ✅ replace Location with Subscription */}
                  <div className="justify-self-center">Subscription</div>
                  <div className="justify-self-center">Status</div>
                  <div className="justify-self-end">Actions</div>
                </div>

                {/* Rows */}
                {paginatedPartners.map((item) => {
                  const subscriptionStatus = getPartnerSubscriptionStatus(item);

                  return (
                    <div key={item.user_id} className="py-4 hover:bg-gray-50">
                      <div className="px-4 grid grid-cols-[24px_1fr_160px_180px_180px_56px] gap-6 items-center">
                        {/* Checkbox */}
                        <div className="justify-self-start">
                          <input type="checkbox" className="rounded" />
                        </div>

                        {/* Partner */}
                        <div className="flex items-center gap-3 justify-self-start min-w-0">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {item.profile_pic ? (
                              <img
                                src={`${API_URL}/${item.profile_pic}`}
                                alt={`${item.first_name} ${item.last_name}`}
                                className="object-cover w-full h-full rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <User size={18} className="text-gray-400" />
                            )}
                          </div>

                          {/* ✅ limit name width so it doesn’t push other columns */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <h3 className="font-base text-sm text-black/80 truncate max-w-[320px]">
                                {item.first_name} {item.last_name}
                              </h3>
                              {item?.status === "Approved" && (
                                <CheckBadgeIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-black/60 truncate max-w-[320px]">
                              {item.email}
                            </p>
                          </div>
                        </div>

                        {/* Role */}
                        <div className="justify-self-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-md text-sm font-medium ${getRoleBadgeStyle(
                              item.role
                            )}`}
                          >
                            {getRoleDisplayName(item.role)}
                          </span>
                        </div>

                        {/* ✅ Subscription */}
                        <div className="justify-self-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getSubscriptionPillStyle(
                              subscriptionStatus
                            )}`}
                            title="Subscription status"
                          >
                            {subscriptionStatus === "—" ? "Not available" : subscriptionStatus}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="justify-self-center">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusDot(item.status)}`} />
                            <span className="text-sm capitalize text-black/70">
                              {String(item.status || "—").toLowerCase()}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="justify-self-end relative">
                          <button
                            onClick={() => toggleDropdown(item.user_id)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded"
                            title="Actions"
                          >
                            <MoreHorizontal size={16} />
                          </button>

                          {openDropdownId === item.user_id && (
                            <div className="absolute top-full mt-1 right-0 w-52 bg-white shadow-lg/10 rounded-md z-50 py-2 border border-gray-100">
                              <button
                                onClick={() => {
                                  handleViewDetails(item.user_id);
                                  setOpenDropdownId(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-black/70 hover:bg-gray-100"
                              >
                                View profile
                              </button>

                              <div className="border-t border-gray-200 my-2" />

                              {["Pending", "Approved", "Rejected"].map((s) => (
                                <button
                                  key={s}
                                  onClick={async () => {
                                    try {
                                      await axios.patch(`${API_URL}/partner/${item.user_id}/status`, {
                                        status: s,
                                      });
                                      setPartners((prev) =>
                                        prev.map((p) =>
                                          p.user_id === item.user_id ? { ...p, status: s } : p
                                        )
                                      );
                                    } catch (e) {
                                      console.error(e);
                                    } finally {
                                      setOpenDropdownId(null);
                                    }
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-black/70 hover:bg-gray-100"
                                >
                                  Set {s}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
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
                    className={`px-3 py-2 border rounded-lg ${currentPage === page
                      ? "bg-[#274b46] text-white/90 cursor-pointer hover:bg-[#376a63]"
                      : "border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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
  );
};

export default PartnersManagement;
