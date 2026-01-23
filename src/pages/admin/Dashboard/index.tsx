import { useNavigate } from "react-router-dom";
import { Plus, Calendar, Users, Package, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { ROUTES } from "../../../constants";
import {
  mockEvents,
  mockReliefRequests,
  mockProducts,
  mockWarehouseStats,
} from "../../../mocks/data";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Use mock data
  const eventsData = { data: { items: mockEvents, total: mockEvents.length } };
  const requestsData = {
    data: {
      items: mockReliefRequests.filter((r) => r.status === "pending"),
      total: mockReliefRequests.filter((r) => r.status === "pending").length,
    },
  };
  const pendingProductsData = {
    data: mockProducts.filter((p) => p.status === "pending"),
  };
  const warehouseStats = { data: mockWarehouseStats };

  const stats = [
    {
      title: "Sự kiện đang diễn ra",
      value: eventsData?.data?.total || 0,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Đơn yêu cầu chờ xử lý",
      value: requestsData?.data?.total || 0,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Sản phẩm chờ xác minh",
      value: pendingProductsData?.data?.length || 0,
      icon: Package,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Tổng mặt hàng trong kho",
      value: warehouseStats?.data?.totalItems || 0,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  const quickActions = [
    {
      title: "Tạo sự kiện mới",
      description: "Tạo đội cứu trợ hoặc chiến dịch quyên góp",
      action: () => navigate(ROUTES.ADMIN_CREATE_EVENT),
      icon: Plus,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Quản lý đơn cứu hộ",
      description: "Xem và xử lý các yêu cầu cứu hộ",
      action: () => navigate(ROUTES.ADMIN_RELIEF_REQUESTS),
      icon: AlertCircle,
      color: "bg-red-500 hover:bg-red-600",
    },
    {
      title: "Quản lý kho",
      description: "Xem và quản lý vật phẩm cứu trợ",
      action: () => navigate(ROUTES.ADMIN_WAREHOUSE),
      icon: Package,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Quản lý người dùng",
      description: "Quản lý Admin, Staff và User",
      action: () => navigate(ROUTES.ADMIN_USERS),
      icon: Users,
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý hoạt động cứu trợ lũ lụt
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Thao tác nhanh</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={action.action}
            >
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4`}
                >
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sự kiện gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            {eventsData?.data?.items && eventsData.data.items.length > 0 ? (
              <div className="space-y-4">
                {eventsData.data.items.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 pb-3 border-b last:border-0"
                  >
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.startDate).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Chưa có sự kiện nào
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Đơn cứu hộ mới</CardTitle>
          </CardHeader>
          <CardContent>
            {requestsData?.data?.items && requestsData.data.items.length > 0 ? (
              <div className="space-y-4">
                {requestsData.data.items.slice(0, 5).map((request) => (
                  <div
                    key={request.id}
                    className="flex items-start gap-3 pb-3 border-b last:border-0"
                  >
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{request.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {request.location.address}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Chưa có đơn yêu cầu mới
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
