import React, { useState, useEffect } from "react";
import { User, Mail, Phone, ChevronRight, ChevronLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import API_URL from "../constants/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PendingApprovalSection = () => {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;
  const navigate = useNavigate();
  // Fetch pending users
  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/partner/pending`);

      console.log("Pending users:", response.data);
      setPendingUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      setPendingUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on component mount
  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleViewDetails = (id) => {
    console.log(`View details for user ${id}`);
    navigate(`/partner/${id}`);
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    const colors = {
      Guide: "bg-blue-100 text-blue-700",
      Driver: "bg-green-100 text-green-700",
      Creator: "bg-purple-100 text-purple-700",
      Traveler: "bg-gray-100 text-gray-700",
    };
    return colors[role] || "bg-gray-100 text-gray-700";
  };

  // Calculate pagination
  const totalPages = Math.ceil(pendingUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = pendingUsers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="bg-white flex-1 flex flex-col ">
      {/* Header */}
      <div className="flex-1 lg:flex-none">
        <h1 className="text-xl font-semibold text-gray-900 ">Review needed</h1>
        <p className="  text-black/60">Awaiting review and confirmation</p>
      </div>

      {/* Users List */}
      <div className="grid grid-cols-4 gap-4 mt-8">
        {loading ? (
          <div className="py-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-2">Loading pending users...</p>
          </div>
        ) : pendingUsers.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">No pending users</p>
          </div>
        ) : (
          <>
            {paginatedUsers.map((item) => (
              <div
                key={item.user_id}
                className="flex items-center w-full  justify-center border-2 rounded-xl  border-gray-300 hover:bg-gray-50 cursor-pointer"
              >
                <div className="py-8 space-y-4 w-full">
                  {/* User Profile Picture */}
                  <div className="">
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
                      <h3 className="font-semibold text-base text-black/80  text-center">
                        {item.first_name} {item.last_name}
                      </h3>
                      {/* <div className="flex justify-center items-center gap-2 mb-1">
                        <Mail size={16} className="text-black/60" />
                        <span className="text-sm">{item.email}</span>
                      </div> */}
                      <div>
                        <h3 className="text-center">
                          {item.role === 'Driver'
                            ? 'Transportation Provider'
                            : item.role === 'Creator'
                              ? 'Activity Partner'
                              : 'Tour Guide'}
                        </h3>
                      </div>


                    </div>

                  </div>

                  {/* Role and Registration Date */}
                  <div className="w-full px-8 mt-8">

                    {/* <div className="text-sm text-black/60">
                      Registered:{" "}
                      {new Date(item.created_at).toLocaleDateString()}
                    </div> */}
                    <div className="text-sm text-center text-black/60">
                      Registered:{" "}
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => handleViewDetails(item.user_id)}
                      className="w-full border-2 rounded-full py-2 mt-2 font-medium text-[#397ff1]"
                    >
                      View Profile
                    </button>

                  </div>
                </div>

                {/* View Details Action */}
                {/* <div className="flex flex-col gap-2 items-center relative px-8">
                  <button
                    onClick={() => handleViewDetails(item.user_id)}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm font-normal hover:bg-gray-100 transition-colors"
                  >
                    More <ChevronRight size={16} />
                  </button>
                </div> */}
              </div>
            ))}


          </>
        )}
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`p-2 rounded-md ${currentPage === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-black/70 hover:bg-gray-100"
              }`}
          >
            <ChevronLeft size={20} />
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-1 rounded-md text-sm ${currentPage === index + 1
                ? "bg-[#397ff1] text-white"
                : "text-black/70 hover:bg-gray-100"
                }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-md ${currentPage === totalPages
              ? "text-gray-400 cursor-not-allowed"
              : "text-black/70 hover:bg-gray-100"
              }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PendingApprovalSection;