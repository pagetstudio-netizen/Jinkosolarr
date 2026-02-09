import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Image, Loader2, GripVertical, Eye, EyeOff } from "lucide-react";

interface BannerImage {
  id: number;
  imageData: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminBanners() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: banners = [], isLoading } = useQuery<BannerImage[]>({
    queryKey: ["/api/admin/banners"],
  });

  const createMutation = useMutation({
    mutationFn: async (imageData: string) => {
      return apiRequest("POST", "/api/admin/banners", { imageData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      toast({ title: "Banniere ajoutee" });
    },
    onError: (err: any) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest("PATCH", `/api/admin/banners/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/banners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      toast({ title: "Banniere supprimee" });
    },
    onError: (err: any) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });

  const replaceMutation = useMutation({
    mutationFn: async ({ id, imageData }: { id: number; imageData: string }) => {
      return apiRequest("PATCH", `/api/admin/banners/${id}`, { imageData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      toast({ title: "Image remplacee" });
    },
    onError: (err: any) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });

  const handleFileSelect = (callback: (base64: string) => void) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Erreur", description: "L'image ne doit pas depasser 5 Mo", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleAddBanner = () => {
    handleFileSelect((base64) => {
      setUploading(true);
      createMutation.mutate(base64, {
        onSettled: () => setUploading(false),
      });
    });
  };

  const handleReplace = (id: number) => {
    handleFileSelect((base64) => {
      replaceMutation.mutate({ id, imageData: base64 });
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold" data-testid="text-banners-title">Bannieres du carrousel</h2>
          <p className="text-sm text-muted-foreground">
            {banners.length} image{banners.length > 1 ? "s" : ""} — {banners.length <= 1 ? "Le defilement est desactive avec une seule image" : "Defilement automatique actif"}
          </p>
        </div>
        <Button onClick={handleAddBanner} disabled={uploading || createMutation.isPending} data-testid="button-add-banner">
          {uploading || createMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          Ajouter
        </Button>
      </div>

      {banners.length === 0 && (
        <Card className="p-8 text-center">
          <Image className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Aucune banniere. Ajoutez-en une pour commencer.</p>
        </Card>
      )}

      <div className="grid gap-3">
        {banners.map((banner, index) => (
          <Card key={banner.id} className="overflow-hidden" data-testid={`card-banner-${banner.id}`}>
            <div className="flex items-start gap-3 p-3">
              <div className="flex items-center gap-2 pt-2 shrink-0">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-mono w-5 text-center">{index + 1}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="rounded-lg overflow-hidden border border-border">
                  <img
                    src={banner.imageData}
                    alt={`Banniere ${index + 1}`}
                    className={`w-full h-32 object-cover ${!banner.isActive ? "opacity-40 grayscale" : ""}`}
                    data-testid={`img-banner-${banner.id}`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0 pt-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => toggleMutation.mutate({ id: banner.id, isActive: !banner.isActive })}
                  title={banner.isActive ? "Desactiver" : "Activer"}
                  data-testid={`button-toggle-banner-${banner.id}`}
                >
                  {banner.isActive ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleReplace(banner.id)}
                  disabled={replaceMutation.isPending}
                  title="Remplacer l'image"
                  data-testid={`button-replace-banner-${banner.id}`}
                >
                  <Image className="w-4 h-4 text-blue-600" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    if (banners.length <= 1) {
                      toast({ title: "Impossible", description: "Il doit rester au moins une banniere", variant: "destructive" });
                      return;
                    }
                    deleteMutation.mutate(banner.id);
                  }}
                  disabled={deleteMutation.isPending || banners.length <= 1}
                  title="Supprimer"
                  data-testid={`button-delete-banner-${banner.id}`}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
