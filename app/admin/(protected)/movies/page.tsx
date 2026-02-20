"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import MovieForm from "./_components/MovieForm";

interface Movie {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  releaseDate: string | null;
  duration: number | null;
  rating: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  language: string;
  status: string;
  genres: { id: string; name: string }[];
  _count: { showtimes: number };
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

const movieStatuses = [
  { value: "", label: "All Statuses" },
  { value: "ANNOUNCED", label: "Announced" },
  { value: "POST_PRODUCTION", label: "Post Production" },
  { value: "RELEASED", label: "Released" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);

  // Genre seeding state
  const [hasGenres, setHasGenres] = useState<boolean | null>(null);
  const [isSeedingGenres, setIsSeedingGenres] = useState(false);

  // Check if genres exist
  useEffect(() => {
    async function checkGenres() {
      try {
        const response = await fetch("/api/admin/seed/genres");
        if (response.ok) {
          const data = await response.json();
          setHasGenres(data.hasGenres);
        }
      } catch {
        console.error("Failed to check genres");
      }
    }
    checkGenres();
  }, []);

  // Seed genres function
  async function handleSeedGenres() {
    setIsSeedingGenres(true);
    try {
      const response = await fetch("/api/admin/seed/genres", {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok) {
        setHasGenres(true);
        alert(data.message);
      } else {
        alert(data.error || "Failed to seed genres");
      }
    } catch {
      alert("Failed to seed genres");
    } finally {
      setIsSeedingGenres(false);
    }
  }

  const fetchMovies = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
      });

      if (search) params.set("search", search);
      if (status) params.set("status", status);

      const response = await fetch(`/api/admin/movies?${params}`);
      const data = await response.json();

      if (response.ok) {
        setMovies(data.movies);
        setPagination(data.pagination);
      } else {
        setError(data.error || "Failed to fetch movies");
      }
    } catch {
      setError("Failed to fetch movies");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, search, status, sortBy, sortOrder]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  async function handleCreateMovie(formData: {
    title: string;
    slug: string;
    description: string;
    releaseDate: string;
    duration: string;
    rating: string;
    posterUrl: string;
    backdropUrl: string;
    language: string;
    status: string;
    genreIds: string[];
  }) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsFormOpen(false);
        fetchMovies();
      } else {
        alert(data.error || "Failed to create movie");
      }
    } catch {
      alert("Failed to create movie");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateMovie(formData: {
    title: string;
    slug: string;
    description: string;
    releaseDate: string;
    duration: string;
    rating: string;
    posterUrl: string;
    backdropUrl: string;
    language: string;
    status: string;
    genreIds: string[];
  }) {
    if (!editingMovie) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/movies/${editingMovie.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsFormOpen(false);
        setEditingMovie(null);
        fetchMovies();
      } else {
        alert(data.error || "Failed to update movie");
      }
    } catch {
      alert("Failed to update movie");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteMovie() {
    if (!movieToDelete) return;

    try {
      const response = await fetch(`/api/admin/movies/${movieToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setMovieToDelete(null);
        fetchMovies();
      } else {
        alert(data.error || "Failed to delete movie");
      }
    } catch {
      alert("Failed to delete movie");
    }
  }

  function handleEdit(movie: Movie) {
    setEditingMovie(movie);
    setIsFormOpen(true);
  }

  function handleAddNew() {
    setEditingMovie(null);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingMovie(null);
  }

  function getStatusBadgeColor(status: string) {
    switch (status) {
      case "RELEASED":
        return "bg-green-100 text-green-800";
      case "ANNOUNCED":
        return "bg-blue-100 text-blue-800";
      case "POST_PRODUCTION":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Movies Management</h1>
        <button
          onClick={handleAddNew}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Add Movie</span>
        </button>
      </div>

      {/* Seed Genres Banner */}
      {hasGenres === false && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">No Genres Found</h3>
              <p className="text-sm text-yellow-700 mt-1">
                You need to create genres before you can add movies. Click the button below to create 17 default genres (Action, Adventure, Comedy, Drama, etc.).
              </p>
              <button
                onClick={handleSeedGenres}
                disabled={isSeedingGenres}
                className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
              >
                {isSeedingGenres ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-700" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Genres...
                  </>
                ) : (
                  <>
                    <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Seed Default Genres
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {movieStatuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="createdAt">Created Date</option>
              <option value="title">Title</option>
              <option value="releaseDate">Release Date</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(e.target.value as "asc" | "desc")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Movies Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading movies...</div>
        ) : movies.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No movies found. Add your first movie!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Movie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Release Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Showtimes
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {movie.posterUrl && (
                          <Image
                            src={movie.posterUrl}
                            alt={movie.title}
                            width={32}
                            height={48}
                            className="object-cover rounded mr-3"
                            unoptimized
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {movie.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {movie.genres.map((g) => g.name).join(", ") ||
                              "No genres"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                          movie.status
                        )}`}
                      >
                        {movie.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movie.releaseDate
                        ? new Date(movie.releaseDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movie.duration ? `${movie.duration} min` : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movie.rating ? movie.rating : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link
                        href={`/admin/showtimes?movie=${movie.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {movie._count.showtimes} showtimes
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(movie)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setMovieToDelete(movie)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.totalCount
                )}
              </span>{" "}
              of <span className="font-medium">{pagination.totalCount}</span>{" "}
              movies
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  setPagination((p) => ({ ...p, page: p.page - 1 }))
                }
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPagination((p) => ({ ...p, page: p.page + 1 }))
                }
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Movie Form Modal */}
      <MovieForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingMovie ? handleUpdateMovie : handleCreateMovie}
        movie={editingMovie}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      {movieToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                Delete Movie
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete &quot;{movieToDelete.title}&quot;? This
                  action cannot be undone.
                </p>
                {movieToDelete._count.showtimes > 0 && (
                  <p className="text-sm text-red-600 mt-2">
                    Warning: This movie has {movieToDelete._count.showtimes}{" "}
                    showtimes. You must delete them first.
                  </p>
                )}
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handleDeleteMovie}
                  disabled={movieToDelete._count.showtimes > 0}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm"
                >
                  Delete
                </button>
                <button
                  onClick={() => setMovieToDelete(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
