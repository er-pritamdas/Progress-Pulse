import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate, useBlocker } from "react-router-dom";
import { 
  User, 
  Camera, 
  Upload, 
  Trash2, 
  Save, 
  RotateCcw, 
  Mail, 
  Phone, 
  Briefcase, 
  FileText, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  Palette, 
  Coins, 
  ShieldCheck, 
  Clock,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Globe,
  MapPin,
  Calendar,
  AlertTriangle,
  AlertOctagon,
  Activity,
  Wallet,
  TrendingUp,
  X,
  Check,
  ShieldAlert
} from "lucide-react";
import { TitleChanger } from "../../../utils/TitleChanger";
import axiosInstance from "../../../Context/AxiosInstance";
import SuccessAlert from "../../../utils/Alerts/SuccessAlert";
import ErrorAlert from "../../../utils/Alerts/ErrorAlert";
import { 
  COMMON_TIMEZONES, 
  getSystemGeoTimeZone, 
  getActiveTimeZone, 
  getGeoDateTime 
} from "../../../utils/geoDateTime";

// Sample preset avatars
const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
];

const AVAILABLE_THEMES = [
  { name: "night", label: "Night", emoji: "🌃" },
  { name: "dark", label: "Dark", emoji: "🌙" },
  { name: "sunset", label: "Sunset", emoji: "🌅" },
  { name: "forest", label: "Forest", emoji: "🌲" },
  { name: "aqua", label: "Aqua", emoji: "💧" },
  { name: "business", label: "Business", emoji: "💼" },
  { name: "retro", label: "Retro", emoji: "📼" },
  { name: "black", label: "Black", emoji: "⚫" },
  { name: "dracula", label: "Dracula", emoji: "🧛" },
  { name: "coffee", label: "Coffee", emoji: "☕" },
  { name: "abyss", label: "Abyss", emoji: "🌊" },
];

const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee (₹)" },
  { code: "USD", symbol: "$", name: "US Dollar ($)" },
  { code: "EUR", symbol: "€", name: "Euro (€)" },
  { code: "GBP", symbol: "£", name: "British Pound (£)" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen (¥)" },
];

const DOB_MONTHS = [
  { value: "01", label: "Jan" },
  { value: "02", label: "Feb" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Apr" },
  { value: "05", label: "May" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Aug" },
  { value: "09", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

const CURRENT_YEAR = new Date().getFullYear();
const DOB_YEARS = Array.from({ length: CURRENT_YEAR - 1920 + 1 }, (_, i) => CURRENT_YEAR - i);

const parseDob = (dobStr) => {
  if (!dobStr) return { day: "", month: "", year: "" };
  const str = String(dobStr).trim();
  const m1 = str.match(/^(\d{4}|____)-(\d{2}|__)-(\d{2}|__)/);
  if (m1) {
    return {
      year: m1[1] === "____" ? "" : m1[1],
      month: m1[2] === "__" ? "" : m1[2],
      day: m1[3] === "__" ? "" : m1[3],
    };
  }
  const m2 = str.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})/);
  if (m2) {
    const mi = DOB_MONTHS.findIndex(
      (item) => item.label.toLowerCase() === m2[2].toLowerCase()
    );
    return {
      day: String(parseInt(m2[1], 10)).padStart(2, "0"),
      month: mi >= 0 ? DOB_MONTHS[mi].value : "",
      year: m2[3],
    };
  }
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return {
      year: String(d.getFullYear()),
      month: String(d.getMonth() + 1).padStart(2, "0"),
      day: String(d.getDate()).padStart(2, "0"),
    };
  }
  return { day: "", month: "", year: "" };
};

const getDaysInMonth = (year, month) => {
  if (!month) return 31;
  const y = parseInt(year, 10) || 2024;
  const m = parseInt(month, 10);
  return new Date(y, m, 0).getDate();
};

function UserSettings() {
  TitleChanger("Progress Pulse | User Settings");

  const fileInputRef = useRef(null);
  const initialProfileRef = useRef(null);

  // Profile form state
  const [profile, setProfile] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    occupation: "",
    bio: "",
    profilePic: "",
    currency: "INR",
    theme: "night",
    timezone: localStorage.getItem("user_timezone") || "auto",
  });

  const dobParts = parseDob(profile.dateOfBirth);
  const maxDays = getDaysInMonth(dobParts.year, dobParts.month);

  const handleDobPartChange = (part, value) => {
    const current = parseDob(profile.dateOfBirth);
    const updated = { ...current, [part]: value };

    if (updated.month) {
      const allowedDays = getDaysInMonth(updated.year, updated.month);
      if (updated.day && parseInt(updated.day, 10) > allowedDays) {
        updated.day = String(allowedDays).padStart(2, "0");
      }
    }

    if (updated.year && updated.month && updated.day) {
      setProfile((prev) => ({
        ...prev,
        dateOfBirth: `${updated.year}-${updated.month}-${updated.day}`,
      }));
    } else if (!updated.year && !updated.month && !updated.day) {
      setProfile((prev) => ({ ...prev, dateOfBirth: "" }));
    } else {
      const y = updated.year || "____";
      const m = updated.month || "__";
      const d = updated.day || "__";
      setProfile((prev) => ({
        ...prev,
        dateOfBirth: `${y}-${m}-${d}`,
      }));
    }
  };

  const [previewDateTime, setPreviewDateTime] = useState(() =>
    getGeoDateTime(profile.timezone === "auto" ? undefined : profile.timezone)
  );

  useEffect(() => {
    const updatePreview = () => {
      setPreviewDateTime(
        getGeoDateTime(profile.timezone === "auto" ? undefined : profile.timezone)
      );
    };
    updatePreview();
    const timer = setInterval(updatePreview, 1000);
    return () => clearInterval(timer);
  }, [profile.timezone]);

  // Password update state
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL path
  const getTabFromPath = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes("/danger-zone")) return "danger";
    if (path.includes("/preferences")) return "appearance";
    if (path.includes("/security")) return "security";
    return "profile";
  };

  // Track if any changes have been made relative to clean saved baseline
  const isDirty = useMemo(() => {
    if (!initialProfileRef.current) return false;
    const init = initialProfileRef.current;

    const profileChanged =
      (profile.fullName || "").trim() !== (init.fullName || "").trim() ||
      (profile.phone || "").trim() !== (init.phone || "").trim() ||
      (profile.dateOfBirth || "").trim() !== (init.dateOfBirth || "").trim() ||
      (profile.occupation || "").trim() !== (init.occupation || "").trim() ||
      (profile.bio || "").trim() !== (init.bio || "").trim() ||
      (profile.profilePic || "") !== (init.profilePic || "") ||
      (profile.currency || "INR") !== (init.currency || "INR") ||
      (profile.theme || "night") !== (init.theme || "night") ||
      (profile.timezone || "auto") !== (init.timezone || "auto");

    const passwordEntered = Boolean(
      passwords.currentPassword || passwords.newPassword || passwords.confirmPassword
    );

    return profileChanged || passwordEntered;
  }, [profile, passwords]);

  // Intercept in-app navigation when there are unsaved changes
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      Boolean(isDirty && currentLocation.pathname !== nextLocation.pathname)
  );

  // Intercept browser window / tab close or page reload when dirty
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Close blocker modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && blocker.state === "blocked") {
        blocker.reset();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [blocker.state]);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(getTabFromPath);
  const [dragActive, setDragActive] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState("");
  const [alertError, setAlertError] = useState("");

  // Sync tab with URL changes
  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  const switchTab = (tabKey) => {
    const pathMap = {
      profile: "/dashboard/settings/profile",
      appearance: "/dashboard/settings/preferences",
      security: "/dashboard/settings/security",
      danger: "/dashboard/settings/danger-zone",
    };
    const targetPath = pathMap[tabKey] || "/dashboard/settings/profile";
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  const handleSaveAndLeave = async () => {
    const success = await handleSave();
    if (success && blocker.state === "blocked") {
      blocker.proceed();
    }
  };

  const handleDiscardAndLeave = () => {
    if (initialProfileRef.current) {
      const savedTheme = initialProfileRef.current.theme || "night";
      document.documentElement.setAttribute("data-theme", savedTheme);
      localStorage.setItem("theme", savedTheme);

      const savedTz = initialProfileRef.current.timezone || "auto";
      localStorage.setItem("user_timezone", savedTz);
      window.dispatchEvent(new Event("user-timezone-updated"));

      setProfile({ ...initialProfileRef.current });
    }
    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    if (blocker.state === "blocked") {
      blocker.proceed();
    }
  };

  const handleKeepEditing = () => {
    if (blocker.state === "blocked") {
      blocker.reset();
    }
  };

  // Danger Zone state
  const [resetModal, setResetModal] = useState(null); // 'habit' | 'expense' | 'investment' | 'all' | null
  const [confirmInput, setConfirmInput] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const openResetModal = (type) => {
    setResetModal(type);
    setConfirmInput("");
  };

  const closeResetModal = () => {
    setResetModal(null);
    setConfirmInput("");
  };

  const handleExecuteReset = async () => {
    if (!resetModal) return;

    const requiredPhrase = {
      habit: "RESET HABITS",
      expense: "RESET EXPENSES",
      investment: "RESET INVESTMENTS",
      all: "WIPE EVERYTHING",
    }[resetModal];

    if (confirmInput.trim().toUpperCase() !== requiredPhrase) {
      showError(`Please type "${requiredPhrase}" exactly to confirm.`);
      return;
    }

    setIsResetting(true);
    try {
      const urlMap = {
        habit: "/v1/dashboard/danger-zone/reset-habit",
        expense: "/v1/dashboard/danger-zone/reset-expense",
        investment: "/v1/dashboard/danger-zone/reset-investment",
        all: "/v1/dashboard/danger-zone/reset-all",
      };

      await axiosInstance.post(urlMap[resetModal]);

      if (resetModal === "habit" || resetModal === "all") {
        localStorage.removeItem("food_tracker_collapsed_meals");
        localStorage.removeItem("food_tracker_visible_cards");
        localStorage.removeItem("food_tracker_table_nutrients");
        localStorage.removeItem("selected_nutrient_graphs_v2");
        localStorage.removeItem("selected_nutrient_table_columns_v2");
        window.dispatchEvent(new Event("habit-data-reset"));
      }
      if (resetModal === "expense" || resetModal === "all") {
        localStorage.removeItem("expense_excluded_sources");
        localStorage.removeItem("expense_reimbursable_splits");
        window.dispatchEvent(new Event("expense-data-reset"));
      }
      if (resetModal === "investment" || resetModal === "all") {
        localStorage.removeItem("pulse_investment_planners");
        localStorage.removeItem("pulse_investment_allocations");
        localStorage.removeItem("pulse_planner_unallocated_assets");
        window.dispatchEvent(new Event("investment-data-reset"));
      }
      if (resetModal === "all") {
        window.dispatchEvent(new Event("all-data-reset"));
      }

      showSuccess(
        resetModal === "all"
          ? "All tracker databases have been wiped clean."
          : `${resetModal.charAt(0).toUpperCase() + resetModal.slice(1)} tracker data has been reset.`
      );
      closeResetModal();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to reset tracker data";
      showError(msg);
    } finally {
      setIsResetting(false);
    }
  };

  const showSuccess = (msg) => {
    setAlertSuccess(msg);
    setTimeout(() => setAlertSuccess(""), 4000);
  };

  const showError = (msg) => {
    setAlertError(msg);
    setTimeout(() => setAlertError(""), 4000);
  };

  // Load existing profile from localStorage and backend
  useEffect(() => {
    const loadProfileData = async () => {
      setIsLoading(true);
      const storedUser = localStorage.getItem("username") || "";
      const storedEmail = localStorage.getItem("email") || "";
      const storedPic = localStorage.getItem("profilePic") || "";
      const storedTheme = localStorage.getItem("theme") || "night";
      const storedTz = localStorage.getItem("user_timezone") || "auto";
      let localData = {};

      try {
        const parsed = JSON.parse(localStorage.getItem("user_profile") || "{}");
        if (parsed && typeof parsed === "object") {
          localData = parsed;
        }
      } catch (e) {
        console.error("Error parsing local user_profile", e);
      }

      // Default baseline from localStorage and database cache
      const baseProfile = {
        fullName: localData.fullName || storedUser || "",
        username: storedUser,
        email: localData.email || storedEmail || "",
        phone: localData.phone || "",
        dateOfBirth: localData.dateOfBirth || "",
        occupation: localData.occupation || "",
        bio: localData.bio || "",
        profilePic: storedPic || localData.profilePic || "",
        currency: localData.currency || "INR",
        theme: storedTheme,
        timezone: localData.timezone || storedTz || "auto",
      };

      setProfile(baseProfile);
      initialProfileRef.current = { ...baseProfile };

      // Attempt to load fresh data from server (MongoDB)
      try {
        const res = await axiosInstance.get("/v1/dashboard/profile");
        if (res.data?.data) {
          const u = res.data.data;
          const merged = {
            ...baseProfile,
            fullName: u.fullName || baseProfile.fullName,
            username: u.username || baseProfile.username,
            email: u.email || baseProfile.email || storedEmail,
            phone: u.phone || baseProfile.phone,
            dateOfBirth: u.dateOfBirth || baseProfile.dateOfBirth,
            occupation: u.occupation || baseProfile.occupation,
            bio: u.bio || baseProfile.bio,
            profilePic: u.profilePic || baseProfile.profilePic,
            currency: u.currency || baseProfile.currency,
            timezone: u.timezone || baseProfile.timezone,
          };
          setProfile(merged);
          initialProfileRef.current = { ...merged };
          localStorage.setItem("user_profile", JSON.stringify(merged));
          if (u.email) {
            localStorage.setItem("email", u.email);
          }
          if (merged.profilePic) {
            localStorage.setItem("profilePic", merged.profilePic);
          }
        }
      } catch (err) {
        // Fallback silently to localStorage
        console.log("Profile loaded from local storage fallback");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, []);

  // Compute initials for fallback
  const getInitials = () => {
    const name = profile.fullName || profile.username || "User";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (parts[0][0] || "U").toUpperCase();
  };

  // Optimize & resize image through canvas to keep base64 compact
  const processImageFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError("Please select a valid image file (PNG, JPG, WebP, GIF).");
      return;
    }

    // 5MB raw limit
    if (file.size > 5 * 1024 * 1024) {
      showError("Image file size exceeds 5MB limit. Please choose a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Resize to standard 400x400 max keeping aspect ratio
        const maxDimension = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to high-quality compressed JPEG data URL
        const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
        setProfile((prev) => ({ ...prev, profilePic: dataUrl }));
        showSuccess("Photo selected! Click 'Save Changes' to apply.");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemovePhoto = () => {
    setProfile((prev) => ({ ...prev, profilePic: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    showSuccess("Profile photo removed. Save to confirm.");
  };

  const handleSelectPreset = (url) => {
    setProfile((prev) => ({ ...prev, profilePic: url }));
    showSuccess("Preset avatar selected! Click 'Save Changes' to apply.");
  };

  const handleThemeChange = (selectedTheme) => {
    setProfile((prev) => ({ ...prev, theme: selectedTheme }));
    document.documentElement.setAttribute("data-theme", selectedTheme);
    localStorage.setItem("theme", selectedTheme);
  };

  const handleTimezoneChange = (selectedTz) => {
    setProfile((prev) => ({ ...prev, timezone: selectedTz }));
    localStorage.setItem("user_timezone", selectedTz);
    window.dispatchEvent(new Event("user-timezone-updated"));
    showSuccess(
      selectedTz === "auto"
        ? "Timezone set to Auto-Detect Geographic Location"
        : `Timezone updated to ${selectedTz}`
    );
  };

  // Save changes
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      // Validate password if provided
      if (passwords.newPassword) {
        if (!passwords.currentPassword) {
          showError("Current password is required to change password.");
          setIsSaving(false);
          return false;
        }
        if (passwords.newPassword.length < 6) {
          showError("New password must be at least 6 characters.");
          setIsSaving(false);
          return false;
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
          showError("New passwords do not match.");
          setIsSaving(false);
          return false;
        }
      }

      // Update LocalStorage first for instant responsiveness
      localStorage.setItem("user_profile", JSON.stringify(profile));
      localStorage.setItem("user_timezone", profile.timezone || "auto");
      window.dispatchEvent(new Event("user-timezone-updated"));

      if (profile.profilePic) {
        localStorage.setItem("profilePic", profile.profilePic);
      } else {
        localStorage.removeItem("profilePic");
      }
      if (profile.fullName) {
        localStorage.setItem("fullName", profile.fullName);
      }

      // Sync with server if endpoint is accessible
      try {
        const payload = {
          fullName: profile.fullName,
          profilePic: profile.profilePic,
          bio: profile.bio,
          phone: profile.phone,
          dateOfBirth: profile.dateOfBirth,
          occupation: profile.occupation,
          currency: profile.currency,
          timezone: profile.timezone,
          ...(passwords.newPassword
            ? {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
              }
            : {}),
        };
        await axiosInstance.put("/v1/dashboard/profile", payload);
      } catch (apiErr) {
        console.log("Backend profile sync notice: Local copy saved successfully.", apiErr?.message);
      }

      // Broadcast event so Navbar and other components update immediately
      window.dispatchEvent(
        new CustomEvent("user-profile-updated", {
          detail: {
            profilePic: profile.profilePic,
            fullName: profile.fullName,
            username: profile.username,
          },
        })
      );

      // Reset password fields and baseline ref
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      initialProfileRef.current = { ...profile };

      showSuccess("Settings and Profile Picture saved successfully!");
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to update profile";
      showError(msg);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Toast Alerts */}
      {alertSuccess && <SuccessAlert message={alertSuccess} onClose={() => setAlertSuccess("")} />}
      {alertError && <ErrorAlert message={alertError} onClose={() => setAlertError("")} />}

      {/* Top Tabs Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-base-200/80 border border-base-300 p-2 rounded-2xl shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => switchTab("profile")}
            className={`btn btn-sm rounded-xl gap-2 font-bold transition-all shrink-0 ${
              activeTab === "profile"
                ? "btn-primary shadow-xs"
                : "btn-ghost text-base-content/70 hover:text-base-content hover:bg-base-300/60"
            }`}
          >
            <User size={15} />
            Profile & Picture
          </button>

          <button
            onClick={() => switchTab("appearance")}
            className={`btn btn-sm rounded-xl gap-2 font-bold transition-all shrink-0 ${
              activeTab === "appearance"
                ? "btn-primary shadow-xs"
                : "btn-ghost text-base-content/70 hover:text-base-content hover:bg-base-300/60"
            }`}
          >
            <Palette size={15} />
            Theme & Preferences
          </button>

          <button
            onClick={() => switchTab("security")}
            className={`btn btn-sm rounded-xl gap-2 font-bold transition-all shrink-0 ${
              activeTab === "security"
                ? "btn-primary shadow-xs"
                : "btn-ghost text-base-content/70 hover:text-base-content hover:bg-base-300/60"
            }`}
          >
            <ShieldCheck size={15} />
            Security & Password
          </button>

          <button
            onClick={() => switchTab("danger")}
            className={`btn btn-sm rounded-xl gap-2 font-bold transition-all shrink-0 ${
              activeTab === "danger"
                ? "btn-error text-error-content shadow-xs"
                : "btn-ghost text-error hover:bg-error/15"
            }`}
          >
            <AlertTriangle size={15} />
            Danger Zone
            <span className={`badge badge-xs ${activeTab === "danger" ? "badge-neutral" : "badge-error"}`}>
              Reset
            </span>
          </button>
        </div>

        {activeTab !== "danger" && (
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {isDirty && (
              <span className="badge badge-warning badge-soft text-[11px] font-bold gap-1 animate-pulse border border-warning/30">
                <span className="w-1.5 h-1.5 rounded-full bg-warning"></span>
                Unsaved Changes
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-primary btn-sm rounded-xl font-bold px-5 gap-2 shadow-xs shrink-0"
            >
              {isSaving ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={15} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: Profile & Avatar Upload */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar Upload Card (Left Column) */}
          <div className="card bg-base-200 border border-base-300 shadow-sm rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-base-content flex items-center gap-2">
                  <Camera size={18} className="text-primary" />
                  Profile Picture
                </h3>
                <span className="badge badge-outline text-xs">
                  {profile.profilePic ? "Custom Photo" : "Initials"}
                </span>
              </div>

              {/* Avatar Preview Display */}
              <div className="flex flex-col items-center justify-center my-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-base-100 shadow-xl ring-4 ring-primary/20 bg-neutral flex items-center justify-center">
                    {profile.profilePic ? (
                      <img
                        src={profile.profilePic}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral text-neutral-content text-4xl font-black">
                        {getInitials()}
                      </div>
                    )}
                  </div>

                  {/* Camera overlay quick button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 p-2.5 rounded-full bg-primary text-primary-content shadow-lg hover:scale-110 active:scale-95 transition-all"
                    title="Choose photo"
                  >
                    <Camera size={16} />
                  </button>
                </div>

                <p className="font-bold text-base mt-3 text-base-content">
                  {profile.fullName || profile.username || "User"}
                </p>
                <p className="text-xs text-base-content/60 font-mono">
                  @{profile.username || "user"}
                </p>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Drag & Drop Upload Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                  dragActive
                    ? "border-primary bg-primary/10"
                    : "border-base-300 hover:border-primary/50 bg-base-100/50 hover:bg-base-100"
                }`}
              >
                <Upload size={22} className="mx-auto text-primary mb-1.5" />
                <p className="text-xs font-bold text-base-content">
                  Click to upload or drag & drop
                </p>
                <p className="text-[11px] text-base-content/60 mt-0.5">
                  PNG, JPG, WebP up to 5MB
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-sm btn-primary flex-1 rounded-xl gap-1.5 font-semibold"
                >
                  <Upload size={14} />
                  Upload Photo
                </button>
                {profile.profilePic && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="btn btn-sm btn-error btn-soft rounded-xl gap-1.5 font-semibold"
                    title="Remove custom photo"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Avatar Presets Selection */}
            <div className="mt-6 pt-4 border-t border-base-300">
              <p className="text-xs font-bold text-base-content/70 mb-2.5 flex items-center gap-1.5">
                <Sparkles size={13} className="text-warning" />
                Or pick a preset avatar:
              </p>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_AVATARS.map((url, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectPreset(url)}
                    className={`aspect-square rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${
                      profile.profilePic === url
                        ? "border-primary ring-2 ring-primary/40 scale-105"
                        : "border-base-300 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Preset ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Personal Details Form (Right 2 Columns) */}
          <div className="lg:col-span-2 card bg-base-200 border border-base-300 shadow-sm rounded-3xl p-6 sm:p-8">
            <h3 className="text-lg font-black text-base-content flex items-center gap-2 mb-6">
              <User size={18} className="text-primary" />
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* Full Name */}
              <div className="form-control">
                <label className="label text-xs font-bold uppercase tracking-wider text-base-content/70">
                  Full Name / Display Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    placeholder="Enter your full name"
                    className="input input-bordered w-full rounded-xl pl-10 text-sm font-medium"
                  />
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                </div>
              </div>

              {/* Username (Locked/Readonly) */}
              <div className="form-control">
                <label className="label text-xs font-bold uppercase tracking-wider text-base-content/70">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.username}
                    readOnly
                    className="input input-bordered w-full rounded-xl pl-10 text-sm font-medium bg-base-300/50 cursor-not-allowed opacity-80"
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-base-content/40">
                    @
                  </span>
                  <span className="badge badge-neutral badge-xs absolute right-3 top-1/2 -translate-y-1/2">
                    Primary
                  </span>
                </div>
              </div>

              {/* Email Address */}
              <div className="form-control">
                <label className="label text-xs font-bold uppercase tracking-wider text-base-content/70">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={profile.email || ""}
                    readOnly
                    placeholder="Loading registered email..."
                    className="input input-bordered w-full rounded-xl pl-10 pr-24 text-sm font-medium bg-base-300/50 cursor-not-allowed opacity-90 text-base-content"
                  />
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                  <span className="badge badge-success badge-soft badge-xs font-bold absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <CheckCircle2 size={11} />
                    Verified
                  </span>
                </div>
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Registered email securely linked to your account from database
                  </span>
                </label>
              </div>

              {/* Phone */}
              <div className="form-control">
                <label className="label text-xs font-bold uppercase tracking-wider text-base-content/70">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="input input-bordered w-full rounded-xl pl-10 text-sm font-medium"
                  />
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                </div>
              </div>

              {/* Date of Birth - Three Dropdowns: Date, MMM, Year */}
              <div className="form-control">
                <div className="flex items-center justify-between mb-1">
                  <label className="label text-xs font-bold uppercase tracking-wider text-base-content/70 p-0">
                    Date of Birth
                  </label>
                  {dobParts.day && dobParts.month && dobParts.year ? (
                    <div className="flex items-center gap-1.5">
                      <span className="badge badge-primary badge-soft text-[11px] font-mono font-bold">
                        {dobParts.day}-{DOB_MONTHS.find((m) => m.value === dobParts.month)?.label}-{dobParts.year}
                      </span>
                      <button
                        type="button"
                        onClick={() => setProfile((prev) => ({ ...prev, dateOfBirth: "" }))}
                        className="text-[10px] text-error hover:underline cursor-pointer font-semibold ml-1"
                      >
                        Clear
                      </button>
                    </div>
                  ) : (dobParts.day || dobParts.month || dobParts.year) ? (
                    <button
                      type="button"
                      onClick={() => setProfile((prev) => ({ ...prev, dateOfBirth: "" }))}
                      className="text-[10px] text-error hover:underline cursor-pointer font-semibold"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {/* Date (Day) Dropdown */}
                  <div className="relative">
                    <select
                      value={dobParts.day}
                      onChange={(e) => handleDobPartChange("day", e.target.value)}
                      className="select select-bordered w-full rounded-xl text-sm font-medium focus:border-primary/50"
                    >
                      <option value="">Date</option>
                      {Array.from({ length: maxDays }, (_, i) => {
                        const d = String(i + 1).padStart(2, "0");
                        return (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* MMM (Month) Dropdown */}
                  <div className="relative">
                    <select
                      value={dobParts.month}
                      onChange={(e) => handleDobPartChange("month", e.target.value)}
                      className="select select-bordered w-full rounded-xl text-sm font-medium focus:border-primary/50"
                    >
                      <option value="">MMM</option>
                      {DOB_MONTHS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year Dropdown */}
                  <div className="relative">
                    <select
                      value={dobParts.year}
                      onChange={(e) => handleDobPartChange("year", e.target.value)}
                      className="select select-bordered w-full rounded-xl text-sm font-medium focus:border-primary/50"
                    >
                      <option value="">Year</option>
                      {DOB_YEARS.map((yr) => (
                        <option key={yr} value={String(yr)}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Occupation / Role */}
              <div className="form-control sm:col-span-2">
                <label className="label text-xs font-bold uppercase tracking-wider text-base-content/70">
                  Occupation / Professional Title
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.occupation}
                    onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                    placeholder="Software Engineer / Financial Analyst / Entrepreneur"
                    className="input input-bordered w-full rounded-xl pl-10 text-sm font-medium"
                  />
                  <Briefcase size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                </div>
              </div>

              {/* Bio */}
              <div className="form-control sm:col-span-2">
                <label className="label text-xs font-bold uppercase tracking-wider text-base-content/70">
                  Bio / Personal Motto
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell us a little bit about yourself or your productivity & financial goals..."
                    className="textarea textarea-bordered w-full rounded-xl p-3 text-sm font-medium resize-none"
                  />
                </div>
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Brief bio shown in your dashboard profile header
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-base-300 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (initialProfileRef.current) {
                    setProfile({ ...initialProfileRef.current });
                  } else {
                    const storedPic = localStorage.getItem("profilePic") || "";
                    const storedEmail = localStorage.getItem("email") || "";
                    const parsed = JSON.parse(localStorage.getItem("user_profile") || "{}");
                    setProfile((prev) => ({
                      ...prev,
                      ...parsed,
                      email: parsed.email || storedEmail || prev.email,
                      profilePic: storedPic,
                    }));
                  }
                  setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  showSuccess("Reset to saved profile");
                }}
                className="btn btn-ghost rounded-xl gap-2 font-semibold text-base-content/70"
              >
                <RotateCcw size={16} />
                Reset
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="btn btn-primary rounded-xl px-6 font-bold gap-2 shadow-sm"
              >
                {isSaving ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <Save size={16} />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Appearance & Preferences */}
      {activeTab === "appearance" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Theme Switcher Card */}
          <div className="card bg-base-200 border border-base-300 shadow-sm rounded-3xl p-6 sm:p-8">
            <h3 className="text-lg font-black text-base-content flex items-center gap-2 mb-2">
              <Palette size={18} className="text-primary" />
              Application Theme
            </h3>
            <p className="text-xs text-base-content/70 mb-5">
              Choose your favorite theme colors for Progress Pulse. Changes take effect instantly.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AVAILABLE_THEMES.map(({ name, label, emoji }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleThemeChange(name)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    profile.theme === name
                      ? "border-primary bg-primary/10 shadow-sm font-bold ring-2 ring-primary/30"
                      : "border-base-300 bg-base-100/60 hover:bg-base-100 hover:border-base-content/20"
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm text-base-content">
                    <span>{emoji}</span>
                    <span>{label}</span>
                  </span>
                  {profile.theme === name && (
                    <CheckCircle2 size={16} className="text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Regional & Financial Preferences Card */}
          <div className="card bg-base-200 border border-base-300 shadow-sm rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-black text-base-content flex items-center gap-2 mb-2">
                <Coins size={18} className="text-primary" />
                Regional & Financial Currency
              </h3>
              <p className="text-xs text-base-content/70 mb-5">
                Set your primary currency unit across your Investment and Expense tracking modules.
              </p>

              {/* Currency Radio Options */}
              <div className="space-y-3">
                {CURRENCIES.map((curr) => (
                  <label
                    key={curr.code}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      profile.currency === curr.code
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30 font-bold"
                        : "border-base-300 bg-base-100/60 hover:bg-base-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-base-300 flex items-center justify-center font-mono font-black text-primary">
                        {curr.symbol}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-base-content">{curr.name}</p>
                        <p className="text-xs text-base-content/60 font-mono">{curr.code}</p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="currency"
                      value={curr.code}
                      checked={profile.currency === curr.code}
                      onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                      className="radio radio-primary"
                    />
                  </label>
                ))}
              </div>

              {/* Active Timezone Summary */}
              <div className="mt-6 p-4 rounded-2xl bg-base-100 border border-base-300 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Globe size={18} className="text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-base-content truncate">
                      Active: {previewDateTime.city} ({previewDateTime.tzAbbr || previewDateTime.timeZone})
                    </p>
                    <p className="text-[11px] text-base-content/60 font-mono">
                      {previewDateTime.formattedTime}
                    </p>
                  </div>
                </div>
                <span className="badge badge-primary badge-soft text-[10px] font-bold shrink-0">
                  {profile.timezone === "auto" ? "Auto-Geo" : "Custom"}
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-base-300 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="btn btn-primary rounded-xl px-6 font-bold gap-2 shadow-sm"
              >
                {isSaving ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <Save size={16} />
                )}
                Save Preferences
              </button>
            </div>
          </div>

          {/* Geographic Location & Timezone Settings Card */}
          <div className="lg:col-span-2 card bg-base-200 border border-base-300 shadow-sm rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-black text-base-content flex items-center gap-2">
                  <Globe size={18} className="text-primary" />
                  Geographic Location & Live Clock
                </h3>
                <p className="text-xs text-base-content/70 mt-0.5">
                  Display date and time dynamically based on your physical geographic location or custom timezone.
                </p>
              </div>

              {/* Detected Geographic Location Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-base-100 border border-base-300 shadow-2xs shrink-0 self-start sm:self-auto">
                <MapPin size={14} className="text-primary shrink-0" />
                <span className="text-xs font-bold text-base-content font-mono">
                  Detected: {getSystemGeoTimeZone()}
                </span>
                <span className="badge badge-xs badge-success">Geo Active</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
              {/* Select Timezone */}
              <div className="form-control">
                <label className="label text-xs font-bold uppercase tracking-wider text-base-content/70">
                  Select Timezone / Location Mode
                </label>
                <select
                  value={profile.timezone || "auto"}
                  onChange={(e) => handleTimezoneChange(e.target.value)}
                  className="select select-bordered w-full rounded-xl text-sm font-medium"
                >
                  <option value="auto">
                    🌐 Auto-Detect via Geographic Location (Currently {getSystemGeoTimeZone()})
                  </option>
                  {COMMON_TIMEZONES.filter((tz) => tz.value !== "auto").map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.flag} {tz.label}
                    </option>
                  ))}
                </select>
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Selecting "Auto-Detect" automatically synchronizes with your device's physical geographic location.
                  </span>
                </label>
              </div>

              {/* Live Preview Pill for Selected Timezone */}
              <div className="p-4 rounded-2xl bg-base-100 border border-base-300 flex flex-col justify-center gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-base-content/70">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-primary" />
                    Live Geographic Preview
                  </span>
                  <span className="badge badge-primary badge-soft text-[10px] font-mono">
                    {previewDateTime.timeZone}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-base sm:text-lg font-black font-mono text-base-content">
                  <span className="text-primary">{previewDateTime.formattedTime}</span>
                  <span className="text-base-content/30">•</span>
                  <span>{previewDateTime.formattedDate}</span>
                </div>

                <p className="text-[11px] text-base-content/60">
                  Location: <span className="font-semibold text-base-content">{previewDateTime.city}</span> ({previewDateTime.tzAbbr || "Local"})
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Security & Password */}
      {activeTab === "security" && (
        <div className="max-w-2xl mx-auto card bg-base-200 border border-base-300 shadow-sm rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-base-content flex items-center gap-2">
                <ShieldCheck size={20} className="text-primary" />
                Password & Account Security
              </h3>
              <p className="text-xs text-base-content/70 mt-0.5">
                Ensure your Progress Pulse account is protected with a strong password.
              </p>
            </div>
            <span className="badge badge-success badge-soft font-bold gap-1 text-xs">
              <CheckCircle2 size={12} />
              Protected
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Current Password */}
            <div className="form-control">
              <label className="label text-xs font-bold uppercase tracking-wider text-base-content/70">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwords.currentPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, currentPassword: e.target.value })
                  }
                  placeholder="••••••••••••"
                  className="input input-bordered w-full rounded-xl pl-10 pr-10 text-sm font-medium"
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="form-control">
              <label className="label text-xs font-bold uppercase tracking-wider text-base-content/70">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, newPassword: e.target.value })
                  }
                  placeholder="Minimum 6 characters"
                  className="input input-bordered w-full rounded-xl pl-10 pr-10 text-sm font-medium"
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="form-control">
              <label className="label text-xs font-bold uppercase tracking-wider text-base-content/70">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirmPassword: e.target.value })
                  }
                  placeholder="Re-enter new password"
                  className="input input-bordered w-full rounded-xl pl-10 pr-10 text-sm font-medium"
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-base-100/70 border border-base-300 text-xs space-y-1 text-base-content/70 mt-4">
              <p className="font-bold text-base-content">Password Security Requirements:</p>
              <p>• At least 6 characters in length</p>
              <p>• Include numbers and symbols for enhanced security</p>
              <p>• Avoid using easily guessable personal info or names</p>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" })
                }
                className="btn btn-ghost rounded-xl font-semibold text-base-content/70"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={isSaving || !passwords.newPassword}
                className="btn btn-primary rounded-xl px-6 font-bold gap-2"
              >
                {isSaving ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <Save size={16} />
                )}
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: Danger Zone */}
      {activeTab === "danger" && (
        <div className="space-y-6">
          {/* Warning Banner */}
          <div className="alert alert-error/15 border border-error/30 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-error/20 flex items-center justify-center text-error shrink-0 mt-0.5">
                <AlertOctagon size={22} />
              </div>
              <div>
                <h4 className="text-sm font-black text-error uppercase tracking-wider">
                  Caution: Irreversible Actions
                </h4>
                <p className="text-xs text-base-content/80 mt-0.5 max-w-2xl leading-relaxed">
                  Resetting tracker data permanently purges database records for your user account. Once executed, historical entries, statistics, and trends cannot be recovered.
                </p>
              </div>
            </div>
            <span className="badge badge-error badge-outline font-bold text-xs shrink-0 self-start sm:self-auto">
              Destructive Operations
            </span>
          </div>

          {/* Individual Trackers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Habit Tracker Reset Card */}
            <div className="card bg-base-200 border border-base-300 shadow-sm rounded-3xl p-6 flex flex-col justify-between hover:border-error/40 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                    <Activity size={22} />
                  </div>
                  <span className="badge badge-xs badge-neutral font-semibold">Module</span>
                </div>
                <div>
                  <h3 className="text-base font-black text-base-content">Habit Tracker</h3>
                  <p className="text-xs text-base-content/70 mt-1 leading-relaxed">
                    Deletes daily habit checklist records, food & nutrition logs, workout logs, and custom habit settings.
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-base-content/10 flex items-center justify-between">
                <span className="text-[11px] font-bold text-error/80 uppercase tracking-wide">
                  Irreversible
                </span>
                <button
                  type="button"
                  onClick={() => openResetModal("habit")}
                  className="btn btn-outline btn-error btn-sm rounded-xl font-bold gap-1.5 hover:shadow-xs"
                >
                  <Trash2 size={14} />
                  Reset Habits
                </button>
              </div>
            </div>

            {/* Expense Tracker Reset Card */}
            <div className="card bg-base-200 border border-base-300 shadow-sm rounded-3xl p-6 flex flex-col justify-between hover:border-error/40 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <Wallet size={22} />
                  </div>
                  <span className="badge badge-xs badge-neutral font-semibold">Module</span>
                </div>
                <div>
                  <h3 className="text-base font-black text-base-content">Expense Tracker</h3>
                  <p className="text-xs text-base-content/70 mt-1 leading-relaxed">
                    Clears all income, expense transactions, custom category assignments, and monthly budget quotas.
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-base-content/10 flex items-center justify-between">
                <span className="text-[11px] font-bold text-error/80 uppercase tracking-wide">
                  Irreversible
                </span>
                <button
                  type="button"
                  onClick={() => openResetModal("expense")}
                  className="btn btn-outline btn-error btn-sm rounded-xl font-bold gap-1.5 hover:shadow-xs"
                >
                  <Trash2 size={14} />
                  Reset Expenses
                </button>
              </div>
            </div>

            {/* Investment Tracker Reset Card */}
            <div className="card bg-base-200 border border-base-300 shadow-sm rounded-3xl p-6 flex flex-col justify-between hover:border-error/40 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                    <TrendingUp size={22} />
                  </div>
                  <span className="badge badge-xs badge-neutral font-semibold">Module</span>
                </div>
                <div>
                  <h3 className="text-base font-black text-base-content">Investment Tracker</h3>
                  <p className="text-xs text-base-content/70 mt-1 leading-relaxed">
                    Removes all stock trades, mutual funds, FDs, RDs, PF history, salary records, and investment planner allotments.
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-base-content/10 flex items-center justify-between">
                <span className="text-[11px] font-bold text-error/80 uppercase tracking-wide">
                  Irreversible
                </span>
                <button
                  type="button"
                  onClick={() => openResetModal("investment")}
                  className="btn btn-outline btn-error btn-sm rounded-xl font-bold gap-1.5 hover:shadow-xs"
                >
                  <Trash2 size={14} />
                  Reset Investments
                </button>
              </div>
            </div>
          </div>

          {/* Master Factory Reset Banner Card */}
          <div className="card bg-linear-to-r from-error/10 via-base-200 to-base-300 border-2 border-error/40 shadow-md rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={20} className="text-error" />
                  <h3 className="text-lg sm:text-xl font-black text-error">
                    Factory Reset All Trackers
                  </h3>
                  <span className="badge badge-error font-black text-[10px] tracking-wider uppercase">
                    All-in-One
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-base-content/80 leading-relaxed">
                  Completely wipes all data across <strong>Habit Tracker</strong>, <strong>Expense Tracker</strong>, and <strong>Investment Tracker</strong> at once. Your user account credentials, theme preferences, and profile details will remain preserved.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-base-content/60 font-mono">
                  <span className="px-2 py-0.5 rounded-md bg-base-100 border border-base-300">✓ Habits & Logs Cleared</span>
                  <span className="px-2 py-0.5 rounded-md bg-base-100 border border-base-300">✓ Expenses & Budgets Cleared</span>
                  <span className="px-2 py-0.5 rounded-md bg-base-100 border border-base-300">✓ Portfolios & Planners Cleared</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openResetModal("all")}
                className="btn btn-error rounded-2xl px-6 py-3 font-black text-sm shadow-md hover:shadow-xl transition-all gap-2 self-stretch lg:self-auto shrink-0"
              >
                <AlertOctagon size={18} />
                Wipe All Tracker Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone Type-to-Confirm Modal */}
      {resetModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-base-100 border border-error/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 relative">
            <button
              type="button"
              onClick={closeResetModal}
              disabled={isResetting}
              className="btn btn-ghost btn-circle btn-sm absolute right-4 top-4 text-base-content/60 hover:text-base-content"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-error/15 border border-error/30 flex items-center justify-center text-error shrink-0">
                <AlertOctagon size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black text-base-content">
                  {resetModal === "habit"
                    ? "Reset Habit Tracker"
                    : resetModal === "expense"
                    ? "Reset Expense Tracker"
                    : resetModal === "investment"
                    ? "Reset Investment Tracker"
                    : "Wipe All Tracker Data"}
                </h4>
                <p className="text-xs text-error font-semibold flex items-center gap-1">
                  <AlertTriangle size={12} />
                  Irreversible Destructive Action
                </p>
              </div>
            </div>

            <p className="text-xs text-base-content/70 leading-relaxed">
              This action cannot be undone. All data, records, and statistics associated with{" "}
              <strong className="text-base-content">
                {resetModal === "all" ? "all trackers" : `the ${resetModal} tracker`}
              </strong>{" "}
              will be permanently deleted.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 block">
                Type{" "}
                <span className="font-mono text-error font-black px-1.5 py-0.5 rounded bg-error/10 select-all">
                  {resetModal === "habit"
                    ? "RESET HABITS"
                    : resetModal === "expense"
                    ? "RESET EXPENSES"
                    : resetModal === "investment"
                    ? "RESET INVESTMENTS"
                    : "WIPE EVERYTHING"}
                </span>{" "}
                to confirm:
              </label>
              <input
                type="text"
                autoFocus
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder={
                  resetModal === "habit"
                    ? "RESET HABITS"
                    : resetModal === "expense"
                    ? "RESET EXPENSES"
                    : resetModal === "investment"
                    ? "RESET INVESTMENTS"
                    : "WIPE EVERYTHING"
                }
                className="input input-bordered input-error w-full rounded-xl font-mono text-center font-bold tracking-widest text-sm uppercase"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeResetModal}
                disabled={isResetting}
                className="btn btn-ghost rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteReset}
                disabled={
                  isResetting ||
                  confirmInput.trim().toUpperCase() !==
                    (resetModal === "habit"
                      ? "RESET HABITS"
                      : resetModal === "expense"
                      ? "RESET EXPENSES"
                      : resetModal === "investment"
                      ? "RESET INVESTMENTS"
                      : "WIPE EVERYTHING")
                }
                className="btn btn-error rounded-xl px-5 font-bold shadow-md hover:shadow-lg transition-all gap-2"
              >
                {isResetting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Resetting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Confirm Reset
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Blocker Modal */}
      {blocker.state === "blocked" && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-base-200 border border-base-300 shadow-2xl rounded-3xl p-6 sm:p-7 space-y-5 text-left animate-in zoom-in-95 duration-150">
            {/* Close / Dismiss */}
            <button
              type="button"
              onClick={handleKeepEditing}
              className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-base-content/50 hover:text-base-content"
              aria-label="Keep Editing"
            >
              <X size={18} />
            </button>

            {/* Header / Icon */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-warning/15 border border-warning/30 flex items-center justify-center text-warning shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div className="min-w-0 pr-6">
                <h3 className="text-lg font-black text-base-content">
                  Unsaved Changes
                </h3>
                <p className="text-xs text-base-content/70 mt-1 leading-relaxed">
                  You have unsaved changes in your settings. If you leave without saving, your recent edits will be lost.
                </p>
              </div>
            </div>

            {/* Prompt explanation */}
            <div className="p-3.5 rounded-2xl bg-base-100/70 border border-base-300 text-xs text-base-content/80 flex items-center gap-2.5">
              <ShieldAlert size={16} className="text-warning shrink-0" />
              <span>Choose whether to save your updates or discard them before moving on.</span>
            </div>

            {/* Modal Buttons */}
            <div className="flex flex-col sm:flex-row-reverse items-stretch sm:items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleSaveAndLeave}
                disabled={isSaving}
                className="btn btn-primary rounded-xl px-5 font-bold gap-2 shadow-sm"
              >
                {isSaving ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <Save size={16} />
                )}
                Save & Leave
              </button>

              <button
                type="button"
                onClick={handleDiscardAndLeave}
                disabled={isSaving}
                className="btn btn-error btn-soft rounded-xl px-4 font-bold text-error hover:bg-error/20 gap-2 border border-error/20"
              >
                <Trash2 size={16} />
                Leave Without Saving
              </button>

              <button
                type="button"
                onClick={handleKeepEditing}
                disabled={isSaving}
                className="btn btn-ghost rounded-xl px-3 font-semibold text-base-content/70 hover:text-base-content sm:mr-auto"
              >
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserSettings;
