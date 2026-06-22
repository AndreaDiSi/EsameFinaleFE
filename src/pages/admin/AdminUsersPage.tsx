import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Search, Edit, Trash2, Shield, UserIcon } from "lucide-react"

import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"
import { formatDate } from "@/lib/auth"
import { userEditSchema, type UserEditFormData } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { User } from "@/types"

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export function AdminUsersPage() {
  const { user: currentUser, updateCurrentUser } = useAuth()
  const [users, setUsers] = React.useState<User[]>([])
  const [search, setSearch] = React.useState("")
  const [editingUser, setEditingUser] = React.useState<User | null>(null)
  const [toDelete, setToDelete] = React.useState<User | null>(null)

  async function load() {
    const u = await api.getUsers()
    setUsers(u)
  }

  React.useEffect(() => { load() }, [])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset: resetForm,
  } = useForm<UserEditFormData>({ resolver: zodResolver(userEditSchema) })

  function openEdit(user: User) {
    setEditingUser(user)
    resetForm({ name: user.name, email: user.email, role: user.role })
  }

  async function onSubmitEdit(data: UserEditFormData) {
    if (!editingUser) return
    const updated = await api.updateUser(editingUser.id, { name: data.name, email: data.email, role: data.role })
    if (currentUser?.id === editingUser.id) updateCurrentUser(updated)
    setEditingUser(null)
    load()
  }

  async function handleDelete(user: User) {
    if (user.id === currentUser?.id) return
    await api.deleteUser(user.id)
    setToDelete(null)
    load()
  }

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Gestione utenti</h1>
        <p className="text-sm text-muted-foreground">{users.length} utenti registrati</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input placeholder="Cerca utente…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utente</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ruolo</TableHead>
              <TableHead>Registrato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {user.name}
                      {user.id === currentUser?.id && (
                        <span className="ml-1.5 text-xs text-muted-foreground">(tu)</span>
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "info" : "outline"} className="gap-1">
                    {user.role === "admin" ? <Shield className="size-3" /> : <UserIcon className="size-3" />}
                    {user.role === "admin" ? "Admin" : "Utente"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{formatDate(user.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(user)}>
                      <Edit className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={user.id === currentUser?.id}
                      onClick={() => setToDelete(user)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica utente</DialogTitle>
            <DialogDescription>Aggiorna le informazioni dell'utente</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitEdit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Nome</Label>
              <Input {...register("name")} aria-invalid={!!errors.name} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Email</Label>
              <Input {...register("email")} type="email" aria-invalid={!!errors.email} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Ruolo</Label>
              <Select value={watch("role")} onValueChange={(v) => setValue("role", v as "admin" | "user")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Utente</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setEditingUser(null)}>Annulla</Button>
              <Button type="submit" disabled={isSubmitting}>Salva modifiche</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Elimina utente</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare <strong>{toDelete?.name}</strong>? Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>Annulla</Button>
            <Button variant="destructive" onClick={() => toDelete && handleDelete(toDelete)}>Elimina</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
