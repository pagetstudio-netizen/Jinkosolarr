import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, ArrowLeft, Lock, KeyRound, ShieldCheck } from "lucide-react";
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
    <div className="flex flex-col min-h-full bg-white">
      <header className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-[#64B5F6] to-white">
        <Link href="/account">
          <button className="p-2" data-testid="button-back">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        </Link>
        <h1 className="text-lg font-semibold text-gray-800">Mot de passe</h1>
        <div className="w-9" />
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 pb-24">
        <div className="flex justify-center mb-5">
          <div className="w-20 h-20 rounded-full bg-[#e3f2fd] flex items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-[#2196F3]" />
          </div>
        </div>

        <h2 className="text-center text-lg font-bold text-gray-800 mb-1">Modifier votre mot de passe</h2>
        <p className="text-center text-sm text-gray-500 mb-6">Protegez votre compte avec un mot de passe securise</p>

        <div className="space-y-4 max-w-sm mx-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe actuel</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Lock className="w-4 h-4 text-[#2196F3]" />
              </div>
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Entrez votre mot de passe actuel"
                className="w-full border border-gray-200 rounded-full pl-10 pr-10 py-3 text-sm outline-none focus:border-[#2196F3] bg-white"
                data-testid="input-current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nouveau mot de passe</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <KeyRound className="w-4 h-4 text-[#2196F3]" />
              </div>
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 caracteres"
                className="w-full border border-gray-200 rounded-full pl-10 pr-10 py-3 text-sm outline-none focus:border-[#2196F3] bg-white"
                data-testid="input-new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer le mot de passe</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <KeyRound className="w-4 h-4 text-[#2196F3]" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetez le nouveau mot de passe"
                className="w-full border border-gray-200 rounded-full pl-10 pr-10 py-3 text-sm outline-none focus:border-[#2196F3] bg-white"
                data-testid="input-confirm-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={changePasswordMutation.isPending}
            className="w-full py-3.5 bg-[#2196F3] text-white font-bold rounded-full disabled:opacity-40 text-base shadow-md shadow-blue-200 mt-2"
            data-testid="button-change-password-submit"
          >
            {changePasswordMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Modification...
              </span>
            ) : (
              "Modifier le mot de passe"
            )}
          </button>

          <div className="bg-[#e3f2fd] rounded-xl p-4 mt-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#2196F3] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Conseils de securite</p>
                <p className="text-xs text-gray-600 mt-1">Utilisez au moins 6 caracteres avec des lettres et des chiffres pour un mot de passe plus securise.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
