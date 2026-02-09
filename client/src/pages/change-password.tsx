import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff, ArrowLeft, Lock, ShieldCheck, KeyRound } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function ChangePasswordPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiRequest("POST", "/api/change-password", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erreur lors du changement de mot de passe");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Succes",
        description: "Votre mot de passe a ete modifie avec succes",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      navigate("/account");
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Mot de passe trop court",
        description: "Le nouveau mot de passe doit contenir au moins 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Mots de passe differents",
        description: "Les nouveaux mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <Link href="/account">
          <Button size="icon" variant="ghost" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold text-gray-800">Securite</h1>
        <div className="w-9" />
      </header>

      <div className="px-4 pt-4 pb-4">
        <div className="bg-gradient-to-r from-[#1565C0] to-[#1E88E5] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-base font-bold text-white">Changer le mot de passe</p>
              <p className="text-xs text-white/70 mt-0.5">Protegez votre compte avec un mot de passe fort</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 pb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-semibold text-gray-800">Mot de passe actuel</p>
          </div>
          <div className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 flex items-center gap-3">
            <KeyRound className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Entrez votre mot de passe actuel"
              className="flex-1 text-sm outline-none text-gray-700 bg-transparent"
              data-testid="input-current-password"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="text-gray-400 shrink-0"
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-semibold text-gray-800">Nouveau mot de passe</p>
          </div>

          <div className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 flex items-center gap-3">
            <KeyRound className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nouveau mot de passe"
              className="flex-1 text-sm outline-none text-gray-700 bg-transparent"
              data-testid="input-new-password"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="text-gray-400 shrink-0"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 flex items-center gap-3">
            <KeyRound className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmer le nouveau mot de passe"
              className="flex-1 text-sm outline-none text-gray-700 bg-transparent"
              data-testid="input-confirm-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 shrink-0"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {newPassword.length > 0 && (
            <div className="flex gap-1.5">
              <div className={`h-1 flex-1 rounded-full ${newPassword.length >= 2 ? "bg-[#2196F3]" : "bg-gray-200"}`} />
              <div className={`h-1 flex-1 rounded-full ${newPassword.length >= 4 ? "bg-[#2196F3]" : "bg-gray-200"}`} />
              <div className={`h-1 flex-1 rounded-full ${newPassword.length >= 6 ? "bg-[#2196F3]" : "bg-gray-200"}`} />
              <div className={`h-1 flex-1 rounded-full ${newPassword.length >= 8 ? "bg-[#2196F3]" : "bg-gray-200"}`} />
            </div>
          )}
        </div>

        <div className="bg-blue-50 rounded-xl p-4">
          <div className="space-y-1.5 text-xs text-gray-600">
            <p>Le mot de passe doit contenir au moins 6 caracteres.</p>
            <p>Utilisez un melange de lettres et de chiffres.</p>
            <p>Ne partagez jamais votre mot de passe.</p>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || !confirmPassword}
          className="w-full py-3.5 bg-[#2196F3] rounded-full text-base"
          data-testid="button-change-password-submit"
        >
          {changePasswordMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          Confirmer le changement
        </Button>
      </div>
    </div>
  );
}
