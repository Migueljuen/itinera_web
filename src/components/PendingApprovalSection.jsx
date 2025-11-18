import React, { useState, useEffect } from "react";
import { MapPin, Calendar, ChevronRight, ChevronLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import API_URL from "../constants/api";
import axios from "axios";

const PendingApprovalSection = () => {
  const { user } = useAuth();
  const [pendingActivities, setPendingActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch pending experiences
  const fetchPendingExperiences = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/experience/pending`);

      console.log("Pending experiences:", response.data);
      setPendingActivities(response.data || []);
    } catch (error) {
      console.error("Error fetching pending experiences:", error);
      setPendingActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on component mount
  useEffect(() => {
    fetchPendingExperiences();
  }, []);

  const handleViewDetails = (id) => {
    console.log(`View details for activity ${id}`);
    // Navigate to details page or open modal
    // navigate(`/admin/experience/${id}`);
  };

  // Calculate pagination
  const totalPages = Math.ceil(pendingActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedActivities = pendingActivities.slice(startIndex, endIndex);

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
      <div className="flex justify-between ">
        <h1 className="text-lg font-medium text-black/80 py-4">
          Pending for approval
        </h1>
        {/* <h1 className="text-sm font-medium text-[#397ff1] py-4 cursor-pointer hover:text-[#2d6bd4]">
          See all ({pendingActivities.length})
        </h1> */}
      </div>

      {/* Activities List */}
      <div className="flex flex-col py-4 gap-3 overflow-y-auto">
        {loading ? (
          <div className="py-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-2">Loading pending activities...</p>
          </div>
        ) : pendingActivities.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">No pending activities</p>
          </div>
        ) : (
          <>
            {paginatedActivities.map((item) => (
              <div
                key={item.experience_id || item.id}
                className="py-6 mb-4 flex items-center justify-between border rounded-xl border-gray-300 hover:bg-gray-50"
              >
                <div className="grid grid-cols-[100px_300px_220px] gap-4">
                  {/* Activity Image */}
                  <div className="text-center px-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg mx-auto flex items-center justify-center overflow-hidden">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={`${API_URL}/${item.images[0]}`}
                          alt={item.title}
                          className="object-cover w-full h-full rounded-lg"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML =
                              '<span class="text-gray-400 text-xs">No image</span>';
                          }}
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">No image</span>
                      )}
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
                          {item.location && `, ${item.location}`}
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
                        ₱{Number(item.price).toLocaleString()}
                      </span>
                      <span className="text-sm text-black/60">
                        /{item.unit}
                      </span>
                    </div>

                  </div>
                </div>

                {/* View Details Action */}
                <div className="flex flex-col gap-2 items-center relative px-8">
                  <button
                    onClick={() =>
                      handleViewDetails(item.experience_id || item.id)
                    }
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm font-normal hover:bg-gray-100 transition-colors"
                  >
                    More <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}

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
          </>
        )}
      </div>
    </div>
  );
};

export default PendingApprovalSection;