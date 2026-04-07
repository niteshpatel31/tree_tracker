import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Users, Trees, BarChart3, Plus, Edit, Trash2, Search, Loader2, FileText, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import {
  useListUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useListTrees,
  useCreateTree,
  useUpdateTreeStatus,
  useDeleteTree,
  useGetDashboardStats,
  useListReports,
  useUpdateReportAction,
  getListReportsQueryKey
} from "@/api";

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedTree, setSelectedTree] = useState<any>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isTreeDialogOpen, setIsTreeDialogOpen] = useState(false);

  // Form states
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "citizen",
    state: "",
    employeeId: "",
    department: "",
    designation: ""
  });

  const [treeForm, setTreeForm] = useState({
    state: "",
    stateCode: "",
    district: "",
    districtCode: "",
    latitude: "",
    longitude: "",
    species: "",
    plantedBy: "",
    photoUrl: "",
    notes: "",
    status: undefined as any,
    survivalStatus: undefined as any
  });

  // API hooks
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useListUsers();
  const { data: treesData, isLoading: treesLoading, refetch: refetchTrees } = useListTrees();
  const { data: statsData, isLoading: statsLoading } = useGetDashboardStats();

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const createTreeMutation = useCreateTree();
  const updateTreeMutation = useUpdateTreeStatus();
  const deleteTreeMutation = useDeleteTree();

  // Reports
  const queryClient = useQueryClient();
  const { data: reportsData, isLoading: reportsLoading, refetch: refetchReports } = useListReports();
  const updateReportActionMutation = useUpdateReportAction();
  const [reportFilter, setReportFilter] = useState<"all" | "pending" | "verified" | "rejected">("pending");

  const handleReportAction = async (reportId: number, status: "verified" | "rejected") => {
    try {
      await updateReportActionMutation.mutateAsync({ id: reportId, data: { status } });
      toast({
        title: status === "verified" ? "Report Verified" : "Report Rejected",
        description: status === "verified"
          ? "Report verified. Tree status has been updated automatically."
          : "Report has been rejected.",
      });
      refetchReports();
      queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to process report.",
        variant: "destructive"
      });
    }
  };

  // Check if user is admin or officer
  if (user?.role !== "officer") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  const users = usersData?.users || [];
  const trees = treesData?.trees || [];
  const stats = statsData || {
    totalTrees: 0,
    totalPlanted: 0,
    totalCut: 0,
    totalAtRisk: 0,
    totalStates: 0,
    totalReports: 0,
    carbonCreditsTotal: 0,
    survivalRate: 0
  };

  const handleCreateUser = async () => {
    try {
      await createUserMutation.mutateAsync({
        data: {
          name: userForm.name,
          email: userForm.email,
          password: userForm.password,
          role: userForm.role as "citizen" | "officer",
          state: userForm.state,
          ...(userForm.role === "officer" && {
            employeeId: userForm.employeeId,
            department: userForm.department,
            designation: userForm.designation
          })
        }
      });

      toast({
        title: "User Created",
        description: "New user has been created successfully.",
      });

      setIsUserDialogOpen(false);
      setUserForm({
        name: "",
        email: "",
        password: "",
        role: "citizen",
        state: "",
        employeeId: "",
        department: "",
        designation: ""
      });
      refetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to create user.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      await updateUserMutation.mutateAsync({
        id: selectedUser.id,
        data: {
          name: userForm.name,
          email: userForm.email,
          state: userForm.state,
          ...(selectedUser.type === "officer" && {
            employeeId: userForm.employeeId,
            department: userForm.department,
            designation: userForm.designation
          })
        }
      });

      toast({
        title: "User Updated",
        description: "User information has been updated successfully.",
      });

      setIsUserDialogOpen(false);
      setSelectedUser(null);
      refetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update user.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUserMutation.mutateAsync({ id: userId });

      toast({
        title: "User Deleted",
        description: "User has been deleted successfully.",
      });

      refetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete user.",
        variant: "destructive"
      });
    }
  };

  const handleCreateTree = async () => {
    try {
      await createTreeMutation.mutateAsync({
        data: {
          state: treeForm.state,
          stateCode: treeForm.stateCode,
          district: treeForm.district,
          districtCode: treeForm.districtCode,
          latitude: parseFloat(treeForm.latitude),
          longitude: parseFloat(treeForm.longitude),
          species: treeForm.species,
          plantedBy: treeForm.plantedBy,
          photoUrl: treeForm.photoUrl || undefined,
          notes: treeForm.notes || undefined
        }
      });

      toast({
        title: "Tree Created",
        description: "New tree has been registered successfully.",
      });

      setIsTreeDialogOpen(false);
      setTreeForm({
        state: "",
        stateCode: "",
        district: "",
        districtCode: "",
        latitude: "",
        longitude: "",
        species: "",
        plantedBy: "",
        photoUrl: "",
        notes: "",
        status: undefined as any,
        survivalStatus: undefined as any
      });
      refetchTrees();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to create tree.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTree = async () => {
    if (!selectedTree) return;

    try {
      await updateTreeMutation.mutateAsync({
        id: selectedTree.id,
        data: {
          status: treeForm.status || selectedTree.status,
          survivalStatus: treeForm.survivalStatus || selectedTree.survivalStatus,
          notes: treeForm.notes || selectedTree.notes
        }
      });

      toast({
        title: "Tree Updated",
        description: "Tree information has been updated successfully.",
      });

      setIsTreeDialogOpen(false);
      setSelectedTree(null);
      refetchTrees();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update tree.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTree = async (treeId: number) => {
    try {
      await deleteTreeMutation.mutateAsync({ id: treeId });

      toast({
        title: "Tree Deleted",
        description: "Tree has been deleted successfully.",
      });

      refetchTrees();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete tree.",
        variant: "destructive"
      });
    }
  };

  const openUserDialog = (user?: any) => {
    if (user) {
      setSelectedUser(user);
      setUserForm({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
        state: user.state,
        employeeId: user.employeeId || "",
        department: user.department || "",
        designation: user.designation || ""
      });
    } else {
      setSelectedUser(null);
      setUserForm({
        name: "",
        email: "",
        password: "",
        role: "citizen",
        state: "",
        employeeId: "",
        department: "",
        designation: ""
      });
    }
    setIsUserDialogOpen(true);
  };

  const openTreeDialog = (tree?: any) => {
    if (tree) {
      setSelectedTree(tree);
      setTreeForm({
        state: tree.state,
        stateCode: tree.stateCode,
        district: tree.district,
        districtCode: tree.districtCode,
        latitude: tree.latitude.toString(),
        longitude: tree.longitude.toString(),
        species: tree.species,
        plantedBy: tree.plantedBy,
        photoUrl: tree.photoUrl || "",
        notes: tree.notes || "",
        status: tree.status,
        survivalStatus: tree.survivalStatus
      });
    } else {
      setSelectedTree(null);
      setTreeForm({
        state: "",
        stateCode: "",
        district: "",
        districtCode: "",
        latitude: "",
        longitude: "",
        species: "",
        plantedBy: "",
        photoUrl: "",
        notes: "",
        status: undefined as any,
        survivalStatus: undefined as any
      });
    }
    setIsTreeDialogOpen(true);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTrees = trees.filter(tree =>
    tree.treeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tree.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tree.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Manage users, trees, and system analytics</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="trees" className="flex items-center gap-2">
            <Trees className="h-4 w-4" />
            Tree Management
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                  <p className="text-xs text-muted-foreground">Active users in system</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Trees</CardTitle>
                  <Trees className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTrees}</div>
                  <p className="text-xs text-muted-foreground">{stats.totalPlanted} planted</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Carbon Credits</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.carbonCreditsTotal.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">Total credits generated</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Survival Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.survivalRate}%</div>
                  <p className="text-xs text-muted-foreground">Tree survival rate</p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system activities and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New tree planted in California</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Forest officer verification completed</p>
                    <p className="text-xs text-muted-foreground">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Tree health check report submitted</p>
                    <p className="text-xs text-muted-foreground">6 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openUserDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{selectedUser ? "Edit User" : "Add New User"}</DialogTitle>
                  <DialogDescription>
                    {selectedUser ? "Update user information" : "Create a new user account"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="user-name" className="text-right">Name</Label>
                    <Input
                      id="user-name"
                      value={userForm.name}
                      onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="user-email" className="text-right">Email</Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                      className="col-span-3"
                    />
                  </div>
                  {!selectedUser && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="user-password" className="text-right">Password</Label>
                      <Input
                        id="user-password"
                        type="password"
                        value={userForm.password}
                        onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                        className="col-span-3"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="user-role" className="text-right">Role</Label>
                    <Select
                      value={userForm.role}
                      onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="citizen">Citizen</SelectItem>
                        <SelectItem value="officer">Forest Officer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="user-state" className="text-right">State</Label>
                    <Input
                      id="user-state"
                      value={userForm.state}
                      onChange={(e) => setUserForm(prev => ({ ...prev, state: e.target.value }))}
                      className="col-span-3"
                    />
                  </div>
                  {userForm.role === "officer" && (
                    <>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="employee-id" className="text-right">Employee ID</Label>
                        <Input
                          id="employee-id"
                          value={userForm.employeeId}
                          onChange={(e) => setUserForm(prev => ({ ...prev, employeeId: e.target.value }))}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="department" className="text-right">Department</Label>
                        <Input
                          id="department"
                          value={userForm.department}
                          onChange={(e) => setUserForm(prev => ({ ...prev, department: e.target.value }))}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="designation" className="text-right">Designation</Label>
                        <Input
                          id="designation"
                          value={userForm.designation}
                          onChange={(e) => setUserForm(prev => ({ ...prev, designation: e.target.value }))}
                          className="col-span-3"
                        />
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    onClick={selectedUser ? handleUpdateUser : handleCreateUser}
                    disabled={createUserMutation.isPending || updateUserMutation.isPending}
                  >
                    {(createUserMutation.isPending || updateUserMutation.isPending) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {selectedUser ? "Update" : "Create"} User
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage citizen and forest officer accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "default" : user.role === "officer" ? "secondary" : "outline"}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.state}</TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openUserDialog(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {user.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(user.id)}
                                    disabled={deleteUserMutation.isPending}
                                  >
                                    {deleteUserMutation.isPending && (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    )}
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trees" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Dialog open={isTreeDialogOpen} onOpenChange={setIsTreeDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openTreeDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tree
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{selectedTree ? "Edit Tree" : "Add New Tree"}</DialogTitle>
                  <DialogDescription>
                    {selectedTree ? "Update tree information" : "Register a new planted tree"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {!selectedTree && (
                    <>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="state-code" className="text-right">State Code</Label>
                        <Input
                          id="state-code"
                          value={treeForm.stateCode}
                          onChange={(e) => setTreeForm(prev => ({ ...prev, stateCode: e.target.value }))}
                          className="col-span-3"
                          placeholder="e.g., CG"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="district-code" className="text-right">District Code</Label>
                        <Input
                          id="district-code"
                          value={treeForm.districtCode}
                          onChange={(e) => setTreeForm(prev => ({ ...prev, districtCode: e.target.value }))}
                          className="col-span-3"
                          placeholder="e.g., RPR"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="latitude" className="text-right">Latitude</Label>
                        <Input
                          id="latitude"
                          type="number"
                          step="any"
                          value={treeForm.latitude}
                          onChange={(e) => setTreeForm(prev => ({ ...prev, latitude: e.target.value }))}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="longitude" className="text-right">Longitude</Label>
                        <Input
                          id="longitude"
                          type="number"
                          step="any"
                          value={treeForm.longitude}
                          onChange={(e) => setTreeForm(prev => ({ ...prev, longitude: e.target.value }))}
                          className="col-span-3"
                        />
                      </div>
                    </>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tree-species" className="text-right">Species</Label>
                    <Input
                      id="tree-species"
                      value={treeForm.species}
                      onChange={(e) => setTreeForm(prev => ({ ...prev, species: e.target.value }))}
                      className="col-span-3"
                    />
                  </div>
                  {selectedTree && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="tree-status" className="text-right">Status</Label>
                      <Select
                        value={treeForm.status || selectedTree.status}
                        onValueChange={(value) => setTreeForm(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planted">Planted</SelectItem>
                          <SelectItem value="at_risk">At Risk</SelectItem>
                          <SelectItem value="cut">Cut</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tree-state" className="text-right">State</Label>
                    <Input
                      id="tree-state"
                      value={treeForm.state}
                      onChange={(e) => setTreeForm(prev => ({ ...prev, state: e.target.value }))}
                      className="col-span-3"
                    />
                  </div>
                  {!selectedTree && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="planted-by" className="text-right">Planted By</Label>
                      <Input
                        id="planted-by"
                        value={treeForm.plantedBy}
                        onChange={(e) => setTreeForm(prev => ({ ...prev, plantedBy: e.target.value }))}
                        className="col-span-3"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="photo-url" className="text-right">Photo URL</Label>
                    <Input
                      id="photo-url"
                      value={treeForm.photoUrl}
                      onChange={(e) => setTreeForm(prev => ({ ...prev, photoUrl: e.target.value }))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tree-notes" className="text-right">Notes</Label>
                    <Input
                      id="tree-notes"
                      value={treeForm.notes}
                      onChange={(e) => setTreeForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={selectedTree ? handleUpdateTree : handleCreateTree}
                    disabled={createTreeMutation.isPending || updateTreeMutation.isPending}
                  >
                    {(createTreeMutation.isPending || updateTreeMutation.isPending) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {selectedTree ? "Update" : "Create"} Tree
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tree Management</CardTitle>
              <CardDescription>Manage tree records and plantation data</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tree Code</TableHead>
                    <TableHead>Species</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Planted By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {treesLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : filteredTrees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No trees found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTrees.map((tree) => (
                      <TableRow key={tree.id}>
                        <TableCell className="font-medium">{tree.treeCode}</TableCell>
                        <TableCell>{tree.species}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              tree.status === "planted" ? "default" :
                              tree.status === "at_risk" ? "destructive" : "secondary"
                            }
                          >
                            {tree.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{tree.state}</TableCell>
                        <TableCell>{tree.plantedBy}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openTreeDialog(tree)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Tree</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete tree {tree.treeCode}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteTree(tree.id)}
                                    disabled={deleteTreeMutation.isPending}
                                  >
                                    {deleteTreeMutation.isPending && (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    )}
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Management Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Reports Management
              </CardTitle>
              <CardDescription>Review and take action on citizen-submitted tree reports</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filter bar */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(["all", "pending", "verified", "rejected"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setReportFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize border transition-colors ${
                      reportFilter === f
                        ? "bg-primary text-white border-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {reportsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Tree Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(reportsData?.reports ?? []).filter(r => reportFilter === "all" || r.status === reportFilter).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No reports found
                        </TableCell>
                      </TableRow>
                    ) : (
                      (reportsData?.reports ?? []).filter(r => reportFilter === "all" || r.status === reportFilter).map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-mono text-xs">#{report.id}</TableCell>
                          <TableCell>
                            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                              {report.treeCode ?? "—"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs capitalize ${
                                report.reportType === "illegal_cutting" || report.reportType === "cutting"
                                  ? "border-red-300 text-red-700 bg-red-50"
                                  : report.reportType === "survival_check"
                                  ? "border-yellow-300 text-yellow-700 bg-yellow-50"
                                  : "border-green-300 text-green-700 bg-green-50"
                              }`}
                            >
                              {report.reportType.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{report.reportedBy}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {report.district}, {report.state}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs capitalize ${
                                report.status === "pending"
                                  ? "border-yellow-300 text-yellow-700 bg-yellow-50"
                                  : report.status === "verified"
                                  ? "border-green-300 text-green-700 bg-green-50"
                                  : "border-red-300 text-red-700 bg-red-50"
                              }`}
                            >
                              {report.status === "pending" && <AlertTriangle className="h-3 w-3 mr-1 inline" />}
                              {report.status === "verified" && <CheckCircle className="h-3 w-3 mr-1 inline" />}
                              {report.status === "rejected" && <XCircle className="h-3 w-3 mr-1 inline" />}
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(report.createdAt).toLocaleDateString("en-IN")}
                          </TableCell>
                          <TableCell className="text-right">
                            {report.status === "pending" ? (
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-700 border-green-300 hover:bg-green-50 text-xs h-7"
                                  onClick={() => handleReportAction(report.id, "verified")}
                                  disabled={updateReportActionMutation.isPending}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verify
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-700 border-red-300 hover:bg-red-50 text-xs h-7"
                                  onClick={() => handleReportAction(report.id, "rejected")}
                                  disabled={updateReportActionMutation.isPending}
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Actioned</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
