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
  Package,
  ChevronDown,
  FileText,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../constants";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { authService } from "../service/auth/api";
import { CurrentUserData } from "../types/auth";

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  submenu?: Array<{
    name: string;
    href: string;
  }>;
}

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: ROUTES.STAFF_DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    name: "Quản lý sản phẩm",
    href: ROUTES.STAFF_PRODUCTS,
    icon: CheckCircle,
  },
  {
    name: "Danh sách tình nguyện viên",
    href: ROUTES.STAFF_VOLUNTEERS,
    icon: Send,
  },
  {
    name: "Danh sách đơn cứu hộ",
    href: ROUTES.STAFF_RESCUE_REQUESTS,
    icon: FileText,
  },
  {
    name: "Quản lý kho",
    icon: Package,
    submenu: [
      { name: "Quản lý kho chung", href: ROUTES.STAFF_WAREHOUSE_COMMON },
      { name: "Quản lý kho của team", href: ROUTES.STAFF_WAREHOUSE_TEAM },
    ],
  },
];

export default function StaffLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUserData | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

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

  const toggleMenu = (name: string) => {
    const next = new Set(expandedMenus);
    // If this menu is already expanded, close it
    if (next.has(name)) {
      next.delete(name);
    } else {
      // Close all other menus and open only this one
      next.clear();
      next.add(name);
    }
    setExpandedMenus(next);
  };

  const isSubmenuItemActive = (submenu: (typeof navigation)[0]["submenu"]) => {
    return submenu?.some((item) => location.pathname === item.href) || false;
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
        <div className="fixed inset-y-0 left-0 w-[86vw] max-w-[340px] border-r border-red-100 bg-gradient-to-b from-red-50 to-white shadow-lg">
          <div className="flex h-full flex-col">
            {/* Sidebar header */}
            <div className="flex items-center justify-between border-b border-red-100 bg-white px-5">
              <img src="/logo.png" alt="ResQHub Logo" className="w-[200px]" />
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
                const isActive = item.href
                  ? location.pathname === item.href
                  : false;
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const isExpanded = expandedMenus.has(item.name);
                const submenuActive = isSubmenuItemActive(item.submenu);

                if (hasSubmenu) {
                  return (
                    <div key={item.name}>
                      <button
                        onClick={() => {
                          toggleMenu(item.name);
                          setSidebarOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left",
                          submenuActive || isExpanded
                            ? "bg-gradient-to-r from-red-500 via-red-600 to-rose-700 text-white shadow-md"
                            : "text-slate-700 hover:bg-red-50 hover:text-red-700",
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 ml-auto transition-transform",
                            isExpanded ? "rotate-180" : "",
                          )}
                        />
                      </button>
                      {isExpanded && (
                        <div className="ml-4 space-y-1 border-l border-red-200 pl-3 mt-1">
                          {item.submenu?.map((subitem) => (
                            <Link
                              key={subitem.name}
                              to={subitem.href}
                              onClick={() => setSidebarOpen(false)}
                              className={cn(
                                "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                location.pathname === subitem.href
                                  ? "bg-red-100 text-red-700"
                                  : "text-slate-600 hover:bg-red-50",
                              )}
                            >
                              {subitem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    to={item.href || "#"}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-red-500 via-red-600 to-rose-700 text-white shadow-md"
                        : "text-slate-700 hover:bg-red-50 hover:text-red-700",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* User section */}
            <div className="border-t border-red-100 p-4 pb-5">
              <div className="flex items-center gap-3 mb-3">
                {currentUser?.profile?.avatarUrl ? (
                  <img
                    src={currentUser.profile.avatarUrl}
                    alt="Avatar"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <span className="font-semibold text-red-700">
                      {getFirstChar()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {getFullName()}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {displayUser?.role}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(ROUTES.STAFF_UPDATE_PROFILE)}
                className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
              >
                <User className="h-4 w-4" />
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
          <div className="flex items-center justify-center border-b border-red-100 bg-white px-4">
            <img
              src="/logo.png"
              alt="ResQHub Logo"
              className="h-[100px] object-cover w-auto"
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = item.href
                ? location.pathname === item.href
                : false;
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isExpanded = expandedMenus.has(item.name);
              const submenuActive = isSubmenuItemActive(item.submenu);

              if (hasSubmenu) {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left",
                        submenuActive || isExpanded
                          ? "bg-gradient-to-r from-red-500 via-red-600 to-rose-700 text-white shadow-md"
                          : "text-slate-700 hover:bg-red-50 hover:text-red-700",
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 ml-auto transition-transform",
                          isExpanded ? "rotate-180" : "",
                        )}
                      />
                    </button>
                    {isExpanded && (
                      <div className="ml-4 space-y-1 border-l border-red-200 pl-3 mt-1">
                        {item.submenu?.map((subitem) => (
                          <Link
                            key={subitem.name}
                            to={subitem.href}
                            className={cn(
                              "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                              location.pathname === subitem.href
                                ? "bg-red-100 text-red-700"
                                : "text-slate-600 hover:bg-red-50",
                            )}
                          >
                            {subitem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  to={item.href || "#"}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-red-500 via-red-600 to-rose-700 text-white shadow-md"
                      : "text-slate-700 hover:bg-red-50 hover:text-red-700",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-red-100 p-4">
            <div className="flex items-center gap-3 mb-3">
              {currentUser?.profile?.avatarUrl ? (
                <img
                  src={currentUser.profile.avatarUrl}
                  alt="Avatar"
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <span className="font-semibold text-red-700">
                    {getFirstChar()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{getFullName()}</p>
                <p className="text-xs text-slate-500 truncate">
                  {displayUser?.role}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(ROUTES.STAFF_UPDATE_PROFILE)}
              className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
            >
              <User className="h-4 w-4" />
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
          <img src="/logo.png" alt="ResQHub Logo" className="h-10 w-auto" />
        </div>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)] lg:min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
