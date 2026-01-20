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
  Info,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (activeTab === "Payouts") fetchPayouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const response = await axios.get(
        `${API_URL}/admin-payout/partner/${id}/payouts`
      );
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

  const getPayoutStatusColor = (status) => {
    const colors = {
      completed: "bg-green-100 text-green-700",
      processing: "bg-yellow-100 text-yellow-700",
      pending: "bg-gray-100 text-black/9000",
      failed: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-black/9000";
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-black/50 mt-2 ml-3">Loading partner details...</p>
      </div>
    );
  }

  if (!partner?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-black/50">Partner not found</p>
      </div>
    );
  }

  const { user, profile } = partner;
  const tabs = getTabs();

  // Documents availability (for "No documents uploaded")
  const hasDocs =
    !!user?.selfie_document ||
    !!profile?.id_document ||
    (user?.role === "Driver" && !!profile?.license_document) ||
    (user?.role === "Guide" && !!profile?.guide_certificate_document);

  return (
    <div className="min-h-screen">
      <div className="">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-black/5000 hover:text-black/90 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Partners
          </button>

          <div className="flex justify-between w-full items-baseline">
            <div>
              <h1 className="text-2xl font-semibold text-black/90">
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
                  className="w-full py-3 px-8 bg-black/80 text-white rounded-lg hover:bg-black/70 cursor-pointer disabled:opacity-60"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusUpdate("Rejected")}
                  disabled={updatingStatus}
                  className="w-full py-3 px-8 border-2 border-black/80 text-black/80 rounded-lg hover:bg-black/10 cursor-pointer disabled:opacity-60"
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
          <div className="">
            {/* Overview Tab (NOW includes profile info) */}
            {activeTab === "Overview" && (
              <div className=" flex justify-between gap-8">
                {/* Top Card */}
                <div className="bg-white flex-[0.3] rounded-2xl border border-gray-200 p-6 ">
                  {/* Header */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-28 h-28 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
                      {user.profile_pic ? (
                        <img
                          src={`${API_URL}/${user.profile_pic}`}
                          alt={`${user.first_name} ${user.last_name}`}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <User size={40} className="text-black/40" />
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-2">
                      <h2 className="text-lg font-semibold text-black/90">
                        {user.first_name} {user.last_name}
                      </h2>
                      {user?.status === "Approved" && (
                        <CheckBadgeIcon className="size-5 text-blue-500" />
                      )}
                    </div>

                    <p className="text-base text-black/50 mt-1">{getRoleDisplayName(user.role)}</p>

                    <div className="mt-3 inline-flex items-center gap-2 text-base text-black/50">
                      <Calendar size={14} />
                      <span>
                        Registered {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Status pill */}
                    <div className="mt-4">
                      <span
                        className={[
                          "inline-flex items-center rounded-full px-3 py-1 text-base font-medium border",
                          user.status === "Approved"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : user.status === "Rejected"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200",
                        ].join(" ")}
                      >
                        {user.status}
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="my-6 h-px bg-gray-200" />

                  {/* Contact Information (clean rows) */}
                  <div>
                    <p className="text-base font-semibold text-black/90 mb-3">Contact</p>

                    <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 overflow-hidden">
                      {/* Email */}
                      <div className="px-4 py-3 flex items-start justify-between gap-4 bg-white">
                        <div className="flex items-start gap-3">
                          <Mail size={18} className="text-black/40 mt-0.5" />
                          <div>
                            <p className="text-base text-black/50">Email</p>
                            <p className="text-base text-black/90 break-all">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="px-4 py-3 flex items-start justify-between gap-4 bg-white">
                        <div className="flex items-start gap-3">
                          <Phone size={18} className="text-black/40 mt-0.5" />
                          <div>
                            <p className="text-base text-black/50">Phone</p>
                            <p className="text-base text-black/90">
                              {user.mobile_number || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      {(profile?.city || null) && (
                        <div className="px-4 py-3 flex items-start justify-between gap-4 bg-white">
                          <div className="flex items-start gap-3">
                            <Globe size={18} className="text-black/40 mt-0.5" />
                            <div>
                              <p className="text-base text-black/50">Location</p>
                              <p className="text-base text-black/90">{profile.city}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {profile?.short_description ? (
                    <>
                      <div className="my-6 h-px bg-gray-200" />
                      <div>
                        <p className="text-base font-semibold text-black/90 mb-2">Bio</p>
                        <p className="text-base text-black/50 leading-relaxed">
                          {profile.short_description}
                        </p>
                      </div>
                    </>
                  ) : null}

                  {/* Status controls */}
                  {user.status !== "Pending" && (
                    <>
                      <div className="my-6 h-px bg-gray-200" />
                      <div>
                        <p className="text-base font-semibold text-black/90 mb-3">Change Status</p>

                        <div className="flex flex-col gap-2">
                          {user.status !== "Approved" && (
                            <button
                              onClick={() => handleStatusUpdate("Approved")}
                              disabled={updatingStatus}
                              className="w-full px-4 py-2.5 rounded-xl text-base font-semibold
                         bg-gray-900 text-white hover:bg-gray-800
                         disabled:opacity-60 disabled:cursor-not-allowed transition"
                            >
                              Set as Approved
                            </button>
                          )}

                          {user.status !== "Pending" && (
                            <button
                              onClick={() => handleStatusUpdate("Pending")}
                              disabled={updatingStatus}
                              className="w-full px-4 py-2.5 rounded-xl text-base font-semibold
                         border border-gray-300 text-black/90 hover:bg-gray-50
                         disabled:opacity-60 disabled:cursor-not-allowed transition"
                            >
                              Disable User
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {user.role === "Guide" && profile && (
                  <div className="bg-white flex-[0.7] rounded-2xl border border-gray-200 p-6">
                    {/* Header */}
                    <div className="mb-6">
                      <p className="text-base uppercase tracking-wide text-black/50">
                        Tour Guide
                      </p>
                      <h3 className="text-xl font-semibold text-black/90">Guide Information</h3>
                      <p className="text-base text-black/50 mt-1">
                        Key details about this partner’s guiding service.
                      </p>
                    </div>

                    {/* Clean rows */}
                    <div className="divide-y divide-gray-200">
                      {/* Experience */}
                      <div className="py-4 flex items-start justify-between gap-6">
                        <div>
                          <p className="text-base font-medium text-black/90">Years of Experience</p>
                          <p className="text-base text-black/50 mt-1">
                            Total time guiding travelers
                          </p>
                        </div>
                        <p className="text-base font-semibold text-black/90 whitespace-nowrap">
                          {profile.experience_years ?? 0} years
                        </p>
                      </div>

                      {/* Areas */}
                      <div className="py-4 flex items-start justify-between gap-6">
                        <div>
                          <p className="text-base font-medium text-black/90">Areas Covered</p>
                          <p className="text-base text-black/50 mt-1">
                            Main destinations / routes
                          </p>
                        </div>
                        <p className="text-base font-semibold text-black/90 text-right max-w-[55%]">
                          {profile.areas_covered || "Not specified"}
                        </p>
                      </div>

                      {/* Price */}
                      {"price_per_day" in profile && (
                        <div className="py-4 flex items-start justify-between gap-6">
                          <div>
                            <p className="text-base font-medium text-black/90">Service Cost (per day)</p>
                            <p className="text-base text-black/50 mt-1">
                              Displayed to travelers when booking
                            </p>
                          </div>
                          <p className="text-base font-semibold text-black/90 whitespace-nowrap">
                            ₱{Number(profile.price_per_day || 0).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      )}

                      {/* Languages */}
                      <div className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-base font-medium text-black/90">Languages Spoken</p>
                            <p className="text-base text-black/50 mt-1">
                              Used to match travelers
                            </p>
                          </div>
                          <span className="text-base text-black/50">
                            {asArray(profile.languages).length} total
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {asArray(profile.languages).length > 0 ? (
                            asArray(profile.languages).map((lang, index) => (
                              <span
                                key={index}
                                className="px-3 py-1.5 rounded-full text-base font-medium border border-gray-200 text-black/80 bg-white"
                              >
                                {lang}
                              </span>
                            ))
                          ) : (
                            <p className="text-base text-black/50">No languages specified</p>
                          )}
                        </div>
                      </div>

                      {/* Availability */}
                      <div className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-base font-medium text-black/90">Availability Days</p>
                            <p className="text-base text-black/50 mt-1">
                              Days this guide accepts bookings
                            </p>
                          </div>
                          <span className="text-base text-black/50">
                            {asArray(profile.availability_days).length} selected
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {asArray(profile.availability_days).length > 0 ? (
                            asArray(profile.availability_days).map((day, index) => (
                              <span
                                key={index}
                                className="px-3 py-1.5 rounded-full text-base font-medium bg-gray-100 text-black/80 border border-gray-200"
                              >
                                {day}
                              </span>
                            ))
                          ) : (
                            <p className="text-base text-black/50">No availability set</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {user.role === "Driver" && profile && (
                  <div className="bg-white rounded-2xl border flex-[0.7] border-gray-200 p-6 ">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-black/90">Driver Information</h3>

                      {/* optional: small role pill */}
                      <span className="text-base font-medium px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-black/80">
                        Transport Provider
                      </span>
                    </div>

                    <div className="mt-4 divide-y divide-gray-200 rounded-xl border border-gray-200 overflow-hidden">
                      {/* Service Area */}
                      <div className="px-4 py-3 bg-white flex items-start justify-between gap-4">
                        <div>
                          <p className="text-base text-black/50">Service Area</p>
                          <p className="text-base font-medium text-black/90 mt-0.5">
                            {profile.service_area || "Not specified"}
                          </p>
                        </div>
                      </div>

                      {/* Multi-day */}
                      {/* {"is_multi_day" in profile && (
                        <div className="px-4 py-3 bg-white flex items-start justify-between gap-4">
                          <div>
                            <p className="text-base text-black/50">Multi-day Service</p>
                            <p className="text-base font-medium text-black/90 mt-0.5">
                              {Number(profile.is_multi_day) === 1 ? "Yes" : "No"}
                            </p>
                          </div>
                        </div>
                      )} */}

                      {/* Availability */}
                      <div className="px-4 py-3 bg-white">
                        <p className="text-base text-black/50 mb-2">Availability Days</p>

                        {asArray(profile.availability_days).length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {asArray(profile.availability_days).map((day, index) => (
                              <span
                                key={index}
                                className="px-3 py-1.5 rounded-full text-base font-medium
                           bg-gray-50 border border-gray-200 text-black/80"
                              >
                                {day}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-base text-black/50">No availability set</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}


                {user.role === "Creator" && profile && (
                  <div className="bg-white hidden rounded-2xl border flex-[0.7] border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-black/90">
                        Activity Partner Information
                      </h3>

                      <span className="text-base font-medium px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-black/80">
                        Experience Host
                      </span>
                    </div>

                    <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden">
                      {"availability_status" in profile ? (
                        <div className="px-4 py-3 bg-white">
                          <p className="text-base text-black/50">Availability Status</p>

                          <div className="mt-2 inline-flex items-center gap-2">
                            {/* little status pill */}
                            <span
                              className={[
                                "text-base font-semibold px-3 py-1 rounded-full border",
                                profile.availability_status === "Available"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : profile.availability_status === "Busy"
                                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                    : "bg-gray-50 text-black/80 border-gray-200",
                              ].join(" ")}
                            >
                              {profile.availability_status || "Not set"}
                            </span>

                            <span className="text-base text-black/50">
                              (Set by partner/admin)
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="px-4 py-3 bg-white">
                          <p className="text-base text-black/50">No info available</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Vehicles Tab - Only for Drivers */}
            {activeTab === "Vehicles" && user.role === "Driver" && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <Car size={18} className="text-gray-500" />
                      Registered Vehicles
                    </h3>
                    <p className="text-base text-gray-500 mt-1">
                      Review the driver’s vehicles and uploaded documents.
                    </p>
                  </div>
                </div>

                {asArray(profile?.vehicles).length > 0 ? (
                  <div className="space-y-4">
                    {asArray(profile.vehicles).map((vehicle) => {
                      const photos = asArray(vehicle.vehicle_photos);

                      return (
                        <div
                          key={vehicle.vehicle_id}
                          className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
                        >
                          {/* Top row */}
                          <div className="p-5 flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-base font-semibold text-gray-900 truncate">
                                {vehicle.brand} {vehicle.model}{" "}
                                <span className="text-gray-500 font-medium">
                                  ({vehicle.year})
                                </span>
                              </p>
                              <p className="text-base text-gray-500 mt-1">
                                Plate Number:{" "}
                                <span className="text-gray-900 font-medium">
                                  {vehicle.plate_number || "—"}
                                </span>
                              </p>
                            </div>

                            <span className="shrink-0 text-base px-3 py-1 rounded-full font-semibold border border-gray-200 bg-gray-50 text-gray-700">
                              {vehicle.vehicle_type || "Vehicle"}
                            </span>
                          </div>

                          {/* Details */}
                          <div className="px-5 pb-5">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                                <p className="text-base text-gray-500">Color</p>
                                <p className="text-base font-semibold text-gray-900 mt-0.5">
                                  {vehicle.color || "—"}
                                </p>
                              </div>

                              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                                <p className="text-base text-gray-500">Passenger Capacity</p>
                                <p className="text-base font-semibold text-gray-900 mt-0.5">
                                  {vehicle.passenger_capacity ? `${vehicle.passenger_capacity} pax` : "—"}
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
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-base font-semibold hover:bg-blue-100 transition"
                                >
                                  <FileText size={16} />
                                  View OR/CR
                                </a>
                              </div>
                            )}

                            {/* Vehicle Photos */}
                            {photos.length > 0 && (
                              <div className="mt-5">
                                <p className="text-base font-semibold text-gray-900 mb-3">
                                  Vehicle Photos
                                </p>

                                <div className="flex gap-3 overflow-x-auto pb-1">
                                  {photos.map((photo, index) => (
                                    <a
                                      key={index}
                                      href={`${API_URL}/${photo}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="group block shrink-0"
                                    >
                                      <div className="w-40 h-28 rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 shadow-sm">
                                        <img
                                          src={`${API_URL}/${photo}`}
                                          alt="Vehicle"
                                          className="w-full h-full object-cover group-hover:opacity-95 transition"
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
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-10 text-center">
                    <p className="text-base font-semibold text-gray-900">No vehicles registered</p>
                    <p className="text-base text-gray-500 mt-1">
                      This driver hasn’t added vehicles yet.
                    </p>
                  </div>
                )}
              </div>
            )}


            {/* Documents Tab */}
            {activeTab === "Documents" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-black/90">Documents</h3>
                  <span className="text-base text-black/50">Verification files</span>
                </div>

                <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-200">
                  {/* Selfie */}
                  {user.selfie_document && (
                    <div className="px-4 py-3 bg-white flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
                          <FileText size={18} className="text-black/50" />
                        </div>

                        <div>
                          <p className="text-base font-semibold text-black/90">
                            Selfie Verification
                          </p>
                          <p className="text-base text-black/50">
                            Photo uploaded by partner
                          </p>
                        </div>
                      </div>

                      <a
                        href={`${API_URL}/${user.selfie_document}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl text-base font-semibold
                       border border-gray-300 text-black/90\ hover:bg-gray-50 transition"
                      >
                        View
                      </a>
                    </div>
                  )}

                  {/* Driver License */}
                  {user.role === "Driver" && profile?.license_document && (
                    <div className="px-4 py-3 bg-white flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
                          <FileText size={18} className="text-black/50" />
                        </div>

                        <div>
                          <p className="text-base font-semibold text-black/90">
                            Driver&apos;s License
                          </p>
                          <p className="text-base text-black/50">
                            Government-issued license
                          </p>
                        </div>
                      </div>

                      <a
                        href={`${API_URL}/${profile.license_document}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl text-base font-semibold
                       border border-gray-300 text-black/90\ hover:bg-gray-50 transition"
                      >
                        View
                      </a>
                    </div>
                  )}

                  {/* Guide Certificate */}
                  {user.role === "Guide" && profile?.guide_certificate_document && (
                    <div className="px-4 py-3 bg-white flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
                          <FileText size={18} className="text-black/50" />
                        </div>

                        <div>
                          <p className="text-base font-semibold text-black/90">
                            Tour Guide Certificate / License
                          </p>
                          <p className="text-base text-black/50">
                            Proof of accreditation
                          </p>
                        </div>
                      </div>

                      <a
                        href={`${API_URL}/${profile.guide_certificate_document}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl text-base font-semibold
                       border border-gray-300 text-black/90\ hover:bg-gray-50 transition"
                      >
                        View
                      </a>
                    </div>
                  )}

                  {/* ID Document */}
                  {profile?.id_document && (
                    <div className="px-4 py-3 bg-white flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
                          <FileText size={18} className="text-black/50" />
                        </div>

                        <div>
                          <p className="text-base font-semibold text-black/90">ID Document</p>
                          <p className="text-base text-black/50">
                            Government-issued ID
                          </p>
                        </div>
                      </div>

                      <a
                        href={`${API_URL}/${profile.id_document}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl text-base font-semibold
                       border border-gray-300 text-black/90\ hover:bg-gray-50 transition"
                      >
                        View
                      </a>
                    </div>
                  )}

                  {/* Empty state */}
                  {!hasDocs && (
                    <div className="px-4 py-10 bg-white text-center">
                      <p className="text-base text-black/50 font-medium">
                        No documents uploaded
                      </p>
                      <p className="text-base text-black/50 mt-1">
                        This partner hasn&apos;t submitted verification files yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}


            {/* Payouts Tab (hide if Pending) */}
            {activeTab === "Payouts" && user.status !== "Pending" && (
              <div className="space-y-6">
                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-6">
                  {/* Total */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-base text-black/50">Platform Earnings</p>
                      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center">
                        <DollarSign size={18} className="text-black/50" />
                      </div>
                    </div>

                    <p className="mt-4 text-2xl font-semibold text-black/90">
                      ₱{payoutSummary.total.toFixed(2)}
                    </p>

                    <p className="text-base text-black/50 mt-1">Total prepaid bookings</p>
                  </div>

                  {/* Paid */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-base text-black/50">Paid Out</p>
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                        <CheckCircle size={18} className="text-blue-600" />
                      </div>
                    </div>

                    <p className="mt-4 text-2xl font-semibold text-black/90">
                      ₱{payoutSummary.paid.toFixed(2)}
                    </p>

                    <p className="text-base text-black/50 mt-1">Completed payouts</p>
                  </div>

                  {/* Pending */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-base text-black/50">Pending</p>
                      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center">
                        <Clock size={18} className="text-black/50" />
                      </div>
                    </div>

                    <p className="mt-4 text-2xl font-semibold text-black/90">
                      ₱{payoutSummary.pending.toFixed(2)}
                    </p>

                    <p className="text-base text-black/50 mt-1">To be processed</p>
                  </div>
                </div>

                {/* History */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-base font-semibold text-black/90">
                      Platform Payout History
                    </h3>
                    <p className="text-base text-black/50 mt-1">
                      Payments processed through the platform (excludes cash collected in person)
                    </p>
                  </div>

                  {payoutsLoading ? (
                    <div className="p-10 text-center">
                      <div className="inline-block w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-base text-black/50 mt-3">Loading payouts...</p>
                    </div>
                  ) : payouts.length === 0 ? (
                    <div className="p-10 text-center">
                      <p className="text-base text-black/50 font-medium">No payouts found</p>
                      <p className="text-base text-black/50 mt-1">
                        This partner has no recorded platform payouts yet.
                      </p>
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
                                  <label className="block text-base font-medium text-black/50 mb-2">
                                    Status
                                  </label>
                                  <select
                                    value={editForm.payout_status}
                                    onChange={(e) =>
                                      setEditForm({ ...editForm, payout_status: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="completed">Completed</option>
                                    <option value="failed">Failed</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-base font-medium text-black/50 mb-2">
                                    Payment Method
                                  </label>
                                  <input
                                    type="text"
                                    value={editForm.payment_method}
                                    onChange={(e) =>
                                      setEditForm({ ...editForm, payment_method: e.target.value })
                                    }
                                    placeholder="e.g., Bank Transfer, GCash"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                                  />
                                </div>

                                <div className="col-span-2">
                                  <label className="block text-base font-medium text-black/50 mb-2">
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                                  />
                                </div>

                                <div className="col-span-2">
                                  <label className="block text-base font-medium text-black/50 mb-2">
                                    Notes
                                  </label>
                                  <textarea
                                    value={editForm.notes}
                                    onChange={(e) =>
                                      setEditForm({ ...editForm, notes: e.target.value })
                                    }
                                    rows={2}
                                    placeholder="Additional notes..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
                                  />
                                </div>
                              </div>

                              <div className="flex gap-3 pt-2">
                                <button
                                  onClick={() => handleSavePayout(payout.payout_id)}
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-base font-semibold hover:bg-blue-700 transition"
                                >
                                  <Check size={16} />
                                  Save Changes
                                </button>

                                <button
                                  onClick={handleCancelEdit}
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-black/80 text-base font-semibold hover:bg-gray-50 transition"
                                >
                                  <XIcon size={16} />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <div className="flex justify-between items-start gap-6">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold text-black/90">
                                    {payout.experience_title || "Payout"}
                                  </p>

                                  {/* Status pill (blue/neutral/red only) */}
                                  <span
                                    className={[
                                      "text-base px-3 py-1 rounded-full font-medium capitalize",
                                      payout.payout_status === "completed"
                                        ? "bg-green-50 text-green-900"
                                        : payout.payout_status === "processing"
                                          ? "bg-gray-50 text-black/80 border-gray-200"
                                          : payout.payout_status === "failed"
                                            ? "bg-red-50 text-red-700 border-red-200"
                                            : "bg-gray-50 text-black/80 border-gray-200",
                                    ].join(" ")}
                                  >
                                    {payout.payout_status}
                                  </span>

                                  <span className="text-base px-3 py-1 rounded-full bg-blue-50 text-blue-900  font-medium">
                                    Prepaid Booking
                                  </span>

                                  {payout.payment_count > 1 && (
                                    <span className="text-base px-3 py-1 rounded-full bg-gray-50 text-black/80 border border-gray-200 font-semibold">
                                      {payout.payment_count} payments combined
                                    </span>
                                  )}
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-4 ">
                                  <div className="rounded-xl  px-4 py-3">
                                    <p className="text-base text-black/50">Date</p>
                                    <p className="font-semibold text-black/90 mt-0.5">
                                      {dayjs(payout.payout_date).format("MMM D, YYYY")}
                                    </p>
                                  </div>

                                  <div className=" px-4 py-3">
                                    <p className=" text-black/50">Gross Amount</p>
                                    <p className=" font-semibold text-black/90 mt-0.5">
                                      ₱{parseFloat(payout.gross_amount || 0).toFixed(2)}
                                    </p>
                                  </div>

                                  <div className="px-4 py-3">
                                    <p className="text-black/50">Commission</p>
                                    <p className="font-semibold text-black/90 mt-0.5">
                                      ₱{parseFloat(payout.commission_amount || 0).toFixed(2)}
                                    </p>
                                  </div>
                                </div>

                                {payout.payment_method && (
                                  <p className="text-base text-black/50 mt-3">
                                    Payment: {payout.payment_method}
                                  </p>
                                )}

                                {payout.transaction_reference && (
                                  <p className="text-base text-black/50 mt-1">
                                    Ref: {payout.transaction_reference}
                                  </p>
                                )}

                                {payout.notes && (
                                  <p className="text-base text-black/50 mt-1 italic">
                                    {payout.notes}
                                  </p>
                                )}
                              </div>

                              <div className="text-right min-w-[220px]">
                                <p className="text-base text-black/50">Net Amount</p>
                                <p className="mt-1 text-2xl font-semibold text-black/90">
                                  ₱{parseFloat(payout.net_amount || 0).toFixed(2)}
                                </p>

                                <div className="mt-4 flex gap-2 justify-end">
                                  {payout.payout_status !== "completed" && (
                                    <button
                                      onClick={() => handleMarkAsPaid(payout.payout_id)}
                                      className="px-4 py-2 rounded-xl bg-blue-600 text-white text-base font-semibold hover:bg-blue-700 transition"
                                    >
                                      Mark as Paid
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleEditPayout(payout)}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-black/80 text-base font-semibold hover:bg-gray-50 transition"
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

            {/* Optional: Pending state message when Payouts tab selected */}
            {activeTab === "Payouts" && user.status === "Pending" && (
              <div className="pt-48 text-center">
                <p className="text-lg font-semibold text-black/90">Payouts unavailable</p>
                <p className="text-base text-black/50 mt-1">
                  This section will appear once the partner is approved.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDetailScreen;
