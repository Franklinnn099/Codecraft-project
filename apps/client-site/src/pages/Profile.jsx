import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Edit,
  ArrowLeft,
  Shield,
  Camera,
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import Header from "../components/header";
import Footer from "../components/footer";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Add error boundary protection
  useEffect(() => {
    const handleError = (event) => {
      console.error("Profile component error:", event.error);
    };

    window.addEventListener("error", handleError);
    return () => {
      window.removeEventListener("error", handleError);
    };
  }, []);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    avatar_url: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);

      // Determine which table to query based on user role
      const isAdmin = user.role && user.role !== "customer";
      const tableName = isAdmin ? "users" : "customers";

      let selectFields;
      if (isAdmin) {
        selectFields =
          "name, email, role, status, created_at, last_active, permissions";
      } else {
        selectFields = "name, email, phone, location, orders, spent";
      }

      const { data, error } = await supabase
        .from(tableName)
        .select(selectFields)
        .eq("id", user.id)
        .single();

      if (error && error.code === "PGRST116") {
        // Record not found, create it
        if (isAdmin) {
          // Create admin record
          const { error: insertError } = await supabase.from("users").upsert(
            {
              id: user.id,
              name: user.name || user.email?.split("@")[0] || "",
              email: user.email,
              role: user.role || "admin",
              status: "active",
              created_at: new Date().toISOString(),
              last_active: new Date().toISOString(),
              permissions: {},
            },
            {
              onConflict: "id",
            }
          );

          if (!insertError) {
            setProfile({
              name: user.name || user.email?.split("@")[0] || "",
              email: user.email,
              phone: "",
              address: "",
              city: "",
              avatar_url: "",
            });
          }
        } else {
          // Create customer record
          const { error: insertError } = await supabase
            .from("customers")
            .upsert(
              {
                id: user.id,
                name: user.name || user.email?.split("@")[0] || "",
                email: user.email,
                phone: "",
                location: "",
                orders: 0,
                spent: 0,
              },
              {
                onConflict: "id",
              }
            );

          if (!insertError) {
            setProfile({
              name: user.name || user.email?.split("@")[0] || "",
              email: user.email,
              phone: "",
              address: data?.location || "",
              city: "",
              avatar_url: "",
            });
          }
        }
      } else if (error) {
        throw error;
      } else {
        // Record exists, populate profile
        setProfile({
          name: data?.name || "",
          email: data?.email || user.email,
          phone: data?.phone || "",
          address: data?.location || data?.address || "",
          city: data?.city || "",
          avatar_url: data?.avatar_url || "",
        });
      }
    } catch (error) {
      console.error("Profile load error:", error);
      setError("Failed to load profile: " + error.message);
      // Set fallback profile data
      setProfile({
        name: user.name || user.email?.split("@")[0] || "",
        email: user.email,
        phone: "",
        address: "",
        city: "",
        avatar_url: "",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      // Determine which table to update based on user role
      const isAdmin = user.role && user.role !== "customer";
      const tableName = isAdmin ? "users" : "customers";

      let updateData;
      if (isAdmin) {
        updateData = {
          id: user.id,
          name: profile.name,
          email: profile.email,
          last_active: new Date().toISOString(),
        };
      } else {
        updateData = {
          id: user.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          location: profile.address, // customers table uses 'location' field
        };
      }

      const { error: upsertError } = await supabase
        .from(tableName)
        .upsert(updateData);

      if (upsertError) throw upsertError;

      // Update email if changed
      if (profile.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profile.email,
        });

        if (emailError) throw emailError;
        setMessage(
          "Profile updated successfully! Please check your email to confirm the new email address."
        );
      } else {
        setMessage("Profile updated successfully!");
      }

      setIsEditing(false);
    } catch (error) {
      setError("Failed to update profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      setMessage("Password updated successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordChange(false);
    } catch (error) {
      setError("Failed to update password: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordInputChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      setError("Please type 'DELETE' to confirm account deletion");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      // Determine which table to delete from based on user role
      const isAdmin = user.role && user.role !== "customer";
      const tableName = isAdmin ? "users" : "customers";

      // Delete user data from the appropriate table
      const { error: deleteUserError } = await supabase
        .from(tableName)
        .delete()
        .eq("id", user.id);

      if (deleteUserError) {
        console.error("Delete user data error:", deleteUserError);
        // Continue with signout even if database delete fails
      }

      // Sign out the user
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.error("Sign out error:", signOutError);
      }

      setMessage(
        "Account data deleted successfully. You will be redirected to home page."
      );

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Delete account error:", error);
      setError("Failed to delete account: " + error.message);
      
      // Still try to sign out even if delete failed
      try {
        await supabase.auth.signOut();
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (signOutErr) {
        console.error("Sign out after delete error:", signOutErr);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100">
      <Header />

      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Profile Header */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {profile.name
                  ? profile.name.charAt(0).toUpperCase()
                  : user.email.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mt-4 mb-2">
              {profile.name || "User Profile"}
            </h1>
            <p className="text-gray-600 flex items-center justify-center gap-2">
              <Shield size={16} />
              {user.role || "Customer"} Account
            </p>
          </div>

          {/* Messages */}
          {message && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl flex items-center gap-2">
              <CheckCircle size={20} />
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Profile Form */}
          <div className="backdrop-blur-lg bg-white/80 rounded-3xl shadow-2xl border border-white/50 p-8 mb-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <User className="text-green-500" size={28} />
                Profile Information
              </h2>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-yellow-500 text-white rounded-xl hover:from-green-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl"
                >
                  <Edit size={18} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <form
              onSubmit={handleProfileUpdate}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                      !isEditing ? "bg-gray-50 text-gray-600" : "bg-white"
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                      !isEditing ? "bg-gray-50 text-gray-600" : "bg-white"
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                      !isEditing ? "bg-gray-50 text-gray-600" : "bg-white"
                    }`}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    name="city"
                    value={profile.city}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                      !isEditing ? "bg-gray-50 text-gray-600" : "bg-white"
                    }`}
                    placeholder="Enter your city"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-3 text-gray-400"
                    size={18}
                  />
                  <textarea
                    name="address"
                    value={profile.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows="3"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none ${
                      !isEditing ? "bg-gray-50 text-gray-600" : "bg-white"
                    }`}
                    placeholder="Enter your address"
                  />
                </div>
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-yellow-500 text-white rounded-xl hover:from-green-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Password Change Section */}
          <div className="backdrop-blur-lg bg-white/80 rounded-3xl shadow-2xl border border-white/50 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <Lock className="text-green-500" size={28} />
                Security Settings
              </h2>

              {!showPasswordChange && (
                <button
                  onClick={() => setShowPasswordChange(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-yellow-500 text-white rounded-xl hover:from-green-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl"
                >
                  <Lock size={18} />
                  Change Password
                </button>
              )}
            </div>

            {showPasswordChange && (
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordForm({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                      setError("");
                    }}
                    className="flex-1 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-yellow-500 text-white rounded-xl hover:from-green-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {!showPasswordChange && (
              <p className="text-gray-600">
                Keep your account secure by using a strong password and updating
                it regularly.
              </p>
            )}
          </div>

          {/* Delete Account Section */}
          <div className="mt-8 backdrop-blur-lg bg-red-50/80 rounded-3xl shadow-2xl border border-red-200/50 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-red-800 flex items-center gap-3">
                <AlertTriangle className="text-red-600" size={28} />
                Danger Zone
              </h2>
            </div>

            {!showDeleteConfirm ? (
              <div>
                <p className="text-red-700 mb-4">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <Trash2 size={18} />
                  Delete Account
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-red-100 border border-red-300 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="text-red-600" size={20} />
                    <span className="font-semibold text-red-800">
                      Warning: This action cannot be undone
                    </span>
                  </div>
                  <p className="text-red-700 text-sm">
                    This will permanently delete your account and remove your
                    data from our servers. All your orders, profile information,
                    and account history will be lost forever.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-red-700 mb-2">
                    Type "DELETE" to confirm account deletion
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-red-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Type DELETE to confirm"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText("");
                      setError("");
                    }}
                    className="flex-1 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading || deleteConfirmText !== "DELETE"}
                    className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={18} />
                        Delete My Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
