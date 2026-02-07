import { useEffect, useState, useRef } from "react";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { listTeams, Team } from "@/apis/teamApi";
import { toast } from "sonner";

interface TeamSelectorDropdownProps {
  value: string;
  onChange: (teamId: string) => void;
  disabled?: boolean;
  placeholder?: string;
  searchable?: boolean;
}

export function TeamSelectorDropdown({
  value,
  onChange,
  disabled = false,
  placeholder = "-- Chọn một đội --",
  searchable = true,
}: TeamSelectorDropdownProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchTeams = async () => {
    setLoadingTeams(true);
    try {
      const response = await listTeams({ isActive: true });
      if (response.items) {
        setTeams(response.items);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách đội");
    } finally {
      setLoadingTeams(false);
    }
  };

  const selectedTeam = teams.find((t) => t.id === value);
  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 border-2 rounded-xl text-left flex items-center justify-between transition-all duration-300 ${
          disabled
            ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
            : isOpen
              ? "border-blue-500 bg-blue-50 shadow-md"
              : "border-gray-300 bg-white hover:border-gray-400"
        }`}
      >
        <span
          className={`text-base font-medium ${
            value ? "text-gray-900" : "text-gray-500"
          }`}
        >
          {loadingTeams ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang tải...
            </div>
          ) : selectedTeam ? (
            <div>
              <div className="font-semibold text-gray-900">
                {selectedTeam.name}
              </div>
              <div className="text-xs text-gray-600 mt-0.5">
                {selectedTeam.area && `(${selectedTeam.area})`}
              </div>
            </div>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
          {searchable && (
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <input
                type="text"
                placeholder="Tìm đội..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
          )}

          <div className="max-h-[320px] overflow-y-auto">
            {filteredTeams.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-500 text-sm">
                Không tìm thấy đội nào
              </div>
            ) : (
              filteredTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => {
                    onChange(team.id);
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  className={`w-full px-4 py-3 text-left border-b border-gray-100 transition-all duration-200 flex items-center justify-between group ${
                    value === team.id
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex-1">
                    <div
                      className={`text-sm font-semibold ${
                        value === team.id
                          ? "text-blue-600"
                          : "text-gray-900 group-hover:text-gray-700"
                      }`}
                    >
                      {team.name}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {team.area && `📍 ${team.area}`}
                      {team.teamSize && ` • 👥 ${team.teamSize} thành viên`}
                    </div>
                  </div>
                  {value === team.id && (
                    <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
