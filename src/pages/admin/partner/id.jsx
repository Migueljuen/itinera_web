import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  Globe,
  Car,
  DollarSign,
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
    if (activeTab === "Payouts") fetchPayouts();
  }, [activeTab]);

  const asArray = (v) => {
    if (!v) return [];
    if (Array.isArray(v)) return v;
    if (typeof v === "string") {
      try {
        const parsed = JSON.parse(v);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const fetchPartnerDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/partner/${id}`);
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
      const response = await axios.get(
        `${API_URL}/admin-payout/partner/${id}/payouts`
      );
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
      const response = await axios.patch(`${API_URL}/admin-payout/${payoutId}`, {
        ...editForm,
      });

      if (response.data.success) {
        toast.success("Payout updated successfully");
        setEditingPayout(null);
        fetchPayouts();
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

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-50 text-green-700";
      case "Rejected":
        return "bg-red-50 text-red-700";
      case "Pending":
        return "bg-amber-50 text-amber-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const getPayoutStatusStyle = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-700";
      case "processing":
        return "bg-blue-50 text-blue-700";
      case "failed":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTabs = () => {
    if (!partner?.user) return [];
    const baseTabs = [{ name: "Overview", icon: User }];

    if (partner.user.role === "Driver") {
      baseTabs.push({ name: "Vehicles", icon: Car });
    }

    baseTabs.push({ name: "Documents", icon: FileText });
    baseTabs.push({ name: "Payouts", icon: DollarSign });

    return baseTabs;
  };

  const payoutSummary = useMemo(() => {
    return payouts.reduce(
      (acc, payout) => {
        acc.total += parseFloat(payout.net_amount || 0);
        if (payout.payout_status === "completed") {
          acc.paid += parseFloat(payout.net_amount || 0);
        } else if (
          payout.payout_status === "pending" ||
          payout.payout_status === "processing"
        ) {
          acc.pending += parseFloat(payout.net_amount || 0);
        }
        return acc;
      },
      { total: 0, paid: 0, pending: 0 }
    );
  }, [payouts]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-black/20 border-t-black/80 rounded-full animate-spin" />
          <p className="text-black/50 mt-4">Loading partner details...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!partner?.user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <User size={28} className="text-gray-400" />
        </div>
        <p className="text-lg font-medium text-black/70">Partner not found</p>
        <p className="text-black/50 mt-1">This partner may have been removed.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-2.5 bg-black/90 text-white rounded-xl font-medium hover:bg-black/80 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { user, profile } = partner;
  const tabs = getTabs();

  const hasDocs =
    !!user?.selfie_document ||
    !!profile?.id_document ||
    (user?.role === "Driver" && !!profile?.license_document) ||
    (user?.role === "Guide" && !!profile?.guide_certificate_document);

  return (
    <div className="min-h-screen">
      <div className=" mx-auto px-6 ">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-black/50 hover:text-black/90 transition-colors mb-6"
          >
            <ArrowLeft size={18} />
            <span>Back to Partners</span>
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-semibold text-black/90">
                Partner Profile
              </h1>
              <p className="text-black/50 mt-2">
                Review and manage partner information
              </p>
            </div>

            {user.status === "Pending" && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleStatusUpdate("Approved")}
                  disabled={updatingStatus}
                  className="px-6 py-2.5 bg-black/90 text-white rounded-xl font-medium hover:bg-black/80 disabled:opacity-50 transition"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusUpdate("Rejected")}
                  disabled={updatingStatus}
                  className="px-6 py-2.5 border border-black/20 text-black/80 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${isActive
                  ? "bg-black/90 text-white"
                  : "text-black/50 hover:text-black/80 hover:bg-gray-50"
                  }`}
              >
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div>
          {/* Overview Tab */}
          {activeTab === "Overview" && (
            <div className="flex gap-4">
              {/* Left Column - Profile Card */}
              <div className="w-96 shrink-0 bg-white shadow-sm rounded-lg p-8" >
                <div className="sticky top-8">
                  {/* Profile Header */}
                  <div className="text-center pb-6 border-b border-gray-200">
                    <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
                      {user.profile_pic ? (
                        <img
                          src={`${API_URL}/${user.profile_pic}`}
                          alt={`${user.first_name} ${user.last_name}`}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <User size={36} className="text-black/30" />
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-2">
                      <h2 className="text-xl font-semibold text-black/90">
                        {user.first_name} {user.last_name}
                      </h2>
                      {user?.status === "Approved" && (
                        <CheckBadgeIcon className="w-5 h-5 text-blue-500" />
                      )}
                    </div>

                    <p className="text-black/50 mt-1">{getRoleDisplayName(user.role)}</p>

                    <div className="mt-3 flex items-center justify-center gap-2 text-sm text-black/40">
                      <Calendar size={14} />
                      <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="mt-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(user.status)}`}>
                        {user.status}
                      </span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="py-6 border-b border-gray-200">
                    <p className="text-sm font-medium text-black/40 uppercase tracking-wide mb-4">
                      Contact
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Mail size={18} className="text-black/30 mt-0.5" />
                        <div>
                          <p className="text-sm text-black/40">Email</p>
                          <p className="text-black/90 break-all">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone size={18} className="text-black/30 mt-0.5" />
                        <div>
                          <p className="text-sm text-black/40">Phone</p>
                          <p className="text-black/90">{user.mobile_number || "Not provided"}</p>
                        </div>
                      </div>

                      {profile?.city && (
                        <div className="flex items-start gap-3">
                          <Globe size={18} className="text-black/30 mt-0.5" />
                          <div>
                            <p className="text-sm text-black/40">Location</p>
                            <p className="text-black/90">{profile.city}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {profile?.short_description && (
                    <div className="py-6 border-b border-gray-200">
                      <p className="text-sm font-medium text-black/40 uppercase tracking-wide mb-3">
                        Bio
                      </p>
                      <p className="text-black/70 leading-relaxed">
                        {profile.short_description}
                      </p>
                    </div>
                  )}

                  {/* Status Controls */}
                  {user.status !== "Pending" && (
                    <div className="py-6">
                      <p className="text-sm font-medium text-black/40 uppercase tracking-wide mb-4">
                        Actions
                      </p>

                      <div className="space-y-2">
                        {user.status !== "Approved" && (
                          <button
                            onClick={() => handleStatusUpdate("Approved")}
                            disabled={updatingStatus}
                            className="w-full px-4 py-2.5 bg-black/90 text-white rounded-xl font-medium hover:bg-black/80 disabled:opacity-50 transition"
                          >
                            Set as Approved
                          </button>
                        )}

                        {user.status !== "Pending" && (
                          <button
                            onClick={() => handleStatusUpdate("Pending")}
                            disabled={updatingStatus}
                            className="w-full px-4 py-2.5 border border-gray-200 text-black/70 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 transition"
                          >
                            Disable User
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Role-specific Info */}
              <div className="flex-1 h-fit bg-white shadow-sm rounded-lg p-8">
                {user.role === "Guide" && profile && (
                  <div>
                    <div className="mb-6">
                      <p className="text-sm font-medium text-black/40 uppercase tracking-wide">
                        Tour Guide
                      </p>
                      <h3 className="text-2xl font-semibold text-black/90 mt-1">
                        Guide Information
                      </h3>
                    </div>

                    <div className="space-y-0 divide-y divide-gray-200">
                      {/* Experience */}
                      <div className="py-5 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-black/90">Years of Experience</p>
                          <p className="text-sm text-black/50 mt-0.5">Total time guiding travelers</p>
                        </div>
                        <p className="text-lg font-semibold text-black/90">
                          {profile.experience_years ?? 0} years
                        </p>
                      </div>

                      {/* Areas */}
                      <div className="py-5 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-black/90">Areas Covered</p>
                          <p className="text-sm text-black/50 mt-0.5">Main destinations / routes</p>
                        </div>
                        <p className="font-medium text-black/90 text-right max-w-[50%]">
                          {profile.areas_covered || "Not specified"}
                        </p>
                      </div>

                      {/* Price */}
                      {"price_per_day" in profile && (
                        <div className="py-5 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-black/90">Service Cost</p>
                            <p className="text-sm text-black/50 mt-0.5">Per day rate</p>
                          </div>
                          <p className="text-lg font-semibold text-black/90">
                            ₱{Number(profile.price_per_day || 0).toLocaleString()}
                          </p>
                        </div>
                      )}

                      {/* Languages */}
                      <div className="py-5">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium text-black/90">Languages Spoken</p>
                            <p className="text-sm text-black/50 mt-0.5">Used to match travelers</p>
                          </div>
                          <span className="text-sm text-black/40">
                            {asArray(profile.languages).length} total
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {asArray(profile.languages).length > 0 ? (
                            asArray(profile.languages).map((lang, index) => (
                              <span
                                key={index}
                                className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-50 text-black/70"
                              >
                                {lang}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-black/40">No languages specified</p>
                          )}
                        </div>
                      </div>

                      {/* Availability */}
                      <div className="py-5">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium text-black/90">Availability Days</p>
                            <p className="text-sm text-black/50 mt-0.5">Days accepting bookings</p>
                          </div>
                          <span className="text-sm text-black/40">
                            {asArray(profile.availability_days).length} selected
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {asArray(profile.availability_days).length > 0 ? (
                            asArray(profile.availability_days).map((day, index) => (
                              <span
                                key={index}
                                className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-50 text-black/70"
                              >
                                {day}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-black/40">No availability set</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {user.role === "Driver" && profile && (
                  <div>
                    <div className="mb-6">
                      <p className="text-sm font-medium text-black/40 uppercase tracking-wide">
                        Transport Provider
                      </p>
                      <h3 className="text-2xl font-semibold text-black/90 mt-1">
                        Driver Information
                      </h3>
                    </div>

                    <div className="space-y-0 divide-y divide-gray-200">
                      {/* Service Area */}
                      <div className="py-5 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-black/90">Service Area</p>
                          <p className="text-sm text-black/50 mt-0.5">Operating region</p>
                        </div>
                        <p className="font-medium text-black/90">
                          {profile.service_area || "Not specified"}
                        </p>
                      </div>

                      {/* Availability */}
                      <div className="py-5">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium text-black/90">Availability Days</p>
                            <p className="text-sm text-black/50 mt-0.5">Days accepting bookings</p>
                          </div>
                          <span className="text-sm text-black/40">
                            {asArray(profile.availability_days).length} selected
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {asArray(profile.availability_days).length > 0 ? (
                            asArray(profile.availability_days).map((day, index) => (
                              <span
                                key={index}
                                className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-50 text-black/70"
                              >
                                {day}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-black/40">No availability set</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {user.role === "Creator" && profile && (
                  <div>
                    <div className="mb-6">
                      <p className="text-sm font-medium text-black/40 uppercase tracking-wide">
                        Experience Host
                      </p>
                      <h3 className="text-2xl font-semibold text-black/90 mt-1">
                        Activity Partner Information
                      </h3>
                    </div>

                    <div className="py-5 border-b border-gray-200">
                      <p className="font-medium text-black/90">Availability Status</p>
                      <div className="mt-2">
                        <span
                          className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${profile.availability_status === "Available"
                            ? "bg-green-50 text-green-700"
                            : profile.availability_status === "Busy"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-gray-50 text-black/70"
                            }`}
                        >
                          {profile.availability_status || "Not set"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vehicles Tab */}
          {activeTab === "Vehicles" && user.role === "Driver" && (
            <div className="bg-white shadow-sm rounded-lg p-8">
              <div className="mb-6 ">
                <h3 className="text-2xl font-semibold text-black/90">Registered Vehicle</h3>
                <p className="text-black/50 mt-1">
                  Review the driver's vehicles and uploaded documents.
                </p>
              </div>

              {asArray(profile?.vehicles).length > 0 ? (
                <div className="space-y-4">
                  {asArray(profile.vehicles).map((vehicle) => {
                    const photos = asArray(vehicle.vehicle_photos);

                    return (
                      <div
                        key={vehicle.vehicle_id}
                        className="border border-gray-200 rounded-2xl overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div>
                                <p className="text-sm text-black/40">  Plate number:{" "}</p>
                                <p className="font-medium text-black/90 mt-0.5">{vehicle.plate_number || "—"}</p>
                              </div>

                            </div>
                            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-50 text-black/70">
                              {vehicle.vehicle_type || "Vehicle"}
                            </span>
                          </div>

                          {/* Details Grid (more detailed) */}
                          <div className="mt-4 grid grid-cols-2 gap-x-10 gap-y-4 mb-4">
                            <div>
                              <p className="text-sm text-black/40">Make</p>
                              <p className="font-medium text-black/90 mt-0.5">{vehicle.brand || "—"}</p>
                            </div>

                            <div>
                              <p className="text-sm text-black/40">Model</p>
                              <p className="font-medium text-black/90 mt-0.5">{vehicle.model || "—"}</p>
                            </div>

                            <div>
                              <p className="text-sm text-black/40">Year</p>
                              <p className="font-medium text-black/90 mt-0.5">{vehicle.year || "—"}</p>
                            </div>

                            <div>
                              <p className="text-sm text-black/40">Type</p>
                              <p className="font-medium text-black/90 mt-0.5">{vehicle.vehicle_type || "—"}</p>
                            </div>

                            <div>
                              <p className="text-sm text-black/40">Plate Number</p>
                              <p className="font-medium text-black/90 mt-0.5">
                                {vehicle.plate_number || "—"}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-black/40">Color</p>
                              <p className="font-medium text-black/90 mt-0.5">{vehicle.color || "—"}</p>
                            </div>

                            <div>
                              <p className="text-sm text-black/40">Capacity</p>
                              <p className="font-medium text-black/90 mt-0.5">
                                {vehicle.passenger_capacity
                                  ? `${vehicle.passenger_capacity} passengers`
                                  : "—"}
                              </p>
                            </div>

                          </div>

                          {/* OR/CR Document */}
                          {vehicle.or_cr_document && (
                            <a
                              href={`${API_URL}/${vehicle.or_cr_document}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 text-black/70 font-medium hover:bg-gray-100 transition"
                            >
                              <FileText size={16} />
                              View OR/CR
                            </a>
                          )}

                          {/* Vehicle Photos */}
                          {photos.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                              <p className="text-sm font-medium text-black/40 uppercase tracking-wide mb-3">
                                Photos
                              </p>
                              <div className="flex gap-3 overflow-x-auto">
                                {photos.map((photo, index) => (
                                  <a
                                    key={index}
                                    href={`${API_URL}/${photo}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0"
                                  >
                                    <div className="w-32 h-24 rounded-xl overflow-hidden bg-gray-100">
                                      <img
                                        src={`${API_URL}/${photo}`}
                                        alt="Vehicle"
                                        className="w-full h-full object-cover hover:opacity-90 transition"
                                      />
                                    </div>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );

                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Car size={28} className="text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-black/70">No vehicles registered</p>
                  <p className="text-black/50 mt-1">This driver hasn't added vehicles yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "Documents" && (
            <div className="bg-white shadow-sm rounded-lg p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-black/90">Documents</h3>
                <p className="text-black/50 mt-1">Verification files submitted by partner</p>
              </div>

              {/* Business Permit (Creator) */}
              {user.role === "Creator" && profile?.business_permit_document && (
                <div className="py-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                      <FileText size={18} className="text-black/40" />
                    </div>
                    <div>
                      <p className="font-medium text-black/90">Business Permit</p>
                      <p className="text-sm text-black/50">Permit uploaded by creator</p>
                    </div>
                  </div>
                  <a
                    href={`${API_URL}/${profile.business_permit_document}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-gray-50 text-black/70 font-medium hover:bg-gray-100 transition"
                  >
                    View
                  </a>
                </div>
              )}

              {hasDocs ? (
                <div className="space-y-0 divide-y divide-gray-200">
                  {/* Selfie */}
                  {user.selfie_document && (
                    <div className="py-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                          <FileText size={18} className="text-black/40" />
                        </div>
                        <div>
                          <p className="font-medium text-black/90">Selfie Verification</p>
                          <p className="text-sm text-black/50">Photo uploaded by partner</p>
                        </div>
                      </div>
                      <a
                        href={`${API_URL}/${user.selfie_document}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-gray-50 text-black/70 font-medium hover:bg-gray-100 transition"
                      >
                        View
                      </a>
                    </div>
                  )}

                  {/* Driver License */}
                  {user.role === "Driver" && profile?.license_document && (
                    <div className="py-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                          <FileText size={18} className="text-black/40" />
                        </div>
                        <div>
                          <p className="font-medium text-black/90">Driver's License</p>
                          <p className="text-sm text-black/50">Government-issued license</p>
                        </div>
                      </div>
                      <a
                        href={`${API_URL}/${profile.license_document}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-gray-50 text-black/70 font-medium hover:bg-gray-100 transition"
                      >
                        View
                      </a>
                    </div>
                  )}

                  {/* Guide Certificate */}
                  {user.role === "Guide" && profile?.guide_certificate_document && (
                    <div className="py-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                          <FileText size={18} className="text-black/40" />
                        </div>
                        <div>
                          <p className="font-medium text-black/90">Tour Guide Certificate</p>
                          <p className="text-sm text-black/50">Proof of accreditation</p>
                        </div>
                      </div>
                      <a
                        href={`${API_URL}/${profile.guide_certificate_document}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-gray-50 text-black/70 font-medium hover:bg-gray-100 transition"
                      >
                        View
                      </a>
                    </div>
                  )}

                  {/* ID Document */}
                  {profile?.id_document && (
                    <div className="py-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                          <FileText size={18} className="text-black/40" />
                        </div>
                        <div>
                          <p className="font-medium text-black/90">ID Document</p>
                          <p className="text-sm text-black/50">Government-issued ID</p>
                        </div>
                      </div>
                      <a
                        href={`${API_URL}/${profile.id_document}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-gray-50 text-black/70 font-medium hover:bg-gray-100 transition"
                      >
                        View
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <FileText size={28} className="text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-black/70">No documents uploaded</p>
                  <p className="text-black/50 mt-1">This partner hasn't submitted verification files yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Payouts Tab */}
          {activeTab === "Payouts" && user.status !== "Pending" && (
            <div className="bg-white shadow-sm rounded-lg p-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <p className="text-sm text-black/50">Platform Earnings</p>
                  <p className="text-2xl font-semibold text-black/90 mt-2">
                    ₱{payoutSummary.total.toLocaleString()}
                  </p>
                  <p className="text-sm text-black/40 mt-1">Total prepaid bookings</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6">
                  <p className="text-sm text-black/50">Paid Out</p>
                  <p className="text-2xl font-semibold text-green-700 mt-2">
                    ₱{payoutSummary.paid.toLocaleString()}
                  </p>
                  <p className="text-sm text-black/40 mt-1">Completed payouts</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6">
                  <p className="text-sm text-black/50">Pending</p>
                  <p className="text-2xl font-semibold text-black/90 mt-2">
                    ₱{payoutSummary.pending.toLocaleString()}
                  </p>
                  <p className="text-sm text-black/40 mt-1">To be processed</p>
                </div>
              </div>

              {/* Payout History */}
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold text-black/90">Payout History</h3>
                  <p className="text-black/50 mt-1">
                    Payments processed through the platform
                  </p>
                </div>

                {payoutsLoading ? (
                  <div className="text-center py-16">
                    <div className="inline-block w-6 h-6 border-2 border-black/20 border-t-black/80 rounded-full animate-spin" />
                    <p className="text-black/50 mt-4">Loading payouts...</p>
                  </div>
                ) : payouts.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <DollarSign size={28} className="text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-black/70">No payouts found</p>
                    <p className="text-black/50 mt-1">This partner has no recorded platform payouts yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payouts.map((payout) => (
                      <div
                        key={payout.payout_id}
                        className="border border-gray-200 rounded-2xl p-6"
                      >
                        {editingPayout === payout.payout_id ? (
                          /* Edit Mode */
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-black/50 mb-2">
                                  Status
                                </label>
                                <select
                                  value={editForm.payout_status}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, payout_status: e.target.value })
                                  }
                                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/10 focus:border-black/20 outline-none transition"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="processing">Processing</option>
                                  <option value="completed">Completed</option>
                                  <option value="failed">Failed</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-black/50 mb-2">
                                  Payment Method
                                </label>
                                <input
                                  type="text"
                                  value={editForm.payment_method}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, payment_method: e.target.value })
                                  }
                                  placeholder="e.g., Bank Transfer, GCash"
                                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/10 focus:border-black/20 outline-none transition"
                                />
                              </div>

                              <div className="col-span-2">
                                <label className="block text-sm font-medium text-black/50 mb-2">
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
                                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/10 focus:border-black/20 outline-none transition"
                                />
                              </div>

                              <div className="col-span-2">
                                <label className="block text-sm font-medium text-black/50 mb-2">
                                  Notes
                                </label>
                                <textarea
                                  value={editForm.notes}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, notes: e.target.value })
                                  }
                                  rows={2}
                                  placeholder="Additional notes..."
                                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/10 focus:border-black/20 outline-none resize-none transition"
                                />
                              </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                              <button
                                onClick={() => handleSavePayout(payout.payout_id)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/90 text-white font-medium hover:bg-black/80 transition"
                              >
                                <Check size={16} />
                                Save Changes
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-black/70 font-medium hover:bg-gray-50 transition"
                              >
                                <XIcon size={16} />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* View Mode */
                          <div className="flex justify-between items-start gap-6">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-black/90">
                                  {payout.experience_title || "Payout"}
                                </p>
                                <span
                                  className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getPayoutStatusStyle(
                                    payout.payout_status
                                  )}`}
                                >
                                  {payout.payout_status}
                                </span>
                                {payout.payment_count > 1 && (
                                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-black/70">
                                    {payout.payment_count} payments
                                  </span>
                                )}
                              </div>

                              <div className="flex gap-8 mt-4">
                                <div>
                                  <p className="text-sm text-black/40">Date</p>
                                  <p className="font-medium text-black/90 mt-0.5">
                                    {dayjs(payout.payout_date).format("MMM D, YYYY")}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-black/40">Gross</p>
                                  <p className="font-medium text-black/90 mt-0.5">
                                    ₱{parseFloat(payout.gross_amount || 0).toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-black/40">Commission</p>
                                  <p className="font-medium text-black/90 mt-0.5">
                                    ₱{parseFloat(payout.commission_amount || 0).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              {(payout.payment_method || payout.transaction_reference || payout.notes) && (
                                <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
                                  {payout.payment_method && (
                                    <p className="text-sm text-black/50">
                                      Method: {payout.payment_method}
                                    </p>
                                  )}
                                  {payout.transaction_reference && (
                                    <p className="text-sm text-black/50">
                                      Ref: {payout.transaction_reference}
                                    </p>
                                  )}
                                  {payout.notes && (
                                    <p className="text-sm text-black/50 italic">{payout.notes}</p>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="text-right">
                              <p className="text-sm text-black/40">Net Amount</p>
                              <p className="text-2xl font-semibold text-black/90 mt-1">
                                ₱{parseFloat(payout.net_amount || 0).toLocaleString()}
                              </p>

                              <div className="mt-4 flex gap-2 justify-end">
                                {payout.payout_status !== "completed" && (
                                  <button
                                    onClick={() => handleMarkAsPaid(payout.payout_id)}
                                    className="px-4 py-2 rounded-xl bg-black/90 text-white text-sm font-medium hover:bg-black/80 transition"
                                  >
                                    Mark Paid
                                  </button>
                                )}
                                <button
                                  onClick={() => handleEditPayout(payout)}
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-black/70 text-sm font-medium hover:bg-gray-50 transition"
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

          {/* Pending state for Payouts */}
          {activeTab === "Payouts" && user.status === "Pending" && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Clock size={28} className="text-gray-400" />
              </div>
              <p className="text-lg font-medium text-black/70">Payouts unavailable</p>
              <p className="text-black/50 mt-1">This section will appear once the partner is approved.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerDetailScreen;