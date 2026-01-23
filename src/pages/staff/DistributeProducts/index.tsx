import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, Send, Users } from "lucide-react";
import { mockProducts, mockCurrentUser, mockEvents } from "../../../mocks/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { productApi } from "../../../apis/productApi";
import { Product } from "../../../types";
import {
  distributeProductSchema,
  DistributeProductFormData,
} from "../../../schema/productSchema";
import { toast } from "sonner";

export default function DistributeProducts() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDistributeDialogOpen, setIsDistributeDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  // Lọc các sự kiện đang hoạt động (active)
  const activeEvents = mockEvents.filter((event) => event.status === "active");

  // Filter verified products by selected event
  const verifiedProducts = products.filter((p) => {
    const isVerified = p.status === "verified";
    if (!selectedEventId || selectedEventId === "all") return isVerified;
    return isVerified && p.eventId === selectedEventId;
  });

  const productsData = {
    data: {
      items: verifiedProducts,
      total: verifiedProducts.length,
    },
  };
  const isLoading = false;

  const handleDistribute = (id: string, data: DistributeProductFormData) => {
    setProducts(
      products.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "distributed" as any,
              distributedTo: data.teamId,
              distributedToName: `Đội cứu trợ ${data.teamId.replace("team", "")}`,
              distributedAt: new Date().toISOString(),
            }
          : p,
      ),
    );
    toast.success("Phân phối sản phẩm thành công!");
    setIsDistributeDialogOpen(false);
    setSelectedProduct(null);
    reset();
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<DistributeProductFormData>({
    resolver: zodResolver(distributeProductSchema),
  });

  const onSubmitDistribute = (data: DistributeProductFormData) => {
    if (!selectedProduct) return;
    handleDistribute(selectedProduct.id, data);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Phân Phối Sản Phẩm</h1>
          <p className="text-muted-foreground mt-1">
            Phân chia sản phẩm cho các đội cứu trợ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="text-lg px-4 py-2">
            {productsData?.data?.total || 0} sản phẩm sẵn sàng
          </Badge>
        </div>
      </div>

      {/* Event Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Chọn sự kiện</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="event-select">Sự kiện đang diễn ra</Label>
            <Select
              value={selectedEventId}
              onValueChange={(value) => setSelectedEventId(value)}
            >
              <SelectTrigger id="event-select" className="w-full">
                <SelectValue placeholder="Chọn sự kiện để xem sản phẩm chờ phân phối" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả sự kiện</SelectItem>
                {activeEvents.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title} (
                    {new Date(event.startDate).toLocaleDateString("vi-VN")} -{" "}
                    {new Date(event.endDate).toLocaleDateString("vi-VN")})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedEventId && selectedEventId !== "all" && (
              <p className="text-sm text-muted-foreground">
                Đang hiển thị sản phẩm của:{" "}
                <strong>
                  {activeEvents.find((e) => e.id === selectedEventId)?.title}
                </strong>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sẵn sàng phân phối
            </CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {productsData?.data?.total || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Đội cứu trợ hoạt động
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">5</div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sản phẩm chờ phân phối</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : productsData?.data?.items &&
            productsData.data.items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Tình trạng</TableHead>
                  <TableHead>Người quyên góp</TableHead>
                  <TableHead>Ngày xác minh</TableHead>
                  <TableHead>Người xác minh</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsData.data.items.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {product.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        {product.quantity} {product.unit}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.condition === "new" ? "success" : "default"
                        }
                      >
                        {product.condition === "new"
                          ? "Mới"
                          : product.condition === "used"
                            ? "Đã qua sử dụng"
                            : "Tân trang"}
                      </Badge>
                    </TableCell>
                    <TableCell>{product.donorName}</TableCell>
                    <TableCell>
                      {product.verifiedAt
                        ? new Date(product.verifiedAt).toLocaleDateString(
                            "vi-VN",
                          )
                        : "-"}
                    </TableCell>
                    <TableCell>{product.verifiedByName || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsDistributeDialogOpen(true);
                        }}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Phân phối
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Không có sản phẩm nào chờ phân phối
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distribute Dialog */}
      <Dialog
        open={isDistributeDialogOpen}
        onOpenChange={setIsDistributeDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phân phối sản phẩm</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmitDistribute)}
            className="space-y-4"
          >
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Sản phẩm: <strong>{selectedProduct?.name}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Số lượng hiện có:{" "}
                <strong>
                  {selectedProduct?.quantity} {selectedProduct?.unit}
                </strong>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamId">Chọn đội cứu trợ *</Label>
              <Select onValueChange={(value) => setValue("teamId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đội" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team1">Đội cứu trợ 1 - Hà Nội</SelectItem>
                  <SelectItem value="team2">
                    Đội cứu trợ 2 - Hải Phòng
                  </SelectItem>
                  <SelectItem value="team3">
                    Đội cứu trợ 3 - Quảng Ninh
                  </SelectItem>
                  <SelectItem value="team4">
                    Đội cứu trợ 4 - Thanh Hóa
                  </SelectItem>
                  <SelectItem value="team5">Đội cứu trợ 5 - Nghệ An</SelectItem>
                </SelectContent>
              </Select>
              {errors.teamId && (
                <p className="text-sm text-red-500">{errors.teamId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Số lượng phân phối</Label>
              <Input
                id="quantity"
                type="number"
                placeholder={`Tối đa ${selectedProduct?.quantity}`}
                {...register("quantity", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Để trống nếu muốn phân phối toàn bộ
              </p>
              {errors.quantity && (
                <p className="text-sm text-red-500">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDistributeDialogOpen(false);
                  setSelectedProduct(null);
                  reset();
                }}
              >
                Hủy
              </Button>
              <Button type="submit">Phân phối</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
