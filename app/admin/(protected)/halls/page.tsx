"use client";

import { useState, useEffect, useCallback } from "react";
import HallList from "./_components/HallList";
import HallDetailPanel from "./_components/HallDetailPanel";
import HallForm from "./_components/HallForm";
import HallDeleteConfirmModal from "./_components/HallDeleteConfirmModal";
import { RowConfig } from "@/lib/hall-utils";

interface Hall {
  id: string;
  name: string;
  hallType: string;
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

interface HallFormData {
  name: string;
  hallType: string;
  rows: number;
  columns: number;
  isActive: boolean;
  rowConfigs: RowConfig[];
}

export default function AdminHallsPage() {
  // Data state
  const [halls, setHalls] = useState<Hall[]>([]);
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHall, setEditingHall] = useState<Hall | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [hallToDelete, setHallToDelete] = useState<Hall | null>(null);

  // Mobile view state
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-clear success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch halls
  const fetchHalls = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (typeFilter !== "all") params.set("type", typeFilter);

      const response = await fetch(`/api/admin/halls?${params}`);
      const data = await response.json();

      if (response.ok) {
        setHalls(data.halls);
        // Auto-select first hall if none selected or current selection not in list
        if (data.halls.length > 0) {
          const currentSelectedExists = selectedHall
            ? data.halls.find((h: Hall) => h.id === selectedHall.id)
            : false;
          if (!currentSelectedExists) {
            setSelectedHall(data.halls[0]);
          }
        } else {
          setSelectedHall(null);
        }
      } else {
        setError(data.error || "Failed to fetch halls");
      }
    } catch {
      setError("Failed to fetch halls");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, typeFilter, selectedHall]);

  useEffect(() => {
    fetchHalls();
  }, [fetchHalls]);

  // Handle hall selection
  const handleSelectHall = (hall: Hall) => {
    setSelectedHall(hall);
    if (isMobile) {
      setMobileView("detail");
    }
  };

  // Handle create hall
  const handleCreateHall = async (formData: HallFormData) => {
    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/admin/halls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsFormOpen(false);
        await fetchHalls();
        // Select the newly created hall
        if (data.hall) {
          setSelectedHall(data.hall);
        }
      } else {
        setError(data.error || "Failed to create hall");
      }
    } catch {
      setError("Failed to create hall");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update hall
  const handleUpdateHall = async (formData: HallFormData) => {
    if (!editingHall) return;

    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/halls/${editingHall.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsFormOpen(false);
        setEditingHall(null);
        await fetchHalls();
      } else {
        setError(data.error || "Failed to update hall");
      }
    } catch {
      setError("Failed to update hall");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete hall
  const handleDeleteHall = async () => {
    if (!hallToDelete) return;

    setIsUpdating(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/halls/${hallToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        await fetchHalls();
        setSelectedHall(null);
        setSuccessMessage(data.message || `Hall "${hallToDelete.name}" deleted successfully`);
      } else {
        setError(data.error || "Failed to delete hall");
      }
    } catch {
      setError("Failed to delete hall");
    } finally {
      setIsUpdating(false);
      setIsDeleteConfirmOpen(false);
      setHallToDelete(null);
    }
  };

  // Open delete confirmation modal
  const openDeleteConfirm = () => {
    if (!selectedHall) return;
    setHallToDelete(selectedHall);
    setIsDeleteConfirmOpen(true);
  };

  // Handle toggle status
  const handleToggleStatus = async () => {
    if (!selectedHall) return;

    setIsUpdating(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/halls/${selectedHall.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !selectedHall.isActive }),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchHalls();
      } else {
        setError(data.error || "Failed to update status");
      }
    } catch {
      setError("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  // Open edit modal
  const handleEditClick = () => {
    if (!selectedHall) return;
    setEditingHall(selectedHall);
    setIsFormOpen(true);
  };

  // Close form modal
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingHall(null);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hall Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {halls.length} {halls.length === 1 ? "hall" : "halls"} configured
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Hall
        </button>
      </div>

      {/* Messages */}
      {(error || successMessage) && (
        <div className="mx-6 mt-4 space-y-2">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm rounded-r-lg">
              {successMessage}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        {isMobile ? (
          // Mobile: Stack layout
          <div className="h-full">
            {mobileView === "list" ? (
              <HallList
                halls={halls}
                selectedHall={selectedHall}
                onSelectHall={handleSelectHall}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
                isMobile={true}
              />
            ) : (
              <HallDetailPanel
                hall={selectedHall}
                onEdit={handleEditClick}
                onDelete={openDeleteConfirm}
                onToggleStatus={handleToggleStatus}
                isUpdating={isUpdating}
                isMobile={true}
                onBackToList={() => setMobileView("list")}
              />
            )}
          </div>
        ) : (
          // Desktop: Two-column layout
          <div className="h-full flex">
            {/* Left Column: Hall List */}
            <div className="w-80 border-r bg-white">
              <HallList
                halls={halls}
                selectedHall={selectedHall}
                onSelectHall={handleSelectHall}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
              />
            </div>

            {/* Right Column: Detail Panel */}
            <div className="flex-1 bg-gray-50">
              <HallDetailPanel
                hall={selectedHall}
                onEdit={handleEditClick}
                onDelete={openDeleteConfirm}
                onToggleStatus={handleToggleStatus}
                isUpdating={isUpdating}
              />
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <HallForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingHall ? handleUpdateHall : handleCreateHall}
        hall={editingHall}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <HallDeleteConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setHallToDelete(null);
        }}
        onConfirm={handleDeleteHall}
        hall={hallToDelete}
        isLoading={isUpdating}
      />
    </div>
  );
}
