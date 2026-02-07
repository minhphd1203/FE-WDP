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
      color: "text-amber-600",
      bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
      borderColor: "border-amber-100",
    },
    {
      title: "Tổng mặt hàng trong kho",
      value: warehouseStats?.data?.totalItems || 0,
      icon: Package,
      color: "text-emerald-600",
      bgColor: "bg-gradient-to-br from-emerald-50 to-teal-50",
      borderColor: "border-emerald-100",
    },
  ];

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 to-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Dashboard Staff
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Xác minh và phân phối sản phẩm cứu trợ
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className={`border-2 ${stat.borderColor} ${stat.bgColor} rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">
                {stat.title}
              </CardTitle>
              <div
                className={`p-3 rounded-2xl bg-white shadow-sm border border-gray-100`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Thao tác nhanh
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card
            className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-gray-100 rounded-2xl bg-white group"
            onClick={() => navigate(ROUTES.STAFF_PRODUCTS)}
          >
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 group-hover:from-amber-500 group-hover:to-orange-600 flex items-center justify-center mb-4 shadow-lg transition-all duration-300">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Xác minh sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 leading-relaxed">
                Duyệt và xác minh các sản phẩm quyên góp từ người dân
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-gray-100 rounded-2xl bg-white group"
            onClick={() => navigate(ROUTES.STAFF_PRODUCTS)}
          >
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 group-hover:from-emerald-500 group-hover:to-teal-600 flex items-center justify-center mb-4 shadow-lg transition-all duration-300">
                <Send className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Phân phối sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 leading-relaxed">
                Phân chia vật phẩm cứu trợ cho các đội và khu vực
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
