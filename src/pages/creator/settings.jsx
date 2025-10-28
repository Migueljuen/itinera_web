import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, CreditCard, Upload, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../constants/api";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const Settings = () => {
  const navigate = useNavigate();
  const { user, token, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState("Personal info");
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form states for Personal Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  // Form states for Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const tabs = [
    { name: "Personal info", icon: User },
    { name: "Security", icon: Lock },
    { name: "Subscription", icon: CreditCard },
  ];

  // Fetch user data on mount
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setUsername(user.username || "");
      setPhoneNumber(user.mobile_number || "");

      setEmail(user.email || "");

      // Set profile picture if exists
      if (user.profile_pic) {
        setProfilePic(`${API_URL}/${user.profile_pic}?t=${Date.now()}`);
      }
    }
  }, [user]);

  const handleProfilePicUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be under 10MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file (PNG or JPEG)");
        return;
      }

      setProfilePicFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };



  const handleSavePersonalInfo = async () => {
    try {
      setLoading(true);
      const formData = new FormData();

      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("username", username);
      formData.append("mobile_number", phoneNumber);

      formData.append("email", email);

      if (profilePicFile) {
        formData.append("profile_pic", profilePicFile);
      }

      const response = await axios.put(
        `${API_URL}/users/${user.user_id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Profile updated successfully!");
        const updatedUser = {
          ...user,
          first_name: firstName,
          last_name: lastName,
          username,
          mobile_number: phoneNumber,
          email,
        };

        if (response.data.profile_pic_path) {
          updatedUser.profile_pic = response.data.profile_pic_path;
          setProfilePic(`${API_URL}/${response.data.profile_pic_path}?t=${Date.now()}`);
        }


        updateUser(updatedUser);

        // Optionally refresh user data in context
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    // Validate passwords
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `${API_URL}/users/${user.user_id}`,
        {
          current_password: currentPassword,
          new_password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Password updated successfully!");
        const updatedUser = response.data.user;

        // Update profile picture preview
        if (updatedUser.profile_pic) {
          setProfilePic(`${API_URL}/${updatedUser.profile_pic}?t=${Date.now()}`);
        }


        updateUser(updatedUser);
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">

      <div className="">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-50 rounded-lg w-fit p-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-2 px-8 font-medium transition-colors py-2 rounded-lg ${activeTab === tab.name
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
        <div className="bg-white rounded-lg p-6">
          {activeTab === "Personal info" && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Update your photo and personal details here.
                </p>
              </div>

              {/* Profile Picture */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
                    {profilePic ? (
                      <img
                        src={profilePic}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={32} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <label className="px-6 py-2 border flex items-center gap-2 cursor-pointer border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                      <Upload size={16} />
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePicUpload}
                        className="hidden"
                      />
                    </label>

                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  We support PNGs and JPEGs under 10MB
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>


              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleSavePersonalInfo}
                  disabled={loading}
                  className="px-6 py-2 bg-[#3A81F3] text-white/90 rounded-lg hover:bg-[#3A81F3]/75 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "Security" && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Password
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Update your password to keep your account secure.
                </p>
              </div>

              <div className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 8 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleUpdatePassword}
                  disabled={loading}
                  className="px-6 py-2 bg-[#3A81F3] text-white/90 rounded-lg hover:bg-[#3A81F3]/75 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "Subscription" && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Subscription Plan
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Manage your subscription and billing information.
                </p>
              </div>

              {/* Current Plan */}
              <div className="border border-gray-200 rounded-lg p-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Pro Plan
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      Current plan - Renews on January 1, 2026
                    </p>
                    <div className="text-2xl font-bold text-gray-900">
                      $29
                      <span className="text-base font-normal text-gray-500">
                        /month
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    Active
                  </span>
                </div>
              </div>

              {/* Plan Features */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  Plan includes:
                </h4>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                    Unlimited bookings
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                    Priority support
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                    Custom branding
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="px-6 py-2 bg-[#3A81F3] text-white/90 rounded-lg hover:bg-[#3A81F3]/75">
                  Upgrade Plan
                </button>
                <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                  Cancel Subscription
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;