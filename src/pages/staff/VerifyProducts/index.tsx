import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, XCircle, Eye, Package } from "lucide-react";
import { mockProducts, mockCurrentUser, mockEvents } from "../../../mocks/data";
import { ProductStatus } from "../../../types";
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
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

import { Product } from "../../../types";
import {
  verifyProductSchema,
  VerifyProductFormData,
} from "../../../schema/productSchema";
import { toast } from "sonner";

export default function VerifyProducts() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  // Lọc các sự kiện đang hoạt động (active)
  const activeEvents = mockEvents.filter((event) => event.status === "OPEN");

  // Filter pending products by selected event
  const pendingProducts = products.filter((p) => {
    const isPending = p.status === "pending";
    if (!selectedEventId || selectedEventId === "all") return isPending;
    return isPending && p.eventId === selectedEventId;
  });

  const productsData = { data: pendingProducts };
  const isLoading = false;

  const handleVerify = (id: string, data: VerifyProductFormData) => {
    setProducts(
      products.map((p) =>
        p.id === id
          ? {
              ...p,
              status: data.status as ProductStatus,
              verifiedBy: mockCurrentUser.id,
              verifiedByName: mockCurrentUser.name,
              verifiedAt: new Date().toISOString(),
              rejectionReason: data.rejectionReason,
            }
          : p,
      ),
    );
    toast.success("Xác minh sản phẩm thành công!");
    setIsVerifyDialogOpen(false);
    setSelectedProduct(null);
    reset();
  };

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<VerifyProductFormData>({
    resolver: zodResolver(verifyProductSchema),
  });

  const status = watch("status");

  const onSubmitVerify = (data: VerifyProductFormData) => {
    if (!selectedProduct) return;
    handleVerify(selectedProduct.id, data);
  };

  const handleQuickApprove = (product: Product) => {
    handleVerify(product.id, { status: "verified" });
  };

  const handleQuickReject = (product: Product) => {
    setSelectedProduct(product);
    setIsVerifyDialogOpen(true);
    setValue("status", "rejected");
  };

  return (
    <div className="space-y-6 bg-gradient-to-b from-slate-50 to-slate-100/60 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Xác Minh Sản Phẩm
          </h1>
          <p className="mt-1 text-lg text-slate-600">
            Kiểm tra và xác minh các sản phẩm quyên góp từ người dân
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="warning" className="text-lg px-4 py-2">
            {productsData?.data?.length || 0} sản phẩm chờ xác minh
          </Badge>
        </div>
      </div>

      {/* Event Selection */}
      <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">Chọn sự kiện</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="event-select" className="text-slate-700">
              Sự kiện đang diễn ra
            </Label>
            <Select
              value={selectedEventId}
              onValueChange={(value) => setSelectedEventId(value)}
            >
              <SelectTrigger
                id="event-select"
                className="w-full border-red-400 focus:outline-red-500 focus:ring-0"
              >
                <SelectValue placeholder="Chọn sự kiện để xem sản phẩm chờ xác minh" />
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

      {/* Pending Products Table */}
      <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">
            Sản phẩm chờ xác minh
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-600">Đang tải...</div>
          ) : productsData?.data && productsData.data.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border-none">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-slate-600">Hình ảnh</TableHead>
                    <TableHead className="text-slate-600">
                      Tên sản phẩm
                    </TableHead>
                    <TableHead className="text-slate-600">Danh mục</TableHead>
                    <TableHead className="text-slate-600">Số lượng</TableHead>
                    <TableHead className="text-slate-600">Tình trạng</TableHead>
                    <TableHead className="text-slate-600">
                      Người quyên góp
                    </TableHead>
                    <TableHead className="text-slate-600">Liên hệ</TableHead>
                    <TableHead className="text-slate-600">Ngày gửi</TableHead>
                    <TableHead className="text-right text-slate-600">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsData.data.map((product) => (
                    <TableRow key={product.id} className="hover:bg-slate-50/80">
                      <TableCell>
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded border border-slate-200"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center">
                            <Package className="h-6 w-6 text-slate-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-slate-500" />
                          {product.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-slate-700">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {product.quantity} {product.unit}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.condition === "new" ? "success" : "default"
                          }
                          className={
                            product.condition === "new"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {product.condition === "new"
                            ? "Mới"
                            : product.condition === "used"
                              ? "Đã qua sử dụng"
                              : "Tân trang"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {product.donorName}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="text-slate-700">{product.donorEmail}</p>
                          {product.donorPhone && (
                            <p className="text-slate-600">
                              {product.donorPhone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {new Date(product.createdAt).toLocaleDateString(
                          "vi-VN",
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsDetailDialogOpen(true);
                            }}
                            className="hover:bg-red-50 hover:text-red-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleQuickApprove(product)}
                            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-lg"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Duyệt
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleQuickReject(product)}
                            className="bg-red-600 hover:bg-red-700 rounded-lg"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Từ chối
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-600">
              Không có sản phẩm nào chờ xác minh
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết sản phẩm</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Tên sản phẩm</Label>
                  <p className="font-medium">{selectedProduct.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Danh mục</Label>
                  <p className="font-medium">{selectedProduct.category}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Số lượng</Label>
                  <p className="font-medium">
                    {selectedProduct.quantity} {selectedProduct.unit}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tình trạng</Label>
                  <p className="font-medium">
                    {selectedProduct.condition === "new"
                      ? "Mới"
                      : selectedProduct.condition === "used"
                        ? "Đã qua sử dụng"
                        : "Tân trang"}
                  </p>
                </div>
              </div>

              {selectedProduct.description && (
                <div>
                  <Label className="text-muted-foreground">Mô tả</Label>
                  <p className="mt-1">{selectedProduct.description}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <Label className="text-muted-foreground">
                  Thông tin người quyên góp
                </Label>
                <div className="mt-2 space-y-1">
                  <p>
                    <strong>Họ tên:</strong> {selectedProduct.donorName}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedProduct.donorEmail}
                  </p>
                  {selectedProduct.donorPhone && (
                    <p>
                      <strong>Số điện thoại:</strong>{" "}
                      {selectedProduct.donorPhone}
                    </p>
                  )}
                </div>
              </div>

              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Hình ảnh</Label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {selectedProduct.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Product ${idx + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác minh sản phẩm</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitVerify)} className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Sản phẩm: <strong>{selectedProduct?.name}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái *</Label>
              <Select
                value={status}
                onValueChange={(value) => setValue("status", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verified">Xác minh - Chấp nhận</SelectItem>
                  <SelectItem value="rejected">Từ chối</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
              )}
            </div>

            {status === "rejected" && (
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Lý do từ chối *</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Nhập lý do từ chối sản phẩm này"
                  onChange={(e) => setValue("rejectionReason", e.target.value)}
                />
                {errors.rejectionReason && (
                  <p className="text-sm text-red-500">
                    {errors.rejectionReason.message}
                  </p>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsVerifyDialogOpen(false);
                  reset();
                }}
              >
                Hủy
              </Button>
              <Button type="submit">Xác nhận</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
