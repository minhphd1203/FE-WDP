import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";
import { Label } from "./label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { listTeams, Team } from "@/apis/teamApi";
import { toast } from "sonner";

interface TeamSelectorDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (teamId: string) => void;
  isLoading?: boolean;
}

export function TeamSelectorDialog({
  open,
  onClose,
  onConfirm,
  isLoading = false,
}: TeamSelectorDialogProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [loadingTeams, setLoadingTeams] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTeams();
    }
  }, [open]);

  const fetchTeams = async () => {
    setLoadingTeams(true);
    try {
      const response = await listTeams({ isActive: true });

      // The response is already a ListTeamsResponse with items property
      if (response.items) {
        setTeams(response.items);
      } else {
        setTeams([]);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách đội cứu hộ");
      setTeams([]);
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedTeamId) {
      toast.error("Vui lòng chọn đội cứu hộ");
      return;
    }
    onConfirm(selectedTeamId);
  };

  const handleClose = () => {
    setSelectedTeamId("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chọn đội cứu hộ để phân phối</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {loadingTeams ? (
            <div className="text-center py-8 text-gray-500">
              Đang tải danh sách đội cứu hộ...
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Không có đội cứu hộ nào đang hoạt động
            </div>
          ) : (
            <RadioGroup
              value={selectedTeamId}
              onValueChange={setSelectedTeamId}
            >
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedTeamId === team.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedTeamId(team.id)}
                  >
                    <RadioGroupItem value={team.id} id={team.id} />
                    <Label htmlFor={team.id} className="flex-1 cursor-pointer">
                      <div className="font-medium text-base">{team.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        <div>📍 Khu vực: {team.area}</div>
                        <div>👥 Quy mô: {team.teamSize} thành viên</div>
                      </div>
                    </Label>
                    {team.isActive && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Đang hoạt động
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedTeamId || isLoading || loadingTeams}
          >
            {isLoading ? "Đang phân phối..." : "Xác nhận phân phối"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
