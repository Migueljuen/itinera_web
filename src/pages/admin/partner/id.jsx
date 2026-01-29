import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Clock,
  Globe,
  Car,
  Receipt,
  CreditCard,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import API_URL from "../../../constants/api";
import toast from "react-hot-toast";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

const PartnerDetailScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    fetchPartnerDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  // ---- Helpers: registration fee / subscription info (robust to response shape) ----
  const getRegistrationPayment = (p) => {
    if (!p) return null;
    return (
      p.registration_payment ||
      p.registrationPayment ||
      p.registration_fee_payment ||
      p.registrationFeePayment ||
      p.partner_registration_payment ||
      null
    );
  };

  const getSubscription = (p) => {
    if (!p) return null;
    return (
      p.subscription ||
      p.partner_subscription ||
      p.partnerSubscription ||
      p.active_subscription ||
      null
    );
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

  const getPaymentStatusStyle = (status) => {
    const s = String(status || "").toLowerCase();
    if (["paid", "confirmed", "verified", "completed", "success"].includes(s)) {
      return "bg-green-50 text-green-700";
    }
    if (["pending", "unpaid", "processing", "for_review"].includes(s)) {
      return "bg-amber-50 text-amber-700";
    }
    if (["rejected", "failed", "invalid"].includes(s)) {
      return "bg-red-50 text-red-700";
    }
    return "bg-gray-50 text-gray-700";
  };

  const getTabs = () => {
    if (!partner?.user) return [];
    const baseTabs = [{ name: "Overview", icon: User }];

    if (partner.user.role === "Driver") {
      baseTabs.push({ name: "Vehicles", icon: Car });
    }

    baseTabs.push({ name: "Documents", icon: FileText });
    baseTabs.push({ name: "Billing", icon: CreditCard });

    return baseTabs;
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      // UI guard: require registration fee proof + reference before approving
      let payload = { status: newStatus };

      if (newStatus === "Approved") {
        const regPay = getRegistrationPayment(partner);

        const proofPath =
          regPay?.proof_url ||
          regPay?.proof_path ||
          regPay?.payment_proof ||
          partner?.user?.registration_payment_proof ||
          partner?.profile?.registration_payment_proof ||
          null;

        const ref =
          regPay?.gcash_reference ||
          regPay?.reference ||
          partner?.user?.gcash_reference ||
          partner?.profile?.gcash_reference ||
          null;

        if (!proofPath || !String(ref || "").trim()) {
          toast.error(
            "Cannot approve yet. Missing registration fee proof and/or GCash reference number."
          );
          return;
        }

        // ✅ REQUIRED by backend when approving
        payload.gcash_reference = String(ref).trim();

        // ✅ Optional but recommended (backend will store it)
        payload.proof_url = proofPath;

        // Optional: if you later add plan picking UI:
        // payload.plan_id = selectedPlanId;
      }

      setUpdatingStatus(true);

      const response = await axios.patch(`${API_URL}/partner/${id}/status`, payload);

      if (response.data.success) {
        // Prefer using returned data if present (keeps subscription/payment pills fresh)
        const returnedSub = response.data.data?.subscription || null;
        const returnedReg = response.data.data?.registration_payment || null;

        setPartner((prev) => ({
          ...prev,
          user: { ...prev.user, status: newStatus },
          ...(returnedSub ? { subscription: returnedSub } : {}),
          ...(returnedReg ? { registration_payment: returnedReg } : {}),
        }));

        toast.success(`Partner status updated to ${newStatus}`);
        // Optional: re-fetch full partner to fully sync UI
        // await fetchPartnerDetails();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };


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

  const regPay = getRegistrationPayment(partner);
  const subscription = getSubscription(partner);

  const registrationProofPath =
    regPay?.proof_url ||
    regPay?.proof_path ||
    regPay?.payment_proof ||
    user?.registration_payment_proof ||
    profile?.registration_payment_proof ||
    null;

  const registrationRef =
    regPay?.gcash_reference ||
    regPay?.reference ||
    user?.gcash_reference ||
    profile?.gcash_reference ||
    "";

  const registrationStatus = regPay?.status || "pending";
  const canApprove =
    !!registrationProofPath && String(registrationRef || "").trim().length > 0;

  const hasDocs =
    !!user?.selfie_document ||
    !!profile?.id_document ||
    (user?.role === "Creator" && !!profile?.business_permit_document) ||
    !!registrationProofPath ||
    (user?.role === "Driver" && !!profile?.license_document) ||
    (user?.role === "Guide" && !!profile?.guide_certificate_document);

  return (
    <div className="min-h-screen pb-48">
      <div className="mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-black/50 hover:text-black/90 transition-colors mb-6"
          >
            <ArrowLeft size={18} />
            <span>Back to Partners</span>
          </button>

          <div className="flex justify-between items-start gap-6">
            <div>
              <h1 className="text-3xl font-semibold text-black/90">
                Partner Profile
              </h1>
              <p className="text-black/50 mt-2">
                Review and manage partner information
              </p>
            </div>

            {user.status === "Pending" && (
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleStatusUpdate("Approved")}
                    disabled={updatingStatus || !canApprove}
                    className="px-6 py-2.5 bg-black/90 text-white rounded-xl font-medium hover:bg-black/80 disabled:opacity-50 transition"
                    title={
                      canApprove
                        ? "Approve partner"
                        : "Requires registration fee proof + GCash reference"
                    }
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

                {!canApprove && (
                  <p className="text-xs text-black/40 text-right max-w-xs">
                    Approval is locked until the partner submits registration fee
                    proof and a GCash reference number.
                  </p>
                )}
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
                className={`py-2.5 pr-10 font-medium text-sm transition-colors ${isActive
                  ? " text-black/80"
                  : "text-black/50 hover:text-black/80 "
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
              <div className="w-96 shrink-0 bg-white border border-gray-300 rounded-lg p-8">
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

                    <p className="text-black/70 text-sm mt-1">
                      {getRoleDisplayName(user.role)}
                    </p>

                    <div className="mt-3 flex items-center justify-center gap-2 text-sm text-black/40">
                      <Calendar size={14} />
                      <span>
                        Joined{" "}
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>

                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="py-6 ">
                    <p className="text-sm font-medium text-black/40 uppercase tracking-wide mb-4">
                      Contact
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Mail size={18} className="text-black/30 mt-0.5" />
                        <div>
                          <p className="text-sm text-black/50">Email</p>
                          <p className="text-black/90 break-all text-sm">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone size={18} className="text-black/30 mt-0.5" />
                        <div>
                          <p className="text-sm text-black/50">Phone</p>
                          <p className="text-black/90  text-sm">
                            {user.mobile_number || "Not provided"}
                          </p>
                        </div>
                      </div>

                      {profile?.city && (
                        <div className="flex items-start gap-3">
                          <Globe size={18} className="text-black/30 mt-0.5" />
                          <div>
                            <p className="text-sm text-black/50">Location</p>
                            <p className="text-black/90  text-sm">{profile.city}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

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
                            disabled={updatingStatus || !canApprove}
                            className="w-full px-4 py-2.5 bg-black/90 text-white rounded-xl font-medium hover:bg-black/80 disabled:opacity-50 transition"
                            title={
                              canApprove
                                ? "Set as Approved"
                                : "Requires registration fee proof + GCash reference"
                            }
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
              <div className="flex-1 h-fit bg-white border border-gray-300 rounded-lg p-8">
                {user.role === "Guide" && profile && (
                  <div>
                    <div className="mb-6">
                      <p className="text-sm font-medium text-black/40 uppercase tracking-wide">
                        Tour Guide
                      </p>
                      <h3 className="text-2xl font-semibold text-black/90 mt-1">
                        Partner Information
                      </h3>
                    </div>

                    <div className="space-y-0 divide-y divide-gray-200">
                      <div className="py-5 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-black/90">
                            Years of Experience
                          </p>
                          <p className="text-sm text-black/50 mt-0.5">
                            Total time guiding travelers
                          </p>
                        </div>
                        <p className="text-lg font-semibold text-black/90">
                          {profile.experience_years ?? 0} years
                        </p>
                      </div>

                      <div className="py-5 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-black/90">Areas Covered</p>
                          <p className="text-sm text-black/50 mt-0.5">
                            Main destinations / routes
                          </p>
                        </div>
                        <p className="font-medium text-black/90 text-right max-w-[50%]">
                          {profile.areas_covered || "Not specified"}
                        </p>
                      </div>

                      <div className="py-5">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium text-black/90">
                              Languages Spoken
                            </p>
                            <p className="text-sm text-black/50 mt-0.5">
                              Used to match travelers
                            </p>
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
                            <p className="text-sm text-black/40">
                              No languages specified
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="py-5">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium text-black/90">
                              Availability Days
                            </p>
                            <p className="text-sm text-black/50 mt-0.5">
                              Days accepting bookings
                            </p>
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
                            <p className="text-sm text-black/40">
                              No availability set
                            </p>
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
                      <div className="py-5 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-black/90">Service Area</p>
                          <p className="text-sm text-black/50 mt-0.5">
                            Operating region
                          </p>
                        </div>
                        <p className="font-medium text-black/90">
                          {profile.service_area || "Not specified"}
                        </p>
                      </div>

                      <div className="py-5">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium text-black/90">
                              Availability Days
                            </p>
                            <p className="text-sm text-black/50 mt-0.5">
                              Days accepting bookings
                            </p>
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
                            <p className="text-sm text-black/40">
                              No availability set
                            </p>
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
                        Activity Partner
                      </p>
                      <h3 className="text-2xl font-semibold text-black/90 mt-1">
                        Partner Information
                      </h3>
                    </div>



                    {/* Registration fee reminder */}
                    <div className="py-5">
                      <p className="font-medium text-black/90">
                        Registration Fee Status
                      </p>
                      <p className="text-sm text-black/50 mt-1">
                        Partners must submit proof of the ₱1,299 one-time
                        registration fee. Approval is only allowed once proof +
                        reference are present.
                      </p>

                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getPaymentStatusStyle(
                            registrationStatus
                          )}`}
                        >
                          <Receipt size={14} />
                          {String(registrationStatus || "pending")}
                        </span>

                        {registrationRef ? (
                          <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-50 text-black/70">
                            Ref: {registrationRef}
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-amber-50 text-amber-700">
                            Missing reference
                          </span>
                        )}
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
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-black/90">
                  Registered Vehicle
                </h3>
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
                                <p className="text-sm text-black/40">Plate number:</p>
                                <p className="font-medium text-black/90 mt-0.5">
                                  {vehicle.plate_number || "—"}
                                </p>
                              </div>
                            </div>
                            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-50 text-black/70">
                              {vehicle.vehicle_type || "Vehicle"}
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-x-10 gap-y-4 mb-4">
                            <div>
                              <p className="text-sm text-black/40">Make</p>
                              <p className="font-medium text-black/90 mt-0.5">
                                {vehicle.brand || "—"}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-black/40">Model</p>
                              <p className="font-medium text-black/90 mt-0.5">
                                {vehicle.model || "—"}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-black/40">Year</p>
                              <p className="font-medium text-black/90 mt-0.5">
                                {vehicle.year || "—"}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-black/40">Type</p>
                              <p className="font-medium text-black/90 mt-0.5">
                                {vehicle.vehicle_type || "—"}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-black/40">Plate Number</p>
                              <p className="font-medium text-black/90 mt-0.5">
                                {vehicle.plate_number || "—"}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-black/40">Color</p>
                              <p className="font-medium text-black/90 mt-0.5">
                                {vehicle.color || "—"}
                              </p>
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
                  <p className="text-lg font-medium text-black/70">
                    No vehicles registered
                  </p>
                  <p className="text-black/50 mt-1">
                    This driver hasn't added vehicles yet.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "Documents" && (
            <div className="bg-white  rounded-lg py-8">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-black/90">Documents</h3>
                <p className="text-black/50 mt-1 text-sm">
                  Verification files submitted by partner
                </p>
              </div>

              {hasDocs ? (
                <div className="space-y-0 divide-y divide-gray-200">
                  {/* ✅ Registration Payment Proof */}
                  {(registrationProofPath || registrationRef) && (
                    <div className="py-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                          <Receipt size={18} className="text-black/40" />
                        </div>
                        <div>
                          <p className="font-medium text-black/90">
                            Registration Fee Proof (GCash)
                          </p>
                          <p className="text-sm text-black/50">
                            Ref:{" "}
                            <span className="text-black/70 font-medium">
                              {registrationRef || "Not provided"}
                            </span>{" "}
                            • Status:{" "}
                            <span className="capitalize">
                              {String(registrationStatus || "pending")}
                            </span>
                          </p>
                        </div>
                      </div>

                      {registrationProofPath ? (
                        <a
                          href={`${API_URL}/${registrationProofPath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-gray-50 text-black/70 font-medium hover:bg-gray-100 transition"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-sm text-black/40">No proof uploaded</span>
                      )}
                    </div>
                  )}

                  {/* Business Permit (Creator) */}
                  {user.role === "Creator" && profile?.business_permit_document && (
                    <div className="py-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                          <FileText size={18} className="text-black/40" />
                        </div>
                        <div>
                          <p className="font-medium text-black/90">Business Permit</p>
                          <p className="text-sm text-black/50">
                            Permit uploaded by creator
                          </p>
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

                  {/* Selfie */}
                  {user.selfie_document && (
                    <div className="py-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                          <FileText size={18} className="text-black/40" />
                        </div>
                        <div>
                          <p className="font-medium text-black/90">Selfie Verification</p>
                          <p className="text-sm text-black/50">
                            Photo uploaded by partner
                          </p>
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
                          <p className="text-sm text-black/50">
                            Government-issued license
                          </p>
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
                  <p className="text-lg font-medium text-black/70">
                    No documents uploaded
                  </p>
                  <p className="text-black/50 mt-1">
                    This partner hasn't submitted verification files yet.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === "Billing" && (
            <div className="bg-white rounded-lg py-8">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-black/90">Billing</h3>
                <p className="text-black/50 mt-1">
                  Registration fee + subscription information
                </p>
              </div>

              {/* Registration Fee */}
              <div className="border border-gray-200 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">

                    <div>
                      <p className="font-semibold text-black/90">
                        One-time Registration Fee
                      </p>
                      <p className="text-sm text-black/50 mt-1">
                        Amount:{" "}
                        <span className="text-black/80 font-medium">₱1,299</span>
                      </p>
                      <p className="text-sm text-black/50">
                        Includes: 1 month basic subscription after approval
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center capitalize gap-2 px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusStyle(
                      registrationStatus
                    )}`}
                  >
                    {String(registrationStatus || "Pending")}
                  </span>
                </div>

                <div className="mt-12 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-black/40">GCash Reference</p>
                    <p className="font-medium text-black/90 mt-0.5 break-all">
                      {registrationRef || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-black/40">Proof</p>
                    {registrationProofPath ? (
                      <a
                        href={`${API_URL}/${registrationProofPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm mt-0.5 py-2  text-black/70 font-medium "
                      >

                        View Receipt
                      </a>
                    ) : (
                      <p className="font-medium text-black/70 mt-0.5">—</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-black/50">
                    After 30 days: Basic ~₱599/month • Pro ~₱999/month
                  </p>
                </div>
              </div>

              {/* Subscription */}
              <div className="mt-6 border border-gray-200 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                      <CreditCard size={18} className="text-black/40" />
                    </div>
                    <div>
                      <p className="font-semibold text-black/90">
                        Subscription
                      </p>
                      <p className="text-sm text-black/50 mt-1">
                        Only subscribed partners can preview activities and receive bookings from the system.
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gray-50 text-gray-700">
                    {subscription?.status
                      ? String(subscription.status)
                      : "Not available"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-black/40">Current Plan</p>
                    <p className="font-medium text-black/90 mt-0.5">
                      {subscription?.plan_name ||
                        subscription?.plan ||
                        "Free month / Not set"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-black/40">Renewal / Ends</p>
                    <p className="font-medium text-black/90 mt-0.5">
                      {subscription?.ends_at
                        ? new Date(subscription.ends_at).toLocaleDateString()
                        : subscription?.next_billing_at
                          ? new Date(subscription.next_billing_at).toLocaleDateString()
                          : "—"}
                    </p>
                  </div>
                </div>

                {!subscription && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-black/50">
                      Subscription details will appear here once your backend returns
                      partner subscription data.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pending note for Billing (optional) */}
          {activeTab === "Billing" && user.status === "Pending" && (
            <div className="mt-6 text-center py-10">
              <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Clock size={24} className="text-gray-400" />
              </div>
              <p className="text-base font-medium text-black/70">
                Approval required to activate the basic subscription month
              </p>
              <p className="text-black/50 mt-1">
                Once approved, the partner receives 1 month basic subscription.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerDetailScreen;
