"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, Shield } from "lucide-react";

interface UserData {
  id: number;
  name: string;
  email: string;
  role_name: string;
  role_tag: string;
  department_name?: string;
  position_name?: string;
  avatar?: string;
}

export default function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");

    // Clear cookie
    document.cookie =
      "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

    // Redirect to login
    router.push("/login");
  };

  if (!user) return null;

  const getRoleBadgeColor = (roleTag: string) => {
    switch (roleTag) {
      case "dev":
      case "superadmin":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "admin":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "sale":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getRoleLabel = (roleTag: string) => {
    const labels: Record<string, string> = {
      dev: "Developer",
      superadmin: "Super Admin",
      admin: "Admin",
      sale: "Sale",
      user: "User",
    };
    return labels[roleTag] || roleTag;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-semibold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="text-left hidden md:block">
          <div className="text-sm font-semibold text-gray-900">{user.name}</div>
          <div className="text-xs text-gray-500">{user.email}</div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            showMenu ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
            {/* User Info */}
            <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-b border-red-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                </div>
              </div>

              {/* Role Badge */}
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-600" />
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                    user.role_tag
                  )}`}
                >
                  {getRoleLabel(user.role_tag)}
                </span>
              </div>

              {/* Additional Info */}
              {(user.department_name || user.position_name) && (
                <div className="mt-3 pt-3 border-t border-red-200 text-sm">
                  {user.department_name && (
                    <div className="text-gray-600">
                      📍 {user.department_name}
                    </div>
                  )}
                  {user.position_name && (
                    <div className="text-gray-600">💼 {user.position_name}</div>
                  )}
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600 font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
