import React, { useState, useEffect } from "react";
import { MapPinIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import API_URL from "../constants/api";
import axios from "axios";

const PendingApprovalSection = () => {
  const { user } = useAuth();
  const [pendingActivities, setPendingActivities] = useState([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="bg-white flex-1 shadow-sm flex flex-col rounded-2xl">
      {/* Header */}
      <div className="flex justify-between border-b border-gray-200 px-6">
        <h1 className="text-lg font-medium text-black/80 py-4">
          Pending for approval
        </h1>
        <h1 className="text-sm font-medium text-[#397ff1] py-4 cursor-pointer hover:text-[#2d6bd4]">
          See all ({pendingActivities.length})
        </h1>
      </div>

      {/* Activities List */}
      <div className="flex flex-col px-6 py-4 gap-3 max-h-[400px] overflow-y-auto">
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
          pendingActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors"
            >
              {/* Left Section - Image & Details */}
              <div className="flex items-center gap-4 flex-1">
                {/* Activity Image */}
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {activity.images && activity.images.length > 0 ? (
                    <img
                      src={`${API_URL}/${activity.images[0]}`}
                      alt={activity.title}
                      className="object-cover w-full h-full"
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

                {/* Activity Info */}
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <h3 className="font-medium text-sm text-black/80 truncate">
                    {activity.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-black/60 flex-shrink-0" />
                    <span className="text-sm text-black/60 truncate">
                      {activity.destination_name}
                      {activity.location && `, ${activity.location}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-black/50">
                    {/* <span className="font-medium text-black">
                      ₱{Number(activity.price).toLocaleString()} /{" "}
                      {activity.unit}
                    </span> */}
                    {activity.tags && activity.tags.length > 0 && (
                      <>
                        <span className="truncate">
                          {activity.tags.slice(0, 2).join(", ")}
                          {activity.tags.length > 2 &&
                            ` +${activity.tags.length - 2}`}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Section - Actions */}
              <div className="relative group">
                <button
                  onClick={() => handleViewDetails(activity.id)}
                  className="p-2 text-black/60 hover:text-black/80 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
                {/* Tooltip */}
                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  View details
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PendingApprovalSection;
