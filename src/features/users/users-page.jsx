import { useDeferredValue, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  UserRoundCheck,
  Users,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usersApi } from "./api";
import { UserDialog } from "./user-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";
import { useAuth } from "@/features/auth/auth-provider";

const initials = (user) =>
  `${user.first_name[0] || ""}${user.last_name[0] || ""}`;
const formatDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState({ open: false, user: null });
  const [resetUser, setResetUser] = useState(null);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["users", page, deferredSearch],
    queryFn: () => usersApi.list(page, 20, deferredSearch),
  });
  const users = data?.items || [];
  const total = data?.total || 0;
  useEffect(() => {
    setPage(1);
  }, [deferredSearch]);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["users"] });
  const save = useMutation({
    mutationFn: (payload) =>
      editor.user
        ? usersApi.update(editor.user.id, payload)
        : usersApi.create(payload),
    onSuccess: () => {
      toast.success(
        editor.user ? "User updated successfully" : "User added successfully"
      );
      setEditor({ open: false, user: null });
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });
  const deactivate = useMutation({
    mutationFn: usersApi.deactivate,
    onSuccess: () => {
      toast.success("Account deactivated");
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });
  const reset = useMutation({
    mutationFn: (password) => usersApi.resetPassword(resetUser.id, password),
    onSuccess: () => {
      toast.success("Password changed successfully");
      setResetUser(null);
    },
    onError: (error) => toast.error(error.message),
  });
  const activeCount = users.filter((user) => user.is_active).length;
  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow-text">Access management</p>
          <h1>Users</h1>
          <p>Manage your team’s accounts and roles in one place.</p>
        </div>
        <Button size="lg" onClick={() => setEditor({ open: true, user: null })}>
          <Plus />
          Add user
        </Button>
      </div>
      <section className="stats-grid">
        <div className="stat-card">
          <span>
            <Users />
          </span>
          <div>
            <p>Total users</p>
            <strong>{total}</strong>
          </div>
        </div>
        <div className="stat-card">
          <span className="clay">
            <UserRoundCheck />
          </span>
          <div>
            <p>Active on this page</p>
            <strong>{activeCount}</strong>
          </div>
        </div>
        <div className="stat-card">
          <span className="amber">
            <ShieldCheck />
          </span>
          <div>
            <p>Roles on this page</p>
            <strong>
              {
                new Set(
                  users.flatMap((user) => user.roles.map((role) => role.id))
                ).size
              }
            </strong>
          </div>
        </div>
      </section>
      <section className="data-card">
        <div className="table-toolbar">
          <div>
            <h2>User directory</h2>
            <p>{total} users in the list</p>
          </div>
          <div className="search-box">
            <Search />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        {isLoading ? (
          <div className="table-state">
            <div className="loader" />
            <p>Loading users...</p>
          </div>
        ) : isError ? (
          <div className="table-state">
            <AlertTriangle />
            <h3>Unable to load data</h3>
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : users.length === 0 ? (
          <div className="table-state">
            <Users />
            <h3>No matching users</h3>
            <p>Change your search or add a new user.</p>
          </div>
        ) : (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Date added</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <Avatar>
                            <AvatarFallback>{initials(user)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <strong>
                              {user.first_name} {user.last_name}
                            </strong>
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="username">@{user.username}</span>
                      </td>
                      <td>
                        <div className="role-list">
                          {user.roles.length ? (
                            user.roles.map((role) => (
                              <Badge
                                key={role.id}
                                className={
                                  role.is_active
                                    ? ""
                                    : "opacity-60 line-through"
                                }
                              >
                                {role.name}
                                {!role.is_active && " (inactive)"}
                              </Badge>
                            ))
                          ) : (
                            <span className="muted">No role</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`status ${
                            user.is_active ? "active" : "inactive"
                          }`}
                        >
                          <i />
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="muted">{formatDate(user.created_at)}</td>
                      <td>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onSelect={() => setEditor({ open: true, user })}
                            >
                              <Pencil />
                              Edit user
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => setResetUser(user)}
                            >
                              <KeyRound />
                              Reset password
                            </DropdownMenuItem>
                            {user.is_active && user.id !== currentUser.id && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onSelect={() => {
                                    if (
                                      window.confirm(
                                        `Deactivate ${user.first_name}’s account?`
                                      )
                                    )
                                      deactivate.mutate(user.id);
                                  }}
                                >
                                  <UserX />
                                  Deactivate account
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-pagination">
              <span>
                Page {page} of {Math.max(1, Math.ceil(total / 20))}
              </span>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((value) => value - 1)}
                >
                  <ChevronLeft />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page * 20 >= total}
                  onClick={() => setPage((value) => value + 1)}
                >
                  Next
                  <ChevronRight />
                </Button>
              </div>
            </div>
          </>
        )}
      </section>
      <UserDialog
        open={editor.open}
        onOpenChange={(open) =>
          setEditor({ open, user: open ? editor.user : null })
        }
        user={editor.user}
        onSave={(payload) => save.mutate(payload)}
        loading={save.isPending}
      />
      <ResetPasswordDialog
        user={resetUser}
        onClose={() => setResetUser(null)}
        onReset={(password) => reset.mutate(password)}
        loading={reset.isPending}
      />
    </div>
  );
}
