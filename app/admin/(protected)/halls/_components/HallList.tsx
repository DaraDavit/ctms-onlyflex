"use client";

interface Hall {
  id: string;
  name: string;
  hallType: string;
  screenType: string;
  capacity: number;
  rows: number;
  columns: number;
  isActive: boolean;
  createdAt: string;
  _count: {
    showtimes: number;
    seats: number;
  };
}

interface HallListProps {
  halls: Hall[];
  selectedHall: Hall | null;
  onSelectHall: (hall: Hall) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  isMobile?: boolean;
}

const hallTypes = [
  { value: "all", label: "All Types" },
  { value: "STANDARD", label: "Standard" },
  { value: "VIP", label: "VIP" },
  { value: "Regular", label: "Regular" },
];

const getHallTypeBadge = (type: string) => {
  const colors: Record<string, string> = {
    STANDARD: "bg-blue-100 text-blue-800",
    VIP: "bg-purple-100 text-purple-800",
    Regular: "bg-gray-100 text-gray-800",
  };
  return colors[type] || "bg-gray-100 text-gray-800";
};

const getScreenTypeBadge = (type: string) => {
  const colors: Record<string, string> = {
    STANDARD_2D: "bg-green-100 text-green-800",
    THREE_D: "bg-red-100 text-red-800",
    SCREENX: "bg-orange-100 text-orange-800",
  };
  return colors[type] || "bg-gray-100 text-gray-800";
};

const formatScreenType = (type: string) => {
  const labels: Record<string, string> = {
    STANDARD_2D: "2D",
    THREE_D: "3D",
    SCREENX: "ScreenX",
  };
  return labels[type] || type;
};

export default function HallList({
  halls,
  selectedHall,
  onSelectHall,
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  isMobile = false,
}: HallListProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Search & Filter */}
      <div className="p-4 space-y-3 border-b bg-white">
        <div className="relative">
          <input
            type="text"
            placeholder="Search halls..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <select
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          {hallTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Hall List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {halls.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No halls found</p>
            <p className="text-xs mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          halls.map((hall) => (
            <button
              key={hall.id}
              onClick={() => onSelectHall(hall)}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                selectedHall?.id === hall.id
                  ? "bg-indigo-50 border-indigo-200 border"
                  : "hover:bg-gray-50 border border-transparent"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎬</span>
                    <h4 className="font-semibold text-sm text-gray-900 truncate">
                      {hall.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getHallTypeBadge(
                        hall.hallType
                      )}`}
                    >
                      {hall.hallType}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getScreenTypeBadge(
                        hall.screenType
                      )}`}
                    >
                      {formatScreenType(hall.screenType)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {hall.capacity} seats
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  {hall.isActive ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span>
                  )}
                  {isMobile && (
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
