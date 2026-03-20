import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, CheckCircle, Send, Users, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { ROUTES } from "../../../constants";
import {
  staffDashboardApi,
  StaffDashboardStats,
} from "../../../apis/staffDashboardApi";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState<StaffDashboardStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setIsStatsLoading(true);
      try {
        const response = await staffDashboardApi.getStats();
        if (response.success) {
          setStatsData(response.data);
        } else {
          setStatsData(null);
          toast.error("Không thể tải thống kê dashboard staff");
        }
      } catch (error) {
        setStatsData(null);
        toast.error("Không thể tải thống kê dashboard staff");
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
        title: "Sản phẩm chờ xác minh",
        value: displayValue(statsData?.pendingProducts),
        icon: Package,
        color: "text-red-600",
        bgColor: "bg-gradient-to-br from-red-50 to-rose-50",
      },
      {
        title: "ĐK tình nguyện chờ duyệt",
        value: displayValue(statsData?.pendingVolunteerRegistrations),
        icon: Users,
        color: "text-blue-600",
        bgColor: "bg-gradient-to-br from-blue-50 to-sky-50",
      },
      {
        title: "Yêu cầu cứu hộ chờ",
        value: displayValue(statsData?.pendingRescueRequests),
        icon: AlertCircle,
        color: "text-amber-600",
        bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
      },
      {
        title: "Yêu cầu bổ sung chờ",
        value: displayValue(statsData?.pendingReplenishmentRequests),
        icon: Send,
        color: "text-fuchsia-600",
        bgColor: "bg-gradient-to-br from-fuchsia-50 to-pink-50",
      },
      {
        title: "Tổng mặt hàng trong kho",
        value: displayValue(statsData?.totalStockItems),
        icon: Package,
        color: "text-emerald-600",
        bgColor: "bg-gradient-to-br from-emerald-50 to-teal-50",
      },
    ],
    [isStatsLoading, statsData],
  );

  return (
    <div className="space-y-6 bg-gradient-to-b from-slate-50 to-red-50/30 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard Staff
          </h1>
          <p className="mt-1 text-lg text-slate-600">
            Quản lý xác minh và phân phối sản phẩm cứu trợ
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="rounded-2xl border-none bg-white/95 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-slate-100">
              <CardTitle className="text-sm font-semibold text-slate-900">
                {stat.title}
              </CardTitle>
              <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {stat.value}
              </div>
              <p className="text-xs text-slate-500">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Thao tác nhanh
        </h2>
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
          <Card
            className="rounded-2xl border-none bg-white/95 shadow-sm cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            onClick={() => navigate(ROUTES.STAFF_PRODUCTS)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-lg text-slate-900">
                  Xác minh sản phẩm
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Duyệt và xác minh các sản phẩm quyên góp từ người dân
              </p>
            </CardContent>
          </Card>

          <Card
            className="rounded-2xl border-none bg-white/95 shadow-sm cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            onClick={() => navigate(ROUTES.STAFF_WAREHOUSE_TEAM)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center">
                  <Send className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-lg text-slate-900">
                  Phân phối sản phẩm
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Phân chia vật phẩm cứu trợ cho các đội và khu vực
              </p>
            </CardContent>
          </Card>

          <Card
            className="rounded-2xl border-none bg-white/95 shadow-sm cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            onClick={() => navigate(ROUTES.STAFF_WAREHOUSE_COMMON)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                  <Package className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle className="text-lg text-slate-900">
                  Kho chung
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Quản lý và theo dõi tồn kho chung
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
