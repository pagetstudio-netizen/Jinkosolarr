import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/countries";
import { Search, Edit, Ban, Shield, Lock, Unlock, Star, Users, Loader2 } from "lucide-react";
import type { User, Product } from "@shared/schema";

interface UserWithTeam extends User {
  level1Count: number;
  level2Count: number;
  level3Count: number;
  totalCommission: number;
}

interface AdminUsersProps {
  isSuperAdmin: boolean;
}

export default function AdminUsers({ isSuperAdmin }: AdminUsersProps) {
  const { toast } = useToast();
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "banned" | "blocked" | "promoter">("all");
  const [selectedUser, setSelectedUser] = useState<UserWithTeam | null>(null);
  const [editBalance, setEditBalance] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");

  const { data: users, isLoading } = useQuery<UserWithTeam[]>({
    queryKey: ["/api/admin/users", statusFilter],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/admin/products/all"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ userId, action, value }: { userId: number; action: string; value?: any }) => {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/${action}`, { value });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Utilisateur mis à jour!" });
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const filteredUsers = users?.filter(u => 
    u.phone.includes(filter) || 
    u.fullName.toLowerCase().includes(filter.toLowerCase()) ||
    u.referralCode.toLowerCase().includes(filter.toLowerCase())
  ) || [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par téléphone, nom ou code..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {(["all", "banned", "blocked", "promoter"] as const).map((status) => (
          <Button
            key={status}
            size="sm"
            variant={statusFilter === status ? "default" : "outline"}
            onClick={() => setStatusFilter(status)}
          >
            {status === "all" ? "Tous" : status === "banned" ? "Bannis" : status === "blocked" ? "Retrait bloqué" : "Promoteurs"}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground">{user.fullName}</p>
                      {user.isAdmin && <Badge variant="destructive" className="text-xs">Admin</Badge>}
                      {user.isPromoter && <Badge className="text-xs">Promoteur</Badge>}
                      {user.isBanned && <Badge variant="destructive" className="text-xs">Banni</Badge>}
                      {user.isWithdrawalBlocked && <Badge variant="secondary" className="text-xs">Retrait bloqué</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.phone} - {user.country}</p>
                    <p className="text-xs text-muted-foreground">Code: {user.referralCode}</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => setSelectedUser(user)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Solde</p>
                    <p className="font-medium text-foreground">{formatCurrency(parseFloat(user.balance), user.country)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Équipe</p>
                    <p className="font-medium text-foreground">{user.level1Count + user.level2Count + user.level3Count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Commissions</p>
                    <p className="font-medium text-primary">{formatCurrency(user.totalCommission, user.country)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Aucun utilisateur trouvé
          </div>
        )}
      </div>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gérer {selectedUser?.fullName}</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="bg-secondary rounded-lg p-3">
                  <Users className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Niveau 1</p>
                  <p className="font-bold">{selectedUser.level1Count}</p>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <Users className="w-5 h-5 text-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Niveau 2</p>
                  <p className="font-bold">{selectedUser.level2Count}</p>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <Users className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Niveau 3</p>
                  <p className="font-bold">{selectedUser.level3Count}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Modifier le solde</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      value={editBalance}
                      onChange={(e) => setEditBalance(e.target.value)}
                      placeholder="Nouveau solde"
                    />
                    <Button
                      onClick={() => updateMutation.mutate({ userId: selectedUser.id, action: "balance", value: parseFloat(editBalance) })}
                      disabled={updateMutation.isPending || !editBalance}
                    >
                      {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "OK"}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Réinitialiser mot de passe</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nouveau mot de passe"
                    />
                    <Button
                      onClick={() => updateMutation.mutate({ userId: selectedUser.id, action: "password", value: newPassword })}
                      disabled={updateMutation.isPending || !newPassword}
                    >
                      {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "OK"}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Attribuer un produit</label>
                  <div className="flex gap-2 mt-1">
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Choisir un produit" />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.filter(p => !p.isFree).map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} - {product.price.toLocaleString()} F
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => updateMutation.mutate({ userId: selectedUser.id, action: "assign-product", value: parseInt(selectedProduct) })}
                      disabled={updateMutation.isPending || !selectedProduct}
                    >
                      {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "OK"}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={selectedUser.isBanned ? "default" : "destructive"}
                    onClick={() => updateMutation.mutate({ userId: selectedUser.id, action: "toggle-ban" })}
                    disabled={updateMutation.isPending}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    {selectedUser.isBanned ? "Débannir" : "Bannir"}
                  </Button>

                  <Button
                    variant={selectedUser.isWithdrawalBlocked ? "default" : "secondary"}
                    onClick={() => updateMutation.mutate({ userId: selectedUser.id, action: "toggle-withdrawal" })}
                    disabled={updateMutation.isPending}
                  >
                    {selectedUser.isWithdrawalBlocked ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                    {selectedUser.isWithdrawalBlocked ? "Débloquer" : "Bloquer retrait"}
                  </Button>

                  <Button
                    variant={selectedUser.isPromoter ? "secondary" : "outline"}
                    onClick={() => updateMutation.mutate({ userId: selectedUser.id, action: "toggle-promoter" })}
                    disabled={updateMutation.isPending}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    {selectedUser.isPromoter ? "Retirer promoteur" : "Promoteur"}
                  </Button>

                  <Button
                    variant={selectedUser.mustInviteToWithdraw ? "default" : "outline"}
                    onClick={() => updateMutation.mutate({ userId: selectedUser.id, action: "toggle-must-invite" })}
                    disabled={updateMutation.isPending}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {selectedUser.mustInviteToWithdraw ? "Désactiver" : "Doit inviter"}
                  </Button>

                  {isSuperAdmin && !selectedUser.isSuperAdmin && (
                    <Button
                      variant={selectedUser.isAdmin ? "secondary" : "outline"}
                      onClick={() => updateMutation.mutate({ userId: selectedUser.id, action: "toggle-admin" })}
                      disabled={updateMutation.isPending}
                      className="col-span-2"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      {selectedUser.isAdmin ? "Retirer admin" : "Nommer admin"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
