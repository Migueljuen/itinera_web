import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Briefcase,
  Car,
  Languages,
  Info,
  DollarSign,
  Download,
  Edit2,
  Check,
  X as XIcon,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import API_URL from "../../../constants/api";
import toast from "react-hot-toast";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import dayjs from "dayjs";

const PartnerDetailScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");

  // Payout states
  const [payouts, setPayouts] = useState([]);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [editingPayout, setEditingPayout] = useState(null);
  const [editForm, setEditForm] = useState({
    payout_status: "",
    payment_method: "",
    transaction_reference: "",
    notes: "",
  });

  useEffect(() => {
    fetchPartnerDetails();
  }, [id]);

  useEffect(() => {
    if (activeTab === "Payouts") {
      fetchPayouts();
    }
  }, [activeTab]);

  const fetchPartnerDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/partner/${id}`);
      console.log("Partner details:", response.data);
      setPartner(response.data);
    } catch (error) {
      console.error("Error fetching partner details:", error);
      toast.error("Failed to load partner details");
    } finally {
      setLoading(false);
    }
  };

  const fetchPayouts = async () => {
    try {
      setPayoutsLoading(true);
      const response = await axios.get(`${API_URL}/admin-payout/partner/${id}/payouts`);
      console.log("Payouts:", response.data);
      setPayouts(response.data.payouts || []);
    } catch (error) {
      console.error("Error fetching payouts:", error);
      toast.error("Failed to load payouts");
    } finally {
      setPayoutsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const response = await axios.patch(`${API_URL}/partner/${id}/status`, {
        status: newStatus,
      });

      if (response.data.success) {
        setPartner((prev) => ({
          ...prev,
          user: { ...prev.user, status: newStatus },
        }));
        toast.success(`Partner status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleEditPayout = (payout) => {
    setEditingPayout(payout.payout_id);
    setEditForm({
      payout_status: payout.payout_status,
      payment_method: payout.payment_method || "",
      transaction_reference: payout.transaction_reference || "",
      notes: payout.notes || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingPayout(null);
    setEditForm({
      payout_status: "",
      payment_method: "",
      transaction_reference: "",
      notes: "",
    });
  };

  const handleSavePayout = async (payoutId) => {
    try {
      const response = await axios.patch(
        `${API_URL}/admin-payout/${payoutId}`,
        editForm
      );

      if (response.data.success) {
        toast.success("Payout updated successfully");
        setEditingPayout(null);
        fetchPayouts(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating payout:", error);
      toast.error("Failed to update payout");
    }
  };

  const handleMarkAsPaid = async (payoutId) => {
    try {
      const response = await axios.patch(`${API_URL}/admin-payout/${payoutId}`, {
        payout_status: "completed",
      });

      if (response.data.success) {
        toast.success("Payout marked as paid");
        fetchPayouts();
      }
    } catch (error) {
      console.error("Error marking payout as paid:", error);
      toast.error("Failed to mark payout as paid");
    }
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      Driver: "Transportation Provider",
      Creator: "Activity Partner",
      Guide: "Tour Guide",
    };
    return roleNames[role] || role;
  };

  const getStatusColor = (status) => {
    const colors = {
      Approved: "bg-green-100 text-green-700 border-green-200",
      Rejected: "bg-red-100 text-red-700 border-red-200",
      Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getPayoutStatusColor = (status) => {
    const colors = {
      completed: "bg-green-100 text-green-700",
      processing: "bg-yellow-100 text-yellow-700",
      pending: "bg-gray-100 text-gray-700",
      failed: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  // Define tabs based on partner role
  const getTabs = () => {
    if (!partner) return [];

    const baseTabs = [
      { name: "Overview", icon: User },
      { name: "Profile Information", icon: Info },
    ];

    if (partner.user.role === "Driver") {
      baseTabs.push(
        { name: "Vehicles", icon: Car },
        { name: "Documents", icon: FileText }
      );
    } else if (partner.user.role === "Guide") {
      baseTabs.push({ name: "Documents", icon: FileText });
    } else if (partner.user.role === "Creator") {
      baseTabs.push({ name: "Documents", icon: FileText });
    }

    // Add Payouts tab for all roles
    baseTabs.push({ name: "Payouts", icon: DollarSign });

    return baseTabs;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-2 ml-3">Loading partner details...</p>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Partner not found</p>
      </div>
    );
  }

  const { user, profile } = partner;
  const tabs = getTabs();

  // Calculate payout summary
  const payoutSummary = payouts.reduce(
    (acc, payout) => {
      acc.total += parseFloat(payout.net_amount || 0);
      if (payout.payout_status === "completed") {
        acc.paid += parseFloat(payout.net_amount || 0);
      } else if (payout.payout_status === "pending" || payout.payout_status === "processing") {
        acc.pending += parseFloat(payout.net_amount || 0);
      }
      return acc;
    },
    { total: 0, paid: 0, pending: 0 }
  );

  return (
    <div className="min-h-screen">
      <div className="">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Partners
          </button>
          <div className="flex justify-between w-full items-baseline">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Partner Profile
              </h1>
              <p className="text-black/60 mt-1">
                Review and manage partner information
              </p>
            </div>
            {user.status === "Pending" && (
              <div className="gap-4 flex">
                <button
                  onClick={() => handleStatusUpdate("Approved")}
                  disabled={updatingStatus}
                  className="w-full py-3 px-8 bg-black/80 text-white rounded-lg hover:bg-black/70 cursor-pointer"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusUpdate("Rejected")}
                  disabled={updatingStatus}
                  className="w-full py-3 px-8 border-2 border-black/80 text-black/80 rounded-lg hover:bg-black/10 cursor-pointer"
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full">
          {/* Tab Navigation */}
          <div className="flex bg-gray-50 rounded-lg w-fit p-2 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center gap-2 px-6 font-medium transition-colors py-2 rounded-lg ${activeTab === tab.name
                      ? "bg-white text-black/80 shadow-sm/10"
                      : "text-black/50 hover:text-black/70"
                    }`}
                >
                  <Icon size={18} />
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Overview Tab */}
            {activeTab === "Overview" && (
              <div className="bg-white rounded-2xl border-2 border-gray-300 p-6">
                <div className="flex flex-col items-center mb-8">
                  {/* Profile Picture */}
                  <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mb-4">
                    {user.profile_pic ? (
                      <img
                        src={`${API_URL}/${user.profile_pic}`}
                        alt={`${user.first_name} ${user.last_name}`}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <User size={48} className="text-gray-400" />
                    )}
                  </div>

                  {/* Name and Role */}
                  <h2 className="text-xl flex items-center gap-1 font-semibold text-black/80 text-center">
                    {user.first_name} {user.last_name}
                    {user?.status === "Approved" && (
                      <CheckBadgeIcon className="size-5 text-blue-400" />
                    )}
                  </h2>
                  <p className="text-black/60 mt-1 text-center">
                    {getRoleDisplayName(user.role)}
                  </p>

                  {/* Registration Date */}
                  <div className="flex items-center gap-2 mt-4 text-sm text-black/60">
                    <Calendar size={16} />
                    <span>
                      Registered {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-black/80 mb-4">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="flex items-start gap-3">
                      <Mail size={18} className="text-black/60 mt-0.5" />
                      <div>
                        <p className="text-xs text-black/60">Email</p>
                        <p className="text-sm text-black/80 break-all">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone size={18} className="text-black/60 mt-0.5" />
                      <div>
                        <p className="text-xs text-black/60">Phone</p>
                        <p className="text-sm text-black/80">
                          {user.mobile_number || "Not provided"}
                        </p>
                      </div>
                    </div>
                    {profile.city && (
                      <div className="flex items-start gap-3">
                        <Globe size={18} className="text-black/60 mt-0.5" />
                        <div>
                          <p className="text-xs text-black/60">Location</p>
                          <p className="text-sm text-black/80">{profile.city}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {user.status !== "Pending" && (
                  <div className="border-t border-gray-200 mt-6 pt-6">
                    <h3 className="text-sm font-semibold text-black/80 mb-4">
                      Change Status
                    </h3>
                    <div className="flex gap-3">
                      {user.status !== "Approved" && (
                        <button
                          onClick={() => handleStatusUpdate("Approved")}
                          disabled={updatingStatus}
                          className="px-6 py-2 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                          Set as Approved
                        </button>
                      )}
                      {user.status !== "Pending" && (
                        <button
                          onClick={() => handleStatusUpdate("Pending")}
                          disabled={updatingStatus}
                          className="px-6 py-2 border-2 text-black/80 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Disable User
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Information Tab */}
            {activeTab === "Profile Information" && (
              <>
                {/* Guide Profile */}
                {user.role === "Guide" && profile && (
                  <div className="bg-white rounded-2xl border-2 border-gray-300 p-6">
                    <h3 className="text-lg font-semibold text-black/80 mb-6">
                      Guide Information
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="rounded-lg p-4">
                        <p className="text-sm text-black/60 mb-1">
                          Years of Experience
                        </p>
                        <p className="text-lg font-semibold text-black/80">
                          {profile.experience_years} years
                        </p>
                      </div>
                      <div className="rounded-lg p-4">
                        <p className="text-sm text-black/60 mb-1">
                          Areas Covered
                        </p>
                        <p className="text-lg font-semibold text-black/80">
                          {profile.areas_covered || "Not specified"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-black/60 mb-3 font-medium">
                          Languages Spoken
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {profile.languages && profile.languages.length > 0 ? (
                            profile.languages.map((lang, index) => (
                              <span
                                key={index}
                                className="px-4 py-2 bg-gray-100 text-black/80 rounded-full text-sm font-medium border border-gray-300"
                              >
                                {lang}
                              </span>
                            ))
                          ) : (
                            <span className="text-black/60 text-sm">
                              No languages specified
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-black/60 mb-3 font-medium">
                          Availability Days
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {profile.availability_days &&
                            profile.availability_days.length > 0 ? (
                            profile.availability_days.map((day, index) => (
                              <span
                                key={index}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-300"
                              >
                                {day}
                              </span>
                            ))
                          ) : (
                            <span className="text-black/60 text-sm">
                              No availability set
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Driver Profile */}
                {user.role === "Driver" && profile && (
                  <div className="bg-white rounded-2xl border-2 border-gray-300 p-6">
                    <h3 className="text-lg font-semibold text-black/80 mb-6">
                      Driver Information
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-black/60 mb-1">
                          Service Area
                        </p>
                        <p className="text-base text-black/80">
                          {profile.service_area || "Not specified"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-black/60 mb-3 font-medium">
                          Availability Days
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {profile.availability_days &&
                            profile.availability_days.length > 0 ? (
                            profile.availability_days.map((day, index) => (
                              <span
                                key={index}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-300"
                              >
                                {day}
                              </span>
                            ))
                          ) : (
                            <span className="text-black/60 text-sm">
                              No availability set
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Creator Profile */}
                {user.role === "Creator" && profile && (
                  <div className="bg-white rounded-2xl border-2 border-gray-300 p-6">
                    <h3 className="text-lg font-semibold text-black/80 mb-6">
                      Activity Partner Information
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="rounded-lg p-4">
                        <p className="text-sm text-black/60 mb-1">
                          Availability Status
                        </p>
                        <p className="text-lg font-semibold text-black/80">
                          {profile.availability_status}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Vehicles Tab - Only for Drivers */}
            {activeTab === "Vehicles" && user.role === "Driver" && (
              <div className="bg-white rounded-2xl border-2 border-gray-300 p-6">
                <h3 className="text-lg font-semibold text-black/80 mb-6 flex items-center gap-2">
                  <Car size={20} />
                  Registered Vehicles
                </h3>

                {profile.vehicles && profile.vehicles.length > 0 ? (
                  <div className="space-y-4">
                    {profile.vehicles.map((vehicle) => (
                      <div
                        key={vehicle.vehicle_id}
                        className="p-5 border border-gray-200 rounded-xl bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-base font-semibold text-black/80">
                              {vehicle.brand} {vehicle.model} ({vehicle.year})
                            </p>
                            <p className="text-sm text-black/60 mt-1">
                              Plate Number: {vehicle.plate_number}
                            </p>
                          </div>

                          <span className="px-3 py-1 text-xs font-medium border rounded-full bg-white">
                            {vehicle.vehicle_type}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                          <div>
                            <p className="text-black/60">Color</p>
                            <p className="text-black/80">{vehicle.color}</p>
                          </div>
                          <div>
                            <p className="text-black/60">Passenger Capacity</p>
                            <p className="text-black/80">
                              {vehicle.passenger_capacity} pax
                            </p>
                          </div>
                        </div>

                        {/* OR/CR Document */}
                        {vehicle.or_cr_document && (
                          <div className="mt-4">
                            <a
                              href={`${API_URL}/${vehicle.or_cr_document}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#397ff1] border-2 border-[#397ff1] rounded-lg hover:bg-blue-50 transition"
                            >
                              <FileText size={16} />
                              View OR/CR
                            </a>
                          </div>
                        )}

                        {/* Vehicle Photos */}
                        {vehicle.vehicle_photos &&
                          vehicle.vehicle_photos.length > 0 && (
                            <div className="mt-4 flex gap-3 overflow-x-auto">
                              {vehicle.vehicle_photos.map((photo, index) => (
                                <a
                                  key={index}
                                  href={`${API_URL}/${photo}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <img
                                    src={`${API_URL}/${photo}`}
                                    alt="Vehicle"
                                    className="w-32 h-24 object-cover rounded-lg hover:opacity-90 transition cursor-pointer"
                                  />
                                </a>
                              ))}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-black/60 text-center py-4">
                    No vehicles registered
                  </p>
                )}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "Documents" && (
              <div className="bg-white rounded-2xl border-2 border-gray-300 p-6">
                <h3 className="text-lg font-semibold text-black/80 mb-6">
                  Documents
                </h3>
                <div className="space-y-3">
                  {/* Driver's License - Only for Drivers */}
                  {user.role === "Driver" && profile.license_document && (
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg">
                          <FileText size={20} className="text-black/60" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black/80">
                            Driver's License
                          </p>
                          <p className="text-xs text-black/60">
                            {profile.license_document.split("/").pop()}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`${API_URL}/${profile.license_document}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 text-sm font-medium text-[#397ff1] hover:text-[#2e6bd4] border-2 border-[#397ff1] rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        View
                      </a>
                    </div>
                  )}

                  {/* ID Document */}
                  {profile.id_document && (
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg">
                          <FileText size={20} className="text-black/60" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black/80">
                            ID Document
                          </p>
                          <p className="text-xs text-black/60">
                            {profile.id_document.split("/").pop()}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`${API_URL}/${profile.id_document}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 text-sm font-medium text-[#397ff1] hover:text-[#2e6bd4] border-2 border-[#397ff1] rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        View
                      </a>
                    </div>
                  )}

                  {/* No documents message */}
                  {!profile.id_document &&
                    !(user.role === "Driver" && profile.license_document) && (
                      <p className="text-sm text-black/60 text-center py-4">
                        No documents uploaded
                      </p>
                    )}
                </div>
              </div>
            )}

            {/* Payouts Tab */}
            {activeTab === "Payouts" && (
              <div className="space-y-6">
                {/* Payout Summary Cards */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl border-2 border-gray-300 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-black/60">Platform Earnings</p>
                      <DollarSign size={20} className="text-black/40" />
                    </div>
                    <p className="text-2xl font-semibold text-black/80">
                      ₱{payoutSummary.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-black/50 mt-1">Total prepaid bookings</p>
                  </div>

                  <div className="bg-white rounded-xl border-2 border-gray-300 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-black/60">Paid Out</p>
                      <CheckCircle size={20} className="text-green-500" />
                    </div>
                    <p className="text-2xl font-semibold text-green-600">
                      ₱{payoutSummary.paid.toFixed(2)}
                    </p>
                    <p className="text-xs text-black/50 mt-1">Completed</p>
                  </div>

                  <div className="bg-white rounded-xl border-2 border-gray-300 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-black/60">Pending</p>
                      <Clock size={20} className="text-yellow-500" />
                    </div>
                    <p className="text-2xl font-semibold text-yellow-600">
                      ₱{payoutSummary.pending.toFixed(2)}
                    </p>
                    <p className="text-xs text-black/50 mt-1">To be processed</p>
                  </div>
                </div>

                {/* Payouts List */}
                <div className="bg-white rounded-xl border-2 border-gray-300">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-black/80">
                      Platform Payout History
                    </h3>
                    <p className="text-sm text-black/60 mt-1">
                      Payments processed through the platform (excludes cash collected in person)
                    </p>
                  </div>

                  {payoutsLoading ? (
                    <div className="p-8 text-center">
                      <div className="inline-block w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-500 mt-2">Loading payouts...</p>
                    </div>
                  ) : payouts.length === 0 ? (
                    <div className="p-8 text-center text-black/60">
                      No payouts found
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {payouts.map((payout) => (
                        <div key={payout.payout_id} className="p-6">
                          {editingPayout === payout.payout_id ? (
                            // Edit Mode
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-black/70 mb-2">
                                    Status
                                  </label>
                                  <select
                                    value={editForm.payout_status}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        payout_status: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="completed">Completed</option>
                                    <option value="failed">Failed</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-black/70 mb-2">
                                    Payment Method
                                  </label>
                                  <input
                                    type="text"
                                    value={editForm.payment_method}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        payment_method: e.target.value,
                                      })
                                    }
                                    placeholder="e.g., Bank Transfer, GCash"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div className="col-span-2">
                                  <label className="block text-sm font-medium text-black/70 mb-2">
                                    Transaction Reference
                                  </label>
                                  <input
                                    type="text"
                                    value={editForm.transaction_reference}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        transaction_reference: e.target.value,
                                      })
                                    }
                                    placeholder="Transaction ID or reference number"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div className="col-span-2">
                                  <label className="block text-sm font-medium text-black/70 mb-2">
                                    Notes
                                  </label>
                                  <textarea
                                    value={editForm.notes}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        notes: e.target.value,
                                      })
                                    }
                                    rows={2}
                                    placeholder="Additional notes..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                  />
                                </div>
                              </div>

                              <div className="flex gap-3 pt-2">
                                <button
                                  onClick={() => handleSavePayout(payout.payout_id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                >
                                  <Check size={16} />
                                  Save Changes
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                  <XIcon size={16} />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <p className="font-semibold text-black/80">
                                    {payout.experience_title || "Payout"}
                                  </p>
                                  <span
                                    className={`text-xs px-3 py-1 rounded-full font-medium ${getPayoutStatusColor(
                                      payout.payout_status
                                    )}`}
                                  >
                                    {payout.payout_status}
                                  </span>
                                  <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                                    Prepaid Booking
                                  </span>
                                  {payout.payment_count > 1 && (
                                    <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700">
                                      {payout.payment_count} payments combined
                                    </span>
                                  )}
                                </div>

                                <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                                  <div>
                                    <p className="text-black/60">Date</p>
                                    <p className="text-black/80">
                                      {dayjs(payout.payout_date).format(
                                        "MMM D, YYYY"
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-black/60">Gross Amount</p>
                                    <p className="text-black/80">
                                      ₱{parseFloat(payout.gross_amount).toFixed(2)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-black/60">Commission</p>
                                    <p className="text-black/80">
                                      ₱
                                      {parseFloat(
                                        payout.commission_amount
                                      ).toFixed(2)}
                                    </p>
                                  </div>
                                </div>

                                {payout.payment_method && (
                                  <p className="text-sm text-black/60 mt-3">
                                    Payment: {payout.payment_method}
                                  </p>
                                )}

                                {payout.transaction_reference && (
                                  <p className="text-sm text-black/60 mt-1">
                                    Ref: {payout.transaction_reference}
                                  </p>
                                )}

                                {payout.notes && (
                                  <p className="text-sm text-black/60 mt-1 italic">
                                    {payout.notes}
                                  </p>
                                )}
                              </div>

                              <div className="text-right ml-6">
                                <p className="text-sm text-black/50">Net Amount</p>
                                <p className="text-2xl font-semibold text-black/80 mb-4">
                                  ₱{parseFloat(payout.net_amount).toFixed(2)}
                                </p>

                                <div className="flex gap-2">
                                  {payout.payout_status !== "completed" && (
                                    <button
                                      onClick={() =>
                                        handleMarkAsPaid(payout.payout_id)
                                      }
                                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                                    >
                                      Mark as Paid
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleEditPayout(payout)}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition"
                                  >
                                    <Edit2 size={14} />
                                    Edit
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDetailScreen;