import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Send,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  User,
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
    href: ROUTES.STAFF_DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    name: "Xác minh sản phẩm",
    href: ROUTES.STAFF_VERIFY_PRODUCTS,
    icon: CheckCircle,
  },
  {
    name: "Phân phối sản phẩm",
    href: ROUTES.STAFF_DISTRIBUTE,
    icon: Send,
  },
];

export default function StaffLayout() {
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
        console.error("Failed to fetch current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  const displayUser = currentUser || user;

  const getFullName = () => {
    if (currentUser) {
      return (
        currentUser.fullName ||
        (currentUser.profile?.fullName as string | undefined) ||
        currentUser.name ||
        "Staff"
      );
    }
    return user?.fullName || user?.name || "Staff";
  };

  const getFirstChar = () => {
    const fullName = getFullName();
    return fullName.charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
          <div className="flex h-full flex-col">
            {/* Sidebar header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-primary">Staff Panel</h2>
              <button onClick={() => setSidebarOpen(false)}>
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
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-gray-700 hover:bg-gray-100",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User section */}
            <div className="border-t p-4">
              <div className="flex items-center gap-3 mb-3">
                {currentUser?.profile?.avatarUrl ? (
                  <img
                    src={currentUser.profile.avatarUrl}
                    alt="Avatar"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {getFirstChar()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {getFullName()}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {displayUser?.role}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(ROUTES.STAFF_UPDATE_PROFILE)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors mb-2"
              >
                <User className="h-4 w-4" />
                Cập nhật hồ sơ
              </button>
              <Button
                variant="outline"
                className="w-full"
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
        <div className="flex flex-col flex-1 bg-white border-r">
          {/* Sidebar header */}
          <div className="flex items-center h-16 px-4 border-b">
            <h2 className="text-xl font-bold text-primary">Staff Panel</h2>
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
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3 mb-3">
              {currentUser?.profile?.avatarUrl ? (
                <img
                  src={currentUser.profile.avatarUrl}
                  alt="Avatar"
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {getFirstChar()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{getFullName()}</p>
                <p className="text-xs text-gray-500 truncate">
                  {displayUser?.role}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(ROUTES.STAFF_UPDATE_PROFILE)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors mb-2"
            >
              <User className="h-4 w-4" />
              Cập nhật hồ sơ
            </button>
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-primary">Staff Panel</h1>
        </div>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)] lg:min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
