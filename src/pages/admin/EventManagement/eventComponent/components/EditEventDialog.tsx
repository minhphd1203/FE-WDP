import { UseFormReturn } from "react-hook-form";
import OSMLocationPicker from "@/components/ui/osm-location-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UpdateEventFormData } from "@/schema/eventSchema";
import { Event } from "@/types";
import DateTimePicker from "./DateTimePicker";
import {
  editStatusOptions,
  primaryButtonClass,
  secondaryButtonClass,
} from "../constants";
import { EventStatus } from "../types";

interface EditEventDialogProps {
  editingEvent: Event | null;
  setEditingEvent: (event: Event | null) => void;
  editStatus: EventStatus;
  setEditStatus: (status: EventStatus) => void;
  form: UseFormReturn<UpdateEventFormData>;
  onSubmit: (data: UpdateEventFormData) => Promise<void>;
  isSubmitting: boolean;
}

export default function EditEventDialog({
  editingEvent,
  setEditingEvent,
  editStatus,
  setEditStatus,
  form,
  onSubmit,
  isSubmitting,
}: EditEventDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = form;

  return (
    <Dialog
      open={!!editingEvent}
      onOpenChange={(open) => {
        if (!open) setEditingEvent(null);
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-3xl border-2 bg-gradient-to-br from-white to-red-50/30">
        <DialogHeader className="border-b border-red-100 pb-4">
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Chỉnh sửa sự kiện
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin và trạng thái sự kiện trực tiếp bằng popup.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("startDate")} />
          <input type="hidden" {...register("endDate")} />

          <div className="space-y-2">
            <Label htmlFor="edit-status">Trạng thái</Label>
            <Select
              value={editStatus}
              onValueChange={(v) => setEditStatus(v as EventStatus)}
            >
              <SelectTrigger
                id="edit-status"
                className="h-11 rounded-xl border-2 border-red-200 bg-white transition-all focus:ring-2 focus:ring-red-500/20"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {editStatusOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-title">Tiêu đề *</Label>
            <Input
              id="edit-title"
              placeholder="Nhập tiêu đề sự kiện"
              className="h-11 w-full rounded-xl border-[1px] border-red-400 px-3 text-base focus:outline-red-500 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              {...register("title")}
            />
            {errors.title ? (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Mô tả *</Label>
            <Textarea
              id="edit-description"
              placeholder="Mô tả chi tiết về sự kiện"
              rows={4}
              className="min-h-[80px] resize-none rounded-xl border-2 border-red-200 bg-white transition-all focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20"
              {...register("description")}
            />
            {errors.description ? (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-startDate">Ngày bắt đầu *</Label>
              <DateTimePicker
                id="edit-startDate"
                value={watch("startDate") || ""}
                onChange={(value) =>
                  setValue("startDate", value, { shouldValidate: true })
                }
                error={errors.startDate?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-endDate">Ngày kết thúc *</Label>
              <DateTimePicker
                id="edit-endDate"
                minDateTime={watch("startDate") || ""}
                value={watch("endDate") || ""}
                onChange={(value) =>
                  setValue("endDate", value, { shouldValidate: true })
                }
                error={errors.endDate?.message}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-location">Địa điểm</Label>
            <OSMLocationPicker
              value={watch("location") || ""}
              onChange={(value) =>
                setValue("location", value, { shouldValidate: true })
              }
              placeholder="Chon tren ban do truoc, hoac tim dia diem"
              error={errors.location?.message}
              showMap={true}
              mapFirst={true}
            />
          </div>

          <DialogFooter className="border-t border-red-100 pt-4">
            <Button
              type="button"
              variant="outline"
              className={secondaryButtonClass}
              onClick={() => setEditingEvent(null)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={primaryButtonClass}
            >
              {isSubmitting ? "Đang cập nhật..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
