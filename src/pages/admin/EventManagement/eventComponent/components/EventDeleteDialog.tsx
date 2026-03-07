import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteDialogState } from "../types";

interface EventDeleteDialogProps {
  state: DeleteDialogState;
  setState: (state: DeleteDialogState) => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export default function EventDeleteDialog({
  state,
  setState,
  onDelete,
  isDeleting,
}: EventDeleteDialogProps) {
  return (
    <Dialog
      open={state.open}
      onOpenChange={(open) => setState({ ...state, open })}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa sự kiện</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa sự kiện "{state.eventTitle}"? Hành động
            này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() =>
              setState({ open: false, eventId: null, eventTitle: "" })
            }
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
