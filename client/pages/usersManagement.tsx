import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Dialog } from "@/components/Dialog";
import { createUserSchema,editUserSchema } from "../../validators/userSchemaValidators";
import { createUserApi, fetchUsersPaginated, updateUserApi, deleteUserApi } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Mail, Eye, Edit, Trash2, MoreVertical, Lock, User, Phone, } from 'lucide-react';

interface HRUser {
  id: number;
  name: string;
  email: string;
  role: "Manager" | "Recruiter" | "admin";
  createdAt: string;
}

export default function HRUsersManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userName] = useState(
    JSON.parse(localStorage.getItem("user") || "{}").name || "Admin"
  );
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ["users-paginated"],
    queryFn: () => fetchUsersPaginated({ pageParam: 1 })
  });

  const users = usersData?.data || [];

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    phone: string;
    role: "Recruiter" | "Manager" | "admin";
  }>({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "admin",
  });

  const [editFormData, setEditFormData] = useState<{
    id: number;
    name: string;
    email: string;
    phone: string;
    role: "Recruiter" | "Manager" | "admin";
  }>({
    id: 0,
    name: "",
    email: "",
    phone: "",
    role: "admin",
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const createUser = useMutation({
    mutationFn: createUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-paginated"] });
      setFormData({ name: "", email: "", password: "", phone: "", role: "admin" });
      setIsDialogOpen(false);
      toast({
        title: "User created successfully.",
        description: "New user has been added"
      })
    },
    onError: (error) => {
      setFormData({ name: "", email: "", password: "", phone: "", role: "admin" });
      setIsDialogOpen(false);
      toast({
        title: 'Error during user creation.',
        description: error.message,
        variant: "destructive"
      })
    }
  });

  const updateUser = useMutation({
    mutationFn: updateUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-paginated"] });
      setEditModalOpen(false);
      toast({
        title: "User updated successfully.",
        description: "User information has been updated"
      })
    },
    onError: (error) => {
      toast({
        title: 'Error during user update.',
        description: error.message,
        variant: "destructive"
      })
    }
  });

  const deleteUser = useMutation({
    mutationFn: deleteUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-paginated"] });
      setDeleteModalOpen(false);
      toast({
        title: "User deleted successfully.",
        description: "User has been removed"
      })
    },
    onError: (error) => {
      toast({
        title: 'Error during user deletion.',
        description: error.message,
        variant: "destructive"
      })
    }
  });

  const handleAddUser = async () => {
    const validate = await createUserSchema.safeParseAsync(formData)
    
    if (!validate.success) {
      toast({
        title: 'Error during user creation.',
        description: validate.error.errors[0].message,
        variant: "destructive"
      })
      return;
    }
    createUser.mutate(formData)
  };

  const handleUpdateUser = async () => {
    const validate = await editUserSchema.safeParseAsync(editFormData)
    console.log(validate);
    
    if (!validate.success) {
      toast({
        title: 'Error during user update.',
        description: validate.error.errors[0].message,
        variant: "destructive"
      })
      return;
    }
    updateUser.mutate(editFormData)
  };

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const confirmDeleteUser = () => {
    if (selectedUser) {
      console.log(selectedUser?.id);
      
      deleteUser.mutate(selectedUser.id);
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      Manager: "bg-blue-100 text-blue-800",
      Recruiter: "bg-purple-100 text-purple-800",
      admin: "bg-red-100 text-red-800",
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const handleEditUser = (user: any) => {
    setEditFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
    });
    setSelectedUser(user);
    setEditModalOpen(true);
  };
  return (
    <MainLayout
      userRole="admin"
      pageTitle="HR Users Management"
      userName={userName}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Users</h1>
            <p className="text-muted-foreground mt-1">
              Manage admin user members and their access
            </p>
          </div>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow"
          >
            <Plus size={20} />
            Add User
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-red-600">
                    Error loading users
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(user.createdAt || Date.now()).toISOString().split('T')[0]}</TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white focus:outline-none transition-colors">
                            <MoreVertical size={18} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewUser(user)}>
                            <Eye size={16} className="mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit size={16} className="mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteUser(user)} className="text-red-600">
                            <Trash2 size={16} className="mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Add User"
        description="Create a new user account"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
            <div className="relative">
              <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
            <div className="relative">
              <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddUser}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
            >
              Add User
            </button>
          </div>
        </div>
      </Dialog>

      {/* View User Dialog */}
      <Dialog
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="User Profile"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-card">
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="text-lg font-semibold text-foreground">{selectedUser.name}</p>
              </div>
              <div className="bg-white rounded-xl shadow-card">
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="text-lg font-semibold text-foreground">{selectedUser.role}</p>
              </div>

              <div className="bg-white rounded-xl shadow-card">
                <p className="text-sm text-muted-foreground">Email Address</p>
                <p className="text-lg font-semibold text-foreground">{selectedUser.email}</p>
              </div>
              <div className="bg-white rounded-xl shadow-card">
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="text-lg font-semibold text-foreground">{selectedUser.phone || "Not provided"}</p>
              </div>

              <div className="bg-white rounded-xl shadow-card">
                <p className="text-sm text-muted-foreground">Account Created</p>
                <p className="text-lg font-semibold text-foreground">{new Date(selectedUser.createdAt || Date.now()).toLocaleDateString()}</p>
              </div>


            </div>


          </div>
        )}
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit User"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
            <div className="relative">
              <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Enter full name"
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                placeholder="Enter email address"
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
            <div className="relative">
              <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="tel"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                placeholder="Enter phone number"
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Role</label>
            <select
              value={editFormData.role}
              onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as "Recruiter" | "Manager" | "admin" })}
              className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Recruiter">Recruiter</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setEditModalOpen(false)}
              className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateUser}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
            >
              Update User
            </button>
          </div>
        </div>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete User"
        size="sm"
      >
        {selectedUser && (
          <div className="space-y-4">
            <p>Are you sure you want to delete {selectedUser.name}?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </MainLayout>
  );
}