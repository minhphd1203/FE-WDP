import { useNavigate } from "react-router-dom";
import { Package, CheckCircle, Send } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { mockProducts, mockWarehouseStats } from "../../../mocks/data";
import { ROUTES } from "../../../constants";

export default function StaffDashboard() {
  const navigate = useNavigate();

  // Use mock data
  const pendingProductsData = {
    data: mockProducts.filter((p) => p.status === "pending"),
  };
  const warehouseStats = { data: mockWarehouseStats };

  const stats = [
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Staff</h1>
          <p className="text-muted-foreground mt-1">
            Xác minh và phân phối sản phẩm cứu trợ
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2">
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
        <div className="grid gap-4 md:grid-cols-2">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(ROUTES.STAFF_VERIFY_PRODUCTS)}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Xác minh sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Duyệt và xác minh các sản phẩm quyên góp từ người dân
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(ROUTES.STAFF_DISTRIBUTE)}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-green-500 hover:bg-green-600 flex items-center justify-center mb-4">
                <Send className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Phân phối sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Phân chia vật phẩm cứu trợ cho các đội và khu vực
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
