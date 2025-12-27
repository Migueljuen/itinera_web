import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
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
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const itemsPerPage = 16;

  // Fetch partners
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

  // Fetch on component mount
  useEffect(() => {
    fetchPartners();
  }, []);

  // Reset to first page when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab, searchText]);

  const handleViewDetails = (id) => {
    console.log(`View details for user ${id}`);
    navigate(`/partner/${id}`);
  };

  // Get role display name
  const getRoleDisplayName = (role) => {
    const roleNames = {
      Driver: "Transportation Provider",
      Creator: "Activity Partner",
      Guide: "Tour Guide",
    };
    return roleNames[role] || role;
  };

  // Filter partners based on search and tab
  const filteredPartners = partners.filter((partner) => {
    const matchesSearch =
      partner.first_name.toLowerCase().includes(searchText.toLowerCase()) ||
      partner.last_name.toLowerCase().includes(searchText.toLowerCase()) ||
      partner.email.toLowerCase().includes(searchText.toLowerCase()) ||
      getRoleDisplayName(partner.role)
        .toLowerCase()
        .includes(searchText.toLowerCase());

    const matchesTab =
      selectedTab === "All" ||
      partner.status.toLowerCase() === selectedTab.toLowerCase();

    return matchesSearch && matchesTab;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPartners = filteredPartners.slice(startIndex, endIndex);

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  // Update partner status
  const updatePartnerStatus = async (userId, newStatus) => {
    try {
      const response = await axios.patch(
        `${API_URL}/partner/${userId}/status`,
        { status: newStatus }
      );

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
    <div className="min-h-screen">
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
        <div className="bg-white rounded-lg mb-6">
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

              {/* Search */}
              <div className="relative h-fit">
                <Search
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search partners..."
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Partners Grid */}
        <div className="bg-white rounded-lg">
          <div className="grid grid-cols-4 gap-4">
            {loading ? (
              <div className="col-span-4 py-8 text-center">
                <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 mt-2">Loading partners...</p>
              </div>
            ) : paginatedPartners.length === 0 ? (
              <div className="col-span-4 py-8 text-center">
                <p className="text-gray-500">No partners found</p>
              </div>
            ) : (
              paginatedPartners.map((item) => (
                <div
                  key={item.user_id}
                  className="flex items-center w-full justify-center border-2 rounded-xl border-gray-300 hover:bg-gray-50 cursor-pointer relative"
                >
                  <div className="py-8 space-y-4 w-full">
                    {/* User Profile Picture */}
                    <div>
                      <div className="size-36 bg-gray-200 rounded-full mx-auto flex items-center justify-center overflow-hidden">
                        {item.profile_pic ? (
                          <img
                            src={`${API_URL}/${item.profile_pic}`}
                            alt={`${item.first_name} ${item.last_name}`}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentElement.innerHTML =
                                '<div class="flex items-center justify-center w-full h-full"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>';
                            }}
                          />
                        ) : (
                          <User size={32} className="text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* User Details */}
                    <div className="text-base font-medium text-black/60 px-4 flex flex-col justify-around">
                      <div>
                        <div className="flex gap-1 justify-center">
                          <h3 className="font-semibold text-base text-black/80 ">
                            {item.first_name} {item.last_name}

                          </h3>
                          {item?.status === "Approved" && (
                            <CheckBadgeIcon className="size-5 text-blue-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-center">
                            {getRoleDisplayName(item.role)}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="w-full px-8 mt-8">
                      <div className="text-sm text-center text-black/60 mb-2">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${item.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : item.status === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="text-sm text-center text-black/60 mb-2">
                        Registered:{" "}
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => handleViewDetails(item.user_id)}
                        className="w-full border-2 rounded-full py-2 font-medium text-[#397ff1]"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => toggleDropdown(item.user_id)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <ChevronDown size={16} />
                    </button>

                    {openDropdownId === item.user_id && (
                      <div className="absolute top-full right-0 mt-1 w-48 bg-white shadow-lg rounded-md z-50 border border-gray-200">
                        <p className="text-sm p-3 font-medium text-black/80 border-b">
                          Update Status
                        </p>
                        {["Approved", "Rejected", "Pending"].map((status) => (
                          <button
                            key={status}
                            onClick={() =>
                              updatePartnerStatus(item.user_id, status)
                            }
                            className="block w-full text-left px-4 py-2 text-sm text-black/60 hover:bg-gray-100"
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
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
                      ? "bg-[#397ff1] text-white cursor-pointer hover:bg-[#2e6bd4]"
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
  );
};

export default PartnersManagement;