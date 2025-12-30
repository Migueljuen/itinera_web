import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Car,
  Users,
  Calendar,
  ChevronDown,
  Eye,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
const VehicleManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [expandedVehicleId, setExpandedVehicleId] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Simulate fetching vehicles
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Empty array = no vehicles registered yet
      setVehicles([]);
      setLoading(false);
    }, 1000);

    // Example with vehicles:
    // setVehicles([
    //   {
    //     vehicle_id: 1,
    //     plate_number: "ABC 1234",
    //     vehicle_type: "Sedan",
    //     brand: "Toyota",
    //     model: "Vios",
    //     year: 2020,
    //     color: "White",
    //     passenger_capacity: 4,
    //     or_cr_document: "/uploads/documents/or-cr-123.pdf",
    //     vehicle_photos: [
    //       "/uploads/vehicles/car1-front.jpg",
    //       "/uploads/vehicles/car1-side.jpg",
    //     ],
    //     created_at: "2024-01-15T10:30:00",
    //     status: "active",
    //   },
    // ]);
  }, []);

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.plate_number?.toLowerCase().includes(searchText.toLowerCase()) ||
      vehicle.brand?.toLowerCase().includes(searchText.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchText.toLowerCase()) ||
      vehicle.vehicle_type?.toLowerCase().includes(searchText.toLowerCase());

    return matchesSearch;
  });

  const handleAddVehicle = () => {
    navigate("/owner/driver/vehicle/add");
  };

  const handleEditVehicle = (vehicleId) => {
    alert(`Navigate to: /driver/vehicles/edit/${vehicleId}`);
    // navigate(`/driver/vehicles/edit/${vehicleId}`);
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        // TODO: API call to delete vehicle
        setVehicles(vehicles.filter((v) => v.vehicle_id !== vehicleId));
        alert("Vehicle deleted successfully");
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        alert("Failed to delete vehicle");
      }
    }
  };

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  // Empty State
  if (!loading && vehicles.length === 0) {
    return (
      <div className="min-h-screen ">
        <div className="">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                My Vehicles
              </h1>
              <p className="text-black/60 mt-1">
                Manage your registered vehicle
              </p>
            </div>
          </div>

          {/* Empty State Card */}
          <div className=" p-36">
            <div className="max-w-lg mx-auto text-center">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Car size={40} className="text-gray-400" />
              </div>

              <h2 className="text-2xl font-semibold text-black/90 mb-3">
                Oops you haven't registered a vehicle yet
              </h2>

              <p className="text-black/60 mb-8">
                Register your first vehicle to start accepting requests.
              </p>

              <button
                onClick={handleAddVehicle}
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition-colors"
              >
                <Plus size={20} />
                Register Your First Vehicle
              </button>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-4">
                  You'll need to provide:
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                    Vehicle Details
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                    OR/CR Document
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                    Vehicle Photos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                My Vehicles
              </h1>
              <p className="text-black/60 mt-1">
                Manage your registered vehicles
              </p>
            </div>
          </div>

          <div className=" p-36">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading vehicles...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vehicles List
  return (
    <div className="min-h-screen ">
      <div className="">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              My Vehicles
            </h1>
            <p className="text-black/60 mt-1">
              Manage your registered vehicles
            </p>
          </div>
          <button
            onClick={handleAddVehicle}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
          >
            <Plus size={18} />
            Add Vehicle
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg mb-6 p-4">
          <div className="relative">
            <Search
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by plate number, brand, model..."
              className="w-full pl-4 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        {/* Vehicles Grid/List */}
        <div className="space-y-4">
          {filteredVehicles.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No vehicles found</p>
            </div>
          ) : (
            filteredVehicles.map((vehicle) => {
              const isExpanded = expandedVehicleId === vehicle.vehicle_id;

              return (
                <div
                  key={vehicle.vehicle_id}
                  className={`bg-white rounded-xl border border-gray-200 transition-all ${
                    isExpanded ? "ring-2 ring-blue-400" : ""
                  }`}
                >
                  {/* Main Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      {/* Left: Vehicle Info */}
                      <div className="flex items-center gap-6">
                        {/* Vehicle Photo Thumbnail */}
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {vehicle.vehicle_photos?.length > 0 ? (
                            <img
                              src={vehicle.vehicle_photos[0]}
                              alt={`${vehicle.brand} ${vehicle.model}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Car size={32} className="text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {vehicle.brand} {vehicle.model}
                            </h3>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                              {vehicle.vehicle_type}
                            </span>
                          </div>

                          <div className="flex items-center gap-6 text-sm text-black/60">
                            <div className="flex items-center gap-2">
                              <Car size={16} />
                              <span className="font-medium">
                                {vehicle.plate_number}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users size={16} />
                              <span>
                                {vehicle.passenger_capacity} passengers
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar size={16} />
                              <span>{vehicle.year}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{
                                backgroundColor: vehicle.color.toLowerCase(),
                              }}
                            ></div>
                            <span className="text-sm text-black/60">
                              {vehicle.color}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            setExpandedVehicleId(
                              isExpanded ? null : vehicle.vehicle_id
                            )
                          }
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                        >
                          {isExpanded ? "Less" : "More"}
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-300 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {/* Dropdown Menu */}
                        <div className="relative">
                          <button
                            onClick={() => toggleDropdown(vehicle.vehicle_id)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                          >
                            <MoreHorizontal
                              size={20}
                              className="text-black/60"
                            />
                          </button>

                          {openDropdownId === vehicle.vehicle_id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenDropdownId(null)}
                              ></div>
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                                <button
                                  onClick={() => {
                                    handleEditVehicle(vehicle.vehicle_id);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <Edit3 size={16} />
                                  Edit Vehicle
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteVehicle(vehicle.vehicle_id);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={16} />
                                  Delete Vehicle
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded
                        ? "max-h-[1000px] opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="border-t border-gray-200 p-6">
                      <div className="grid grid-cols-2 gap-8">
                        {/* Left: Documents */}
                        <div>
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <FileText size={18} />
                            Documents
                          </h4>

                          {vehicle.or_cr_document ? (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <FileText
                                    size={20}
                                    className="text-blue-600"
                                  />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      OR/CR Document
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Official Receipt & Certificate of
                                      Registration
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() =>
                                    window.open(
                                      vehicle.or_cr_document,
                                      "_blank"
                                    )
                                  }
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                >
                                  <Eye size={18} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">
                              No document uploaded
                            </p>
                          )}

                          {/* Status */}
                          <div className="mt-6">
                            <h4 className="font-semibold mb-3">Status</h4>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="text-sm text-gray-700">
                                {vehicle.status === "active"
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Photos Gallery */}
                        <div>
                          <h4 className="font-semibold mb-4">Vehicle Photos</h4>

                          {vehicle.vehicle_photos?.length > 0 ? (
                            <div className="grid grid-cols-3 gap-3">
                              {vehicle.vehicle_photos.map((photo, index) => (
                                <div
                                  key={index}
                                  className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-75 transition-opacity"
                                  onClick={() => window.open(photo, "_blank")}
                                >
                                  <img
                                    src={photo}
                                    alt={`Vehicle photo ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">
                              No photos uploaded
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleManagement;
