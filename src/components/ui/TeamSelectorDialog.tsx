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
      <DialogContent className="sm:max-w-[550px] rounded-3xl border-2 border-gray-100">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Chọn đội cứu hộ để phân phối</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {loadingTeams ? (
            <div className="text-center py-12 text-gray-500">
              <div className="h-10 w-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
              Đang tải danh sách đội cứu hộ...
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Không có đội cứu hộ nào đang hoạt động
            </div>
          ) : (
            <RadioGroup
              value={selectedTeamId}
              onValueChange={setSelectedTeamId}
            >
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className={`flex items-center space-x-4 border-2 rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
                      selectedTeamId === team.id
                        ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md scale-[1.02]"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                    onClick={() => setSelectedTeamId(team.id)}
                  >
                    <RadioGroupItem value={team.id} id={team.id} />
                    <Label htmlFor={team.id} className="flex-1 cursor-pointer">
                      <div className="font-semibold text-base text-gray-900">{team.name}</div>
                      <div className="text-sm text-gray-600 mt-1.5 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span>📍</span>
                          <span>Khu vực: {team.area}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>👥</span>
                          <span>Quy mô: {team.teamSize} thành viên</span>
                        </div>
                      </div>
                    </Label>
                    {team.isActive && (
                      <span className="text-xs bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 px-3 py-1.5 rounded-full font-medium border border-emerald-200">
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
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-xl"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedTeamId || isLoading || loadingTeams}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl shadow-sm"
          >
            {isLoading ? "Đang phân phối..." : "Xác nhận phân phối"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
