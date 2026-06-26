import { useState, useEffect } from "react";
import { getMyProfile, updateMyProfile } from "../api/userApi";
import { useToast } from "./Toast";

export default function ProfileModal({ open, onClose }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    password: ""
  });

  useEffect(() => {
    if (open) {
      loadProfile();
    }
  }, [open]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getMyProfile();
      setProfile({
        name: data.name || "",
        email: data.email || "",
        role: data.role || "",
        password: "" // Keep password blank initially
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: profile.name };
      if (profile.password) {
        payload.password = profile.password;
      }
      const data = await updateMyProfile(payload);
      
      // Update local storage name if they changed it
      const currentName = localStorage.getItem("userName");
      if (currentName !== data.name) {
        localStorage.setItem("userName", data.name);
        window.dispatchEvent(new Event("storage"));
      }

      toast.success("Profile updated successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-slide-up border border-outline-variant/30">
        
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[20px] font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person</span>
            My Profile
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">close</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            
            {/* Non-editable fields */}
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 mb-2">
              <div className="mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">mail</span>
                <span className="text-[13px] text-on-surface-variant font-medium">{profile.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">badge</span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {profile.role}
                </span>
              </div>
            </div>

            {/* Editable fields */}
            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-[14px] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 flex items-center justify-between">
                <span>New Password</span>
                <span className="text-[9px] font-normal text-on-surface-variant/70 normal-case tracking-normal">Leave blank to keep current</span>
              </label>
              <input
                type="password"
                placeholder="Enter new password..."
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-[14px] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
                value={profile.password}
                onChange={(e) => setProfile({ ...profile, password: e.target.value })}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl gradient-primary text-white text-[14px] font-bold hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
            
          </form>
        )}
      </div>
    </div>
  );
}
