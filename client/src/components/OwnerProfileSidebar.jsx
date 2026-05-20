import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../App";

axios.defaults.withCredentials = true;

const COLLAPSED_WIDTH = 78;
const EXPANDED_WIDTH = 280;

const UserIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MailIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 7h16v10H4V7Z"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />
    <path
      d="m4 7 8 6 8-6"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LogOutIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M15 12H4m0 0 3-3m-3 3 3 3"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 7V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-1"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const OwnerProfileSidebar = ({ onLogOut, onExpandChange }) => {
  const { userData, setUserData } = useContext(UserContext);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);

  const expanded = pinned || hovered;

  useEffect(() => {
    if (userData?.name) {
      setName(userData.name);
    }
  }, [userData?.name]);

  useEffect(() => {
    onExpandChange?.(expanded);
  }, [expanded, onExpandChange]);

  if (!userData) return null;

  const initial = (userData.name || userData.email || "?")
    .charAt(0)
    .toUpperCase();

  const handleToggle = () => {
    setPinned((prev) => !prev);
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setStatus({ type: "error", message: "Name cannot be empty" });
      return;
    }

    if (trimmed === userData.name) {
      setStatus({ type: "", message: "" });
      return;
    }

    setSaving(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await axios.patch(
        "http://localhost:8001/api/user/updateprofile",
        { name: trimmed },
        { withCredentials: true }
      );

      if (res.data.success) {
        const updated = res.data.data;
        setUserData(updated);
        localStorage.setItem("user", JSON.stringify(updated));
        setName(updated.name);
        setStatus({ type: "success", message: "Name saved" });
      } else {
        setStatus({
          type: "error",
          message: res.data.message || "Could not update profile",
        });
      }
    } catch {
      setStatus({ type: "error", message: "Could not update profile" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-200 bg-white shadow-lg transition-[width] duration-300 ease-in-out"
      style={{ width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-expanded={expanded}
    >
      {/* Header */}
      <div
        className={`flex shrink-0 border-b border-slate-100 py-4 ${
          expanded
            ? "flex-row items-center gap-3 px-3"
            : "flex-col items-center gap-2 px-2"
        }`}
      >
        <button
          type="button"
          onClick={handleToggle}
          title={pinned ? "Collapse sidebar" : "Pin sidebar open"}
          aria-label={pinned ? "Collapse sidebar" : "Expand sidebar"}
          aria-pressed={pinned}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 active:scale-95 ${
            pinned ? "ring-2 ring-indigo-300 ring-offset-2" : ""
          }`}
        >
          {initial}
        </button>
        <div
          className={`min-w-0 flex-1 overflow-hidden transition-all duration-300 ${
            expanded ? "opacity-100" : "hidden w-0"
          }`}
        >
          <p className="truncate text-sm font-bold text-indigo-700">My Profile</p>
          <p className="truncate text-xs text-slate-500">Owner account</p>
        </div>
      </div>

      {/* Profile fields */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <p
          className={`px-4 pt-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400 transition-opacity duration-300 ${
            expanded ? "opacity-100" : "opacity-0"
          }`}
        >
          Account
        </p>

        <form
          onSubmit={handleSaveName}
          className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden px-2 py-2"
        >
          {/* Name row */}
          <div className="group flex items-start gap-2 rounded-lg px-2 py-2.5 transition hover:bg-slate-50">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-indigo-600">
              <UserIcon />
            </span>
            <div
              className={`min-w-0 flex-1 transition-all duration-300 ${
                expanded ? "max-w-full opacity-100" : "max-w-0 opacity-0"
              }`}
            >
              <label
                htmlFor="owner-profile-name"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                Name
              </label>
              <input
                id="owner-profile-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (status.message) setStatus({ type: "", message: "" });
                }}
                tabIndex={expanded ? 0 : -1}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email row */}
          <div className="group flex items-start gap-2 rounded-lg px-2 py-2.5 transition hover:bg-slate-50">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-indigo-600">
              <MailIcon />
            </span>
            <div
              className={`min-w-0 flex-1 transition-all duration-300 ${
                expanded ? "max-w-full opacity-100" : "max-w-0 opacity-0"
              }`}
            >
              <label
                htmlFor="owner-profile-email"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                Email
              </label>
              <input
                id="owner-profile-email"
                type="email"
                value={userData.email || ""}
                readOnly
                disabled
                tabIndex={-1}
                className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm text-slate-500"
              />
              <p className="mt-0.5 text-[10px] text-slate-400">
                Cannot be changed
              </p>
            </div>
          </div>

          <div
            className={`px-2 transition-all duration-300 ${
              expanded ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            {status.message && (
              <p
                className={`mb-2 text-xs font-medium ${
                  status.type === "success"
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
                role="status"
              >
                {status.message}
              </p>
            )}
            <button
              type="submit"
              disabled={saving || name.trim() === userData.name}
              tabIndex={expanded ? 0 : -1}
              className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save name"}
            </button>
          </div>
        </form>
      </div>

      {/* Log out */}
      <div className="shrink-0 border-t border-slate-100 p-2">
        <button
          type="button"
          onClick={onLogOut}
          title="Log out"
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-rose-700 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-rose-600">
            <LogOutIcon />
          </span>
          <span
            className={`whitespace-nowrap text-sm font-semibold transition-all duration-300 ${
              expanded ? "max-w-full opacity-100" : "max-w-0 opacity-0"
            }`}
          >
            Log Out
          </span>
        </button>
      </div>
    </aside>
  );
};

export { COLLAPSED_WIDTH, EXPANDED_WIDTH };
export default OwnerProfileSidebar;
