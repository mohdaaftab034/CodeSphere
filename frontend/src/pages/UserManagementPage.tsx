import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Eye,
  Ban,
  Trash2,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Users as UsersIcon,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import AdminLayout from "../components/AdminLayout";
import { useQuery } from "../hooks/useQuery";
import { usersAPI } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

interface User {
  id: string;
  name: string;
  email: string;
  role: "User" | "Admin";
  status: "Active" | "Blocked";
  joinedDate: string;
  avatar?: string;
}

export default function UserManagementPage() {
  const websiteName = import.meta.env.VITE_WEBSITE_NAME
  const navigate = useNavigate()

  useEffect(() => {
    document.title = `Manage Users | ${websiteName}`
  }, [websiteName]);
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | "User" | "Admin">("All");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Blocked"
  >("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const usersPerPage = 8;

  useEffect(() => {
    // Check if admin is authenticated
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (!isAdmin) {
      navigate("/login");
    }
  }, [navigate]);

  const fetchUsers = useCallback(() => usersAPI.getAllAdmin(token || ""), [token]);
  const { data: usersResponse, isLoading, error, refetch } = useQuery(fetchUsers, {
    enabled: Boolean(token),
  });

  const allUsers = useMemo(() => {
    const list = usersResponse?.data || usersResponse?.users || [];
    return list.map((u: any) => ({
      id: u._id || u.id,
      name: u.name,
      email: u.email,
      role: (u.role === "admin" ? "Admin" : "User") as User["role"],
      status: (u.status === "blocked" ? "Blocked" : "Active") as User["status"],
      joinedDate: u.createdAt || u.joinedDate || "",
      avatar: u.avatar,
    }));
  }, [usersResponse]);

  useEffect(() => {
    setUsers(allUsers);
  }, [allUsers]);

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "All" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleBlockUnblock = (userId: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === "Active" ? "Blocked" : "Active" }
          : user,
      ),
    );
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    }
  };

  const handleViewProfile = (userId: string) => {
    alert(`View profile for user ID: ${userId}`);
    // Navigate to user profile page or show modal
  };

  const resetFilters = () => {
    setSearchQuery("");
    setRoleFilter("All");
    setStatusFilter("All");
    setCurrentPage(1);
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-background/95 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UsersIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  User Management
                </h1>
                <p className="text-sm text-muted-foreground">
                  {filteredUsers.length}{" "}
                  {filteredUsers.length === 1 ? "user" : "users"} found
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>

              {/* Filter Toggle */}
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="h-11 flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {(roleFilter !== "All" || statusFilter !== "All") && (
                  <Badge variant="default" className="ml-2 h-5 px-1.5">
                    {(roleFilter !== "All" ? 1 : 0) +
                      (statusFilter !== "All" ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-card border border-border rounded-xl space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Role Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Role
                    </label>
                    <div className="flex gap-2">
                      {["All", "User", "Admin"].map((role) => (
                        <button
                          key={role}
                          onClick={() => setRoleFilter(role as any)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            roleFilter === role
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Status
                    </label>
                    <div className="flex gap-2">
                      {["All", "Active", "Blocked"].map((status) => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status as any)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            statusFilter === status
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={resetFilters} variant="ghost" size="sm">
                    Reset Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : error ? (
              <div className="p-10 text-center">
                <p className="text-muted-foreground mb-4">Failed to load users.</p>
                <Button onClick={() => refetch()}>Retry</Button>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground mb-4">User not available.</p>
                <Button variant="outline" onClick={resetFilters} className="bg-transparent">
                  Reset filters
                </Button>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Joined Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-secondary/30 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {user.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              user.role === "Admin" ? "default" : "secondary"
                            }
                            className="font-medium"
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {user.status === "Active" ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                <span className="text-sm font-medium text-emerald-500">
                                  Active
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-destructive" />
                                <span className="text-sm font-medium text-destructive">
                                  Blocked
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-muted-foreground">
                            {new Date(user.joinedDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewProfile(user.id)}
                              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                              title="View Profile"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleBlockUnblock(user.id)}
                              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                              title={
                                user.status === "Active"
                                  ? "Block User"
                                  : "Unblock User"
                              }
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <p className="text-muted-foreground">No users found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            )}
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground text-center sm:text-left">
                  Showing {indexOfFirstUser + 1} to{" "}
                  {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                  {filteredUsers.length} users
                </p>

                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <Button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => {
                        // Show first page, last page, current page, and pages around current
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              size="sm"
                              className="h-9 w-9 p-0"
                            >
                              {page}
                            </Button>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span
                              key={page}
                              className="px-2 text-muted-foreground"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      },
                    )}
                  </div>

                  <Button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </AdminLayout>
  );
}
