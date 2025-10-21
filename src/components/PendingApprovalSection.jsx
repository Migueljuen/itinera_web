import React, { useState } from "react";
import { MapPinIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const PendingApprovalSection = () => {
  // Dummy data for pending activities
  const [pendingActivities, setPendingActivities] = useState([
    {
      id: 1,
      title: "Island Hopping Adventure",
      destination: "El Nido, Palawan",
      creator: "Maria Santos",
      creatorImage: null,
      price: 2500,
      unit: "person",
      submittedDate: "2025-10-18",
      image: null,
      status: "pending",
    },
    {
      id: 2,
      title: "Surfing Lessons for Beginners",
      destination: "Siargao Island",
      creator: "Juan Dela Cruz",
      creatorImage: null,
      price: 1500,
      unit: "person",
      submittedDate: "2025-10-19",
      image: null,
      status: "pending",
    },
    {
      id: 3,
      title: "Mountain Hiking Experience",
      destination: "Mt. Pulag, Benguet",
      creator: "Carlos Reyes",
      creatorImage: null,
      price: 3500,
      unit: "person",
      submittedDate: "2025-10-20",
      image: null,
      status: "pending",
    },
    {
      id: 4,
      title: "Scuba Diving Package",
      destination: "Moalboal, Cebu",
      creator: "Ana Garcia",
      creatorImage: null,
      price: 4200,
      unit: "person",
      submittedDate: "2025-10-21",
      image: null,
      status: "pending",
    },
  ]);

  const handleApprove = (id) => {
    console.log(`Approved activity ${id}`);
    setPendingActivities((prev) =>
      prev.filter((activity) => activity.id !== id)
    );
  };

  const handleReject = (id) => {
    console.log(`Rejected activity ${id}`);
    setPendingActivities((prev) =>
      prev.filter((activity) => activity.id !== id)
    );
  };

  const handleViewDetails = (id) => {
    console.log(`View details for activity ${id}`);
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
        {pendingActivities.length === 0 ? (
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
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  {activity.image ? (
                    <img
                      src={activity.image}
                      alt={activity.title}
                      className="object-cover w-full h-full rounded-lg"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs">No image</span>
                  )}
                </div>

                {/* Activity Info */}
                <div className="flex flex-col gap-1 min-w-0">
                  <h3 className="font-medium text-sm text-black/80 truncate">
                    {activity.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-black/60 flex-shrink-0" />
                    <span className="text-sm text-black/60 truncate">
                      {activity.destination}
                    </span>
                  </div>
                  <div className="text-xs text-black/50">
                    By {activity.creator} •{" "}
                    {new Date(activity.submittedDate).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
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
                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 text-black/80 text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
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
