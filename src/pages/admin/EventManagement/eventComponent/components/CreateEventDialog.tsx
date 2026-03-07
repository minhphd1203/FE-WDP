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
import { createEventSchema, CreateEventFormData } from "@/schema/eventSchema";
import { z } from "zod";
import DateTimePicker from "./DateTimePicker";
import {
  createTypeOptions,
  primaryButtonClass,
  secondaryButtonClass,
} from "../constants";
import { getCurrentDateTimeLocal } from "../utils";

interface CreateEventDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  form: UseFormReturn<CreateEventFormData>;
  onSubmit: (data: CreateEventFormData) => Promise<void>;
  isSubmitting: boolean;
  onCloseReset: () => void;
}

export default function CreateEventDialog({
  open,
  setOpen,
  form,
  onSubmit,
  isSubmitting,
  onCloseReset,
}: CreateEventDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = form;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) onCloseReset();
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-3xl border-2 bg-gradient-to-br from-white to-red-50/30">
        <DialogHeader className="border-b border-red-100 pb-4">
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Tạo sự kiện mới
          </DialogTitle>
          <DialogDescription>
            Tạo sự kiện ngay trong trang danh sách mà không cần chuyển trang.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("startDate")} />
          <input type="hidden" {...register("endDate")} />

          <div className="space-y-2">
            <Label htmlFor="create-type">Loại sự kiện *</Label>
            <Select
              value={watch("type")}
              onValueChange={(value) =>
                setValue(
                  "type",
                  value as z.infer<typeof createEventSchema>["type"],
                )
              }
            >
              <SelectTrigger
                id="create-type"
                className="h-11 rounded-xl border-2 border-red-200 bg-white transition-all focus:ring-2 focus:ring-red-500/20"
              >
                <SelectValue placeholder="Chọn loại sự kiện" />
              </SelectTrigger>
              <SelectContent>
                {createTypeOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type ? (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-title">Tiêu đề *</Label>
            <Input
              id="create-title"
              placeholder="Nhập tiêu đề sự kiện"
              className="h-11 w-full rounded-xl border-[1px] border-red-400 px-3 text-base focus:outline-red-500 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              {...register("title")}
            />
            {errors.title ? (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-description">Mô tả *</Label>
            <Textarea
              id="create-description"
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
              <Label htmlFor="create-startDate">Ngày bắt đầu *</Label>
              <DateTimePicker
                id="create-startDate"
                minDateTime={getCurrentDateTimeLocal()}
                value={watch("startDate") || ""}
                onChange={(value) =>
                  setValue("startDate", value, { shouldValidate: true })
                }
                error={errors.startDate?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-endDate">Ngày kết thúc *</Label>
              <DateTimePicker
                id="create-endDate"
                minDateTime={watch("startDate") || getCurrentDateTimeLocal()}
                value={watch("endDate") || ""}
                onChange={(value) =>
                  setValue("endDate", value, { shouldValidate: true })
                }
                error={errors.endDate?.message}
              />
            </div>
          </div>

          {watch("type") === "VOLUNTEER" ? (
            <div className="space-y-2">
              <Label htmlFor="create-location">Địa điểm tập trung</Label>
              <OSMLocationPicker
                value={watch("location") || ""}
                onChange={(value) =>
                  setValue("location", value, {
                    shouldValidate: true,
                  })
                }
                placeholder="Chon tren ban do truoc, hoac tim dia diem"
                error={errors.location?.message}
                showMap={true}
                mapFirst={true}
              />
            </div>
          ) : null}

          <DialogFooter className="border-t border-red-100 pt-4">
            <Button
              type="button"
              variant="outline"
              className={secondaryButtonClass}
              onClick={onCloseReset}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={primaryButtonClass}
            >
              {isSubmitting ? "Đang tạo..." : "Tạo sự kiện"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
