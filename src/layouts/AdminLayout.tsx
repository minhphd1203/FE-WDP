import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  AlertCircle,
  Package,
  LogOut,
  Menu,
  X,
  UserCog,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../constants";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { authService } from "../service/auth/api";
import { CurrentUserData } from "../types/auth";

const navigation = [
  {
    name: "Dashboard",
    href: ROUTES.ADMIN_DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    name: "Sự kiện",
    href: ROUTES.ADMIN_EVENTS,
    icon: Calendar,
  },
  {
    name: "Tài khoản",
    href: ROUTES.ADMIN_USERS,
    icon: UserCog,
  },
  {
    name: "Yêu cầu cứu hộ",
    href: ROUTES.ADMIN_RELIEF_REQUESTS,
    icon: AlertCircle,
  },
  {
    name: "Kho",
    href: ROUTES.ADMIN_WAREHOUSE,
    icon: Package,
  },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUserData | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await authService.getCurrentUser();
        if (response.success) {
          setCurrentUser(response.data);
        }
      } catch (error) {
        // Keep fallback user data from redux store when API call fails.
      }
    };

    void fetchCurrentUser();
  }, [location.pathname]);

  const displayName =
    currentUser?.profile?.fullName ||
    currentUser?.fullName ||
    user?.fullName ||
    user?.name ||
    "Admin";

  const displayEmail = currentUser?.email || user?.email || "-";
  const displayAvatar = currentUser?.profile?.avatarUrl;
  const displayInitial = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-red-50/30">
      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          sidebarOpen ? "block" : "hidden",
        )}
      >
        <div
          className="fixed inset-0 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 w-64 border-r border-red-100 bg-gradient-to-b from-red-50 to-white shadow-lg">
          <div className="flex h-full flex-col">
            {/* Sidebar header */}
            <div className="flex items-center justify-between border-b border-red-100 bg-white p-4">
              <img src="/logo.png" alt="ResQHub Logo" className="h-40 w-auto" />
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1 text-red-600 transition-colors hover:bg-red-50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-red-500 via-red-600 to-rose-700 text-white shadow-md"
                        : "text-slate-700 hover:bg-red-50 hover:text-red-700",
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User section */}
            <div className="border-t border-red-100 p-4">
              <div className="flex items-center gap-3 mb-3">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt="Avatar"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <span className="font-semibold text-red-700">
                      {displayInitial}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{displayName}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {displayEmail}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  navigate(ROUTES.ADMIN_UPDATE_PROFILE);
                  setSidebarOpen(false);
                }}
                className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
              >
                <UserCog className="h-4 w-4" />
                Cập nhật hồ sơ
              </button>
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-1 flex-col border-r border-red-100 bg-gradient-to-b from-red-50 to-white">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-center border-b border-red-100 bg-white px-4">
            <img src="/logo.png" alt="ResQHub Logo" className="h-40 w-auto" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-red-500 via-red-600 to-rose-700 text-white shadow-md"
                      : "text-slate-700 hover:bg-red-50 hover:text-red-700",
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-red-100 p-4">
            <div className="flex items-center gap-3 mb-3">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt="Avatar"
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <span className="font-semibold text-red-700">
                    {displayInitial}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-slate-500 truncate">
                  {displayEmail}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(ROUTES.ADMIN_UPDATE_PROFILE)}
              className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
            >
              <UserCog className="h-4 w-4" />
              Cập nhật hồ sơ
            </button>
            <Button
              variant="outline"
              className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-red-100 bg-gradient-to-r from-red-50 to-white px-4 shadow-sm lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-red-700 transition-colors hover:text-red-600"
          >
            <Menu className="h-6 w-6" />
          </button>
          <img src="/logo.png" alt="ResQHub Logo" className="h-40 w-auto" />
        </div>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)] lg:min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
