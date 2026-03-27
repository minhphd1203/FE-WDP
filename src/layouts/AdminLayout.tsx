import { useEffect, useRef, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  AlertCircle,
  Package,
  ClipboardList,
  LogOut,
  Menu,
  X,
  UserCog,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../constants";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { authService } from "../service/auth/api";
import { CurrentUserData } from "../types/auth";
import { StaffNotificationCategory, StaffRealtimeNotification } from "../types";
import { staffNotificationApi } from "../apis/staffNotificationApi";

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
    name: "Đăng ký đội cứu hộ",
    href: ROUTES.ADMIN_TEAM_REGISTRATION_REQUESTS,
    icon: ShieldCheck,
  },
  {
    name: "Tiếp tế vật phẩm",
    href: ROUTES.ADMIN_REPLENISHMENT_REQUESTS,
    icon: ClipboardList,
  },
  {
    name: "Kho",
    href: ROUTES.ADMIN_WAREHOUSE,
    icon: Package,
  },
  {
    name: "Sổ giao dịch",
    href: ROUTES.ADMIN_WAREHOUSE_TRANSACTIONS,
    icon: BarChart3,
  },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUserData | null>(null);
  const [rescueUnreadCount, setRescueUnreadCount] = useState(0);
  const [replenishmentUnreadCount, setReplenishmentUnreadCount] = useState(0);
  const [teamRegistrationUnreadCount, setTeamRegistrationUnreadCount] =
    useState(0);
  const socketRef = useRef<Socket | null>(null);
  const rescueUnreadCountRef = useRef(0);
  const replenishmentUnreadCountRef = useRef(0);
  const teamRegistrationUnreadCountRef = useRef(0);
  const hasShownInitialRescueToastRef = useRef(false);
  const hasShownInitialReplenishmentToastRef = useRef(false);
  const hasShownInitialTeamRegistrationToastRef = useRef(false);

  rescueUnreadCountRef.current = rescueUnreadCount;
  replenishmentUnreadCountRef.current = replenishmentUnreadCount;
  teamRegistrationUnreadCountRef.current = teamRegistrationUnreadCount;

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

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    void syncUnreadSummary();

    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
    const socket = io(`${apiBaseUrl}/realtime`, {
      path: "/socket.io",
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("staff.notification", (payload: StaffRealtimeNotification) => {
      if (
        payload.type !== "RESCUE_ASSIGNMENT_ACCEPTED" &&
        payload.type !== "RESCUE_ASSIGNMENT_INCIDENT_REPORTED" &&
        payload.type !== "REPLENISHMENT_REQUEST_CREATED" &&
        payload.type !== "TEAM_REGISTRATION_REQUEST_CREATED"
      ) {
        return;
      }

      showRealtimeToast(payload);

      if (payload.type === "REPLENISHMENT_REQUEST_CREATED") {
        setReplenishmentUnreadCount((current) => current + 1);
        return;
      }

      if (payload.type === "TEAM_REGISTRATION_REQUEST_CREATED") {
        setTeamRegistrationUnreadCount((current) => current + 1);
        return;
      }

      setRescueUnreadCount((current) => current + 1);
    });

    socket.on("connect_error", (error) => {
      console.error("Admin realtime socket connection failed:", error);
    });

    return () => {
      socket.off("staff.notification");
      socket.off("connect_error");
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    void syncUnreadSummary();
  }, [location.pathname]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    const handleWindowFocus = () => {
      void syncUnreadSummary();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void syncUnreadSummary();
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

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

  const syncUnreadSummary = async () => {
    try {
      const response = await staffNotificationApi.getUnreadSummary();

      if (response.success) {
        const nextRescueUnreadCount = response.data.rescueRequestsUnread || 0;
        const nextReplenishmentUnreadCount =
          response.data.replenishmentRequestsUnread || 0;
        const nextTeamRegistrationUnreadCount =
          response.data.teamRegistrationRequestsUnread || 0;
        const previousRescueUnreadCount = rescueUnreadCountRef.current;
        const previousReplenishmentUnreadCount =
          replenishmentUnreadCountRef.current;
        const previousTeamRegistrationUnreadCount =
          teamRegistrationUnreadCountRef.current;

        setRescueUnreadCount(nextRescueUnreadCount);
        setReplenishmentUnreadCount(nextReplenishmentUnreadCount);
        setTeamRegistrationUnreadCount(nextTeamRegistrationUnreadCount);

        if (
          nextRescueUnreadCount > 0 &&
          !hasShownInitialRescueToastRef.current &&
          previousRescueUnreadCount === 0
        ) {
          hasShownInitialRescueToastRef.current = true;
          toast.info("Có yêu cầu cứu hộ chưa đọc", {
            description: `Bạn đang có ${nextRescueUnreadCount} thông báo yêu cầu cứu hộ chưa đọc.`,
          });
        }

        if (
          nextRescueUnreadCount > previousRescueUnreadCount &&
          previousRescueUnreadCount > 0
        ) {
          toast.info("Có thêm cập nhật yêu cầu cứu hộ", {
            description: `Số thông báo yêu cầu cứu hộ chưa đọc tăng lên ${nextRescueUnreadCount}.`,
          });
        }

        if (
          nextReplenishmentUnreadCount > 0 &&
          !hasShownInitialReplenishmentToastRef.current &&
          previousReplenishmentUnreadCount === 0
        ) {
          hasShownInitialReplenishmentToastRef.current = true;
          toast.info("Có yêu cầu bổ sung hàng chưa đọc", {
            description: `Bạn đang có ${nextReplenishmentUnreadCount} yêu cầu bổ sung hàng chưa đọc.`,
          });
        }

        if (
          nextReplenishmentUnreadCount > previousReplenishmentUnreadCount &&
          previousReplenishmentUnreadCount > 0
        ) {
          toast.info("Có thêm yêu cầu bổ sung hàng", {
            description: `Số yêu cầu bổ sung hàng chưa đọc tăng lên ${nextReplenishmentUnreadCount}.`,
          });
        }

        if (
          nextTeamRegistrationUnreadCount > 0 &&
          !hasShownInitialTeamRegistrationToastRef.current &&
          previousTeamRegistrationUnreadCount === 0
        ) {
          hasShownInitialTeamRegistrationToastRef.current = true;
          toast.info("Có yêu cầu đăng ký đội cứu hộ chưa đọc", {
            description: `Bạn đang có ${nextTeamRegistrationUnreadCount} yêu cầu đăng ký đội cứu hộ chưa đọc.`,
          });
        }

        if (
          nextTeamRegistrationUnreadCount > previousTeamRegistrationUnreadCount &&
          previousTeamRegistrationUnreadCount > 0
        ) {
          toast.info("Có thêm yêu cầu đăng ký đội cứu hộ", {
            description: `Số yêu cầu đăng ký đội cứu hộ chưa đọc tăng lên ${nextTeamRegistrationUnreadCount}.`,
          });
        }
      }
    } catch (error) {
      console.error("Failed to load admin unread rescue notifications:", error);
    }
  };

  const markRescueNotificationsAsRead = async (force = false) => {
    if (!force && rescueUnreadCountRef.current === 0) {
      return;
    }

    try {
      const response = await staffNotificationApi.markAsRead(
        StaffNotificationCategory.RESCUE_REQUESTS,
      );

      if (response.success) {
        setRescueUnreadCount(response.data.unreadSummary.rescueRequestsUnread);
        hasShownInitialRescueToastRef.current =
          response.data.unreadSummary.rescueRequestsUnread > 0;
        return;
      }
    } catch (error) {
      console.error("Failed to mark admin rescue notifications as read:", error);
    }

    setRescueUnreadCount(0);
  };

  const markTeamRegistrationNotificationsAsRead = async (force = false) => {
    if (!force && teamRegistrationUnreadCountRef.current === 0) {
      return;
    }

    try {
      const response = await staffNotificationApi.markAsRead(
        StaffNotificationCategory.TEAM_REGISTRATION_REQUESTS,
      );

      if (response.success) {
        setTeamRegistrationUnreadCount(
          response.data.unreadSummary.teamRegistrationRequestsUnread,
        );
        hasShownInitialTeamRegistrationToastRef.current =
          response.data.unreadSummary.teamRegistrationRequestsUnread > 0;
        return;
      }
    } catch (error) {
      console.error(
        "Failed to mark admin team registration notifications as read:",
        error,
      );
    }

    setTeamRegistrationUnreadCount(0);
  };

  const markReplenishmentNotificationsAsRead = async (force = false) => {
    if (!force && replenishmentUnreadCountRef.current === 0) {
      return;
    }

    try {
      const response = await staffNotificationApi.markAsRead(
        StaffNotificationCategory.REPLENISHMENT_REQUESTS,
      );

      if (response.success) {
        setReplenishmentUnreadCount(
          response.data.unreadSummary.replenishmentRequestsUnread,
        );
        hasShownInitialReplenishmentToastRef.current =
          response.data.unreadSummary.replenishmentRequestsUnread > 0;
        return;
      }
    } catch (error) {
      console.error(
        "Failed to mark admin replenishment notifications as read:",
        error,
      );
    }

    setReplenishmentUnreadCount(0);
  };

  const showRealtimeToast = (payload: StaffRealtimeNotification) => {
    if (payload.severity === "critical") {
      toast.error(payload.title, {
        description: payload.message,
      });
      return;
    }

    if (payload.severity === "warning") {
      toast.warning(payload.title, {
        description: payload.message,
      });
      return;
    }

    toast.info(payload.title, {
      description: payload.message,
    });
  };

  const getNavigationBadge = (itemHref?: string, isActive?: boolean) => {
    const unreadCount =
      itemHref === ROUTES.ADMIN_RELIEF_REQUESTS
        ? rescueUnreadCount
        : itemHref === ROUTES.ADMIN_REPLENISHMENT_REQUESTS
          ? replenishmentUnreadCount
        : itemHref === ROUTES.ADMIN_TEAM_REGISTRATION_REQUESTS
          ? teamRegistrationUnreadCount
          : 0;

    if (unreadCount <= 0) {
      return null;
    }

    return (
      <span
        className={cn(
          "ml-auto inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold",
          isActive ? "bg-white text-red-700" : "bg-red-100 text-red-700",
        )}
      >
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    );
  };

  const handleNavigationClick = (href?: string) => {
    if (href === ROUTES.ADMIN_RELIEF_REQUESTS) {
      setRescueUnreadCount(0);
      void markRescueNotificationsAsRead(true);
    }

    if (href === ROUTES.ADMIN_TEAM_REGISTRATION_REQUESTS) {
      setTeamRegistrationUnreadCount(0);
      void markTeamRegistrationNotificationsAsRead(true);
    }

    if (href === ROUTES.ADMIN_REPLENISHMENT_REQUESTS) {
      setReplenishmentUnreadCount(0);
      void markReplenishmentNotificationsAsRead(true);
    }

    setSidebarOpen(false);
  };

  const renderNavigationLabel = (
    item: (typeof navigation)[number],
    isActive: boolean,
  ) => {
    return (
      <>
        <div className="flex min-w-0 items-center gap-3">
          <item.icon className="h-5 w-5 flex-shrink-0" />
          <span className="truncate">{item.name}</span>
        </div>
        {getNavigationBadge(item.href, isActive)}
      </>
    );
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
            <div className="flex items-center justify-between border-b border-red-100 bg-white px-5">
              <img src="/logo.png" alt="ResQHub Logo" className="w-[200px]" />
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1 text-red-600 transition-colors "
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
                    onClick={() => handleNavigationClick(item.href)}
                    className={cn(
                      "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-red-500 via-red-600 to-rose-700 text-white shadow-md"
                        : "text-slate-700 hover:bg-red-50 hover:text-red-700",
                    )}
                  >
                    {renderNavigationLabel(item, isActive)}
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
                className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors "
              >
                <UserCog className="h-4 w-4" />
                Cập nhật hồ sơ
              </button>
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-700  hover:text-white"
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
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => handleNavigationClick(item.href)}
                  className={cn(
                    "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-red-500 via-red-600 to-rose-700 text-white shadow-md"
                      : "text-slate-700 hover:bg-red-50 hover:text-red-700",
                  )}
                >
                  {renderNavigationLabel(item, isActive)}
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
              className="mb-2 flex w-full hover:bg-red-50 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-700 transition-colors "
            >
              <UserCog className="h-4 w-4 " />
              Cập nhật hồ sơ
            </button>
            <Button
              variant="outline"
              className="w-full border-red-200 text-red-700  hover:text-white"
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
