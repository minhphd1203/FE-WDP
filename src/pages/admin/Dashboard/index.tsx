import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Calendar,
  Users,
  Package,
  AlertCircle,
  UserCog,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { ROUTES } from "../../../constants";
import {
  adminDashboardApi,
  AdminDashboardStats,
} from "../../../apis/adminDashboardApi";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState<AdminDashboardStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setIsStatsLoading(true);
      try {
        const response = await adminDashboardApi.getStats();
        if (response.success) {
          setStatsData(response.data);
        } else {
          setStatsData(null);
          toast.error("Không thể tải thống kê tổng quan");
        }
      } catch (error) {
        setStatsData(null);
        toast.error("Không thể tải thống kê tổng quan");
      } finally {
        setIsStatsLoading(false);
      }
    };

    void fetchStats();
  }, []);

  const displayValue = (value?: number) => {
    if (isStatsLoading) return "...";
    return value !== undefined && value !== null ? value.toLocaleString() : "-";
  };

  const stats = useMemo(
    () => [
      {
        title: "Sự kiện đang mở",
        value: displayValue(statsData?.openEvents),
        icon: Calendar,
        color: "text-red-700",
        bgColor: "bg-red-100",
      },
      {
        title: "Yêu cầu chờ xử lý",
        value: displayValue(statsData?.pendingRequests),
        icon: AlertCircle,
        color: "text-rose-700",
        bgColor: "bg-rose-100",
      },
      {
        title: "Tổng tồn kho",
        value: displayValue(statsData?.totalStock),
        icon: Package,
        color: "text-emerald-700",
        bgColor: "bg-emerald-100",
      },
      {
        title: "Tổng tài khoản",
        value: displayValue(statsData?.totalAccounts),
        icon: Users,
        color: "text-slate-700",
        bgColor: "bg-slate-100",
      },
    ],
    [isStatsLoading, statsData],
  );

  const quickActions = [
    {
      title: "Tạo sự kiện mới",
      description: "Tạo đội cứu trợ hoặc chiến dịch quyên góp",
      action: () => navigate(ROUTES.ADMIN_CREATE_EVENT),
      icon: Plus,
      color:
        "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700",
    },
    {
      title: "Yêu cầu cứu hộ",
      description: "Xem và xử lý các yêu cầu cứu hộ",
      action: () => navigate(ROUTES.ADMIN_RELIEF_REQUESTS),
      icon: AlertCircle,
      color:
        "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700",
    },
    {
      title: "Đăng ký đội cứu hộ",
      description: "Duyệt hồ sơ đăng ký đội cứu hộ mới",
      action: () => navigate(ROUTES.ADMIN_TEAM_REGISTRATION_REQUESTS),
      icon: ShieldCheck,
      color:
        "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700",
    },
    {
      title: "Quản lý kho",
      description: "Xem và quản lý vật phẩm cứu trợ",
      action: () => navigate(ROUTES.ADMIN_WAREHOUSE),
      icon: Package,
      color:
        "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700",
    },
    {
      title: "Tài khoản",
      description: "Quản lý Admin, Staff và User",
      action: () => navigate(ROUTES.ADMIN_USERS),
      icon: UserCog,
      color:
        "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tổng quan</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý hoạt động cứu trợ lũ lụt
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="border-red-100 bg-gradient-to-br from-white to-red-50/30"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-red-100">
              <CardTitle className="text-sm font-semibold text-slate-900">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-slate-900">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Thao tác nhanh
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className="border-red-100 bg-gradient-to-br from-white to-red-50/30 cursor-pointer hover:shadow-lg hover:border-red-200 transition-all"
              onClick={action.action}
            >
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4 shadow-md`}
                >
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-slate-900">
                  {action.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
