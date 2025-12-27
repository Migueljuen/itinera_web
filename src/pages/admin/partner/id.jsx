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

    useEffect(() => {
        fetchPartnerDetails();
    }, [id]);

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

    const handleStatusUpdate = async (newStatus) => {
        try {
            setUpdatingStatus(true);
            const response = await axios.patch(
                `${API_URL}/partner/${id}/status`,
                { status: newStatus }
            );

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
                        {/* Status Badge */}
                        {/* <div
                            className={`px-4 py-2 rounded-full border-2 ${getStatusColor(
                                user.status
                            )}`}
                        >
                            <span className="font-medium">{user.status}</span>
                        </div> */}
                        {user.status === "Pending" && (
                            <div className="gap-4  flex">
                                <button
                                    onClick={() => handleStatusUpdate("Approved")}
                                    disabled={updatingStatus}
                                    className="  w-full py-3 px-8 bg-black/80 text-white rounded-lg hover:bg-black/70 cursor-pointer"
                                >

                                    Approve
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate("Rejected")}
                                    disabled={updatingStatus}
                                    className="  w-full py-3 px-8 border-2 border-black/80 text-black/80 rounded-lg hover:bg-black/10 cursor-pointer"
                                >

                                    Decline
                                </button>
                            </div>
                        )}


                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Left Column - Profile Card */}
                    <div className="col-span-1">
                        <div className="bg-white rounded-2xl border-2 border-gray-300 px-10 py-16">
                            <div className="flex flex-col items-center">
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
                                <h2 className="text-xl flex  items-center gap-1 font-semibold text-black/80 text-center">
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

                            <div className="border-t border-gray-200 mt-6 pt-6">
                                <h3 className=" font-semibold text-black/80 mb-4">
                                    Contact Information
                                </h3>
                                <div className="space-y-4">
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
                                    <div className="space-y-2">
                                        {user.status !== "Approved" && (
                                            <button
                                                onClick={() => handleStatusUpdate("Approved")}
                                                disabled={updatingStatus}
                                                className="w-full px-4 py-2 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                            >
                                                Set as Approved
                                            </button>
                                        )}
                                        {user.status !== "Rejected" && (
                                            <button
                                                onClick={() => handleStatusUpdate("Rejected")}
                                                disabled={updatingStatus}
                                                className="w-full px-4 py-2 border-2 bg-black/80 text-white rounded-lg  disabled:opacity-50 disabled:cursor-not-allowed transition-colors "
                                            >
                                                Set as Rejected
                                            </button>
                                        )}
                                        {user.status !== "Pending" && (
                                            <button
                                                onClick={() => handleStatusUpdate("Pending")}
                                                disabled={updatingStatus}
                                                className="w-full px-4 py-2 border-2   text-black/80 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors "
                                            >
                                                Set as Pending
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Profile Details */}
                    <div className="col-span-2 space-y-6">
                        {/* Guide Profile */}
                        {user.role === "Guide" && profile && (
                            <>
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

                                {/* Documents */}
                                <div className="bg-white rounded-2xl border-2 border-gray-300 p-6">
                                    <h3 className="text-lg font-semibold text-black/80 mb-6">
                                        Documents
                                    </h3>
                                    <div className="space-y-3">
                                        {profile.id_document ? (
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
                                        ) : (
                                            <p className="text-sm text-black/60 text-center py-4">
                                                No documents uploaded
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Driver Profile */}
                        {user.role === "Driver" && profile && (
                            <>
                                <div className="bg-white rounded-2xl border-2 border-gray-300 p-6">
                                    <h3 className="text-lg font-semibold text-black/80 mb-6">
                                        Driver Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className=" rounded-lg p-4">
                                            <p className="text-sm text-black/60 mb-1">
                                                Service Area
                                            </p>
                                            <p className="text-lg font-semibold text-black/80">
                                                {profile.service_area || "Not specified"}
                                            </p>
                                        </div>
                                        <div className=" rounded-lg p-4">
                                            <p className="text-sm text-black/60 mb-1">
                                                Multi-day Service
                                            </p>
                                            <p className="text-lg font-semibold text-black/80">
                                                {profile.is_multi_day ? "Available" : "Not Available"}
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
                                                            className="px-4 py-2 bg-gray-100  text-gray-700 rounded-full text-sm font-medium border border-gray-300"
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

                                {/* Documents */}
                                <div className="bg-white rounded-2xl border-2 border-gray-300 p-6">
                                    <h3 className="text-lg font-semibold text-black/80 mb-6">
                                        Documents
                                    </h3>
                                    <div className="space-y-3">
                                        {profile.license_document && (
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
                                        {!profile.license_document && !profile.id_document && (
                                            <p className="text-sm text-black/60 text-center py-4">
                                                No documents uploaded
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Creator Profile */}
                        {user.role === "Creator" && profile && (
                            <>
                                <div className="bg-white rounded-2xl border-2 border-gray-300 p-6">
                                    <h3 className="text-lg font-semibold text-black/80 mb-6">
                                        Activity Partner Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-sm text-black/60 mb-1">
                                                Availability Status
                                            </p>
                                            <p className="text-lg font-semibold text-black/80">
                                                {profile.availability_status}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Documents */}
                                <div className="bg-white rounded-2xl border-2 border-gray-300 p-6">
                                    <h3 className="text-lg font-semibold text-black/80 mb-6">
                                        Documents
                                    </h3>
                                    <div className="space-y-3">
                                        {profile.id_document ? (
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
                                        ) : (
                                            <p className="text-sm text-black/60 text-center py-4">
                                                No documents uploaded
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnerDetailScreen;