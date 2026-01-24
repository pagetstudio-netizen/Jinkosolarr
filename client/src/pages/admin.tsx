import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AdminDashboard from "@/components/admin/dashboard";
import AdminDeposits from "@/components/admin/deposits";
import AdminWithdrawals from "@/components/admin/withdrawals";
import AdminUsers from "@/components/admin/users";
import AdminProducts from "@/components/admin/products";
import AdminChannels from "@/components/admin/channels";
import AdminSettings from "@/components/admin/settings";

export default function AdminPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (!user?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-secondary px-4 py-4 flex items-center gap-4 sticky top-0 z-50">
        <Button size="icon" variant="ghost" onClick={() => navigate("/account")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-secondary-foreground">Administration</h1>
      </header>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto -mx-4 px-4">
            <TabsList className="w-max">
              <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
              <TabsTrigger value="deposits">Dépôts</TabsTrigger>
              <TabsTrigger value="withdrawals">Retraits</TabsTrigger>
              <TabsTrigger value="users">Utilisateurs</TabsTrigger>
              <TabsTrigger value="products">Produits</TabsTrigger>
              <TabsTrigger value="channels">Canaux</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="mt-4">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="deposits" className="mt-4">
            <AdminDeposits />
          </TabsContent>

          <TabsContent value="withdrawals" className="mt-4">
            <AdminWithdrawals />
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <AdminUsers isSuperAdmin={user.isSuperAdmin} />
          </TabsContent>

          <TabsContent value="products" className="mt-4">
            <AdminProducts />
          </TabsContent>

          <TabsContent value="channels" className="mt-4">
            <AdminChannels isSuperAdmin={user.isSuperAdmin} />
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <AdminSettings isSuperAdmin={user.isSuperAdmin} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
