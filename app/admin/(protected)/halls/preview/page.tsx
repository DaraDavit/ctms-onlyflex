"use client";

import { useState, useEffect, useCallback } from "react";
import { SeatGrid } from "@/components/seats/SeatGrid";
import { Seat } from "@/types/seat";
import { usePolling } from "@/lib/use-polling";

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
  seats?: Seat[];
  _count: {
    showtimes: number;
    seats: number;
  };
}

export default function HallPreviewPage() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [viewMode] = useState<"admin">("admin");

  const getScreenTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      STANDARD_2D: "bg-green-100 text-green-800",
      THREE_D: "bg-red-100 text-red-800",
      SCREENX: "bg-orange-100 text-orange-800",
    };
    return styles[type] || "bg-gray-100 text-gray-800";
  };

  const formatScreenType = (type: string) => {
    const labels: Record<string, string> = {
      STANDARD_2D: "2D",
      THREE_D: "3D",
      SCREENX: "ScreenX",
    };
    return labels[type] || type;
  };

  const fetchHalls = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      params.set("includeSeats", "true");

      const response = await fetch(`/api/admin/halls?${params}`);
      const data = await response.json();

      if (response.ok) {
        setHalls(data.halls);
        if (data.halls.length > 0 && !selectedHall) {
          setSelectedHall(data.halls[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch halls:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedHall]);

  useEffect(() => {
    fetchHalls();
  }, [fetchHalls]);

  // Polling for live updates
  const { isPolling, lastUpdated } = usePolling({
    interval: 5000,
    enabled: true,
    onPoll: fetchHalls,
  });

  // Format last updated time
  const getLastUpdatedText = () => {
    if (!lastUpdated) return "Never";
    const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
    if (seconds < 5) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  const handleSeatClick = (seat: Seat) => {
    console.log("Seat clicked:", seat);
  };

  const getSeatsForGrid = (): Seat[] => {
    if (!selectedHall) return [];
    
    if (!selectedHall.seats || selectedHall.seats.length === 0) {
      const seats: Seat[] = [];
      for (let rowIdx = 0; rowIdx < selectedHall.rows; rowIdx++) {
        const row = String.fromCharCode(65 + rowIdx);
        for (let col = 0; col < selectedHall.columns; col++) {
          seats.push({
            id: `${selectedHall.id}-${row}-${col}`,
            hallId: selectedHall.id,
            row,
            column: col,
            number: col + 1,
            seatNumber: col + 1,
            seatType: "REGULAR",
            status: "AVAILABLE",
          });
        }
      }
      return seats;
    }

    return selectedHall.seats.map((seat: Seat) => ({
      ...seat,
      status: seat.status || "AVAILABLE",
    }));
  };

  const filteredHalls = halls;

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading halls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Left Panel - Hall List */}
      <div className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Seat Preview</h1>
              <p className="text-sm text-gray-500 mt-1">
                {filteredHalls.length} {filteredHalls.length === 1 ? "hall" : "halls"}
              </p>
            </div>
            {/* Live Indicator */}
            <div className="flex items-center gap-2 text-sm">
              <span className={`w-2 h-2 rounded-full ${isPolling ? "bg-green-500" : "bg-gray-300"} animate-pulse`} />
              <span className="text-gray-500">Live</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="text"
              placeholder="Search halls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
        </div>

        {/* Hall List */}
        <div className="flex-1 overflow-y-auto">
          {filteredHalls.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <span className="text-4xl block mb-4">🎬</span>
              <p>No halls found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredHalls.map((hall) => (
                <button
                  key={hall.id}
                  onClick={() => setSelectedHall(hall)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedHall?.id === hall.id ? "bg-indigo-50 border-l-4 border-indigo-600" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{hall.name}</h3>
                      <p className="text-sm text-gray-500">
                        {hall.rows} rows × {hall.columns} columns
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        hall.hallType === "VIP"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {hall.hallType}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${getScreenTypeBadge(
                        hall.screenType
                      )}`}
                    >
                      {formatScreenType(hall.screenType)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <span>Capacity: {hall.capacity}</span>
                    <span>Seats: {hall._count.seats}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Seat Preview */}
      <div className="flex-1 bg-gray-100 overflow-y-auto">
        {selectedHall ? (
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedHall.name}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        selectedHall.hallType === "VIP"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {selectedHall.hallType}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${getScreenTypeBadge(
                        selectedHall.screenType
                      )}`}
                    >
                      {formatScreenType(selectedHall.screenType)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {selectedHall.rows} rows × {selectedHall.columns} columns
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">
                      Capacity: {selectedHall.capacity}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Updated: {getLastUpdatedText()}
                </div>
              </div>
            </div>

            {/* Seat Grid */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <SeatGrid
                seats={getSeatsForGrid()}
                columns={selectedHall.columns}
                selectedSeats={selectedSeats}
                viewMode={viewMode}
                hallName={selectedHall.name}
                isDragging={false}
                onSeatClick={handleSeatClick}
                onMouseDown={() => {}}
                onMouseEnter={() => {}}
                onMouseUp={() => {}}
                onContextMenu={() => {}}
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <span className="text-4xl block mb-4">🪑</span>
              <p className="text-lg font-medium">Select a hall</p>
              <p className="text-sm mt-1">Choose a hall from the list to view seat layout</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
