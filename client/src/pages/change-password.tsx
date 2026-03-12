import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, ChevronLeft, Lock, KeyRound, ShieldCheck, CheckCircle2 } from "lucide-react";
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
        title: "Succès",
        description: "Votre mot de passe a été modifié avec succès",
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
        description: "Le nouveau mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Mots de passe différents",
        description: "Les nouveaux mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const passwordStrength = newPassword.length === 0 ? 0
    : newPassword.length < 6 ? 1
    : newPassword.length < 10 ? 2
    : 3;

  const strengthLabel = ["", "Faible", "Moyen", "Fort"][passwordStrength];
  const strengthColor = ["", "#ef4444", "#f97316", "#22c55e"][passwordStrength];

  return (
    <div className="flex flex-col min-h-full bg-gray-50">

      {/* Red gradient header */}
      <div
        className="relative px-4 pt-12 pb-16"
        style={{ background: "linear-gradient(135deg, #c8102e, #a00d25)" }}
      >
        <Link href="/account">
          <button className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/20" data-testid="button-back">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        </Link>
        <h1 className="text-center text-white text-lg font-bold mt-1">Modifier le mot de passe</h1>

        {/* Shield icon floating */}
        <div className="flex justify-center mt-5">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-[#c8102e]" />
            </div>
          </div>
        </div>
      </div>

      {/* Card overlapping header */}
      <div className="flex-1 px-4 -mt-6 pb-24">
        <div className="bg-white rounded-2xl shadow-md p-5 space-y-4">

          <p className="text-center text-xs text-gray-400 mb-1">
            Protégez votre compte avec un mot de passe sécurisé
          </p>

          {/* Current password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Mot de passe actuel
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 text-[#c8102e]" />
              </div>
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Votre mot de passe actuel"
                className="w-full border border-gray-200 rounded-xl pl-12 pr-11 py-3.5 text-sm outline-none focus:border-[#c8102e] bg-gray-50 text-gray-800 transition-colors"
                data-testid="input-current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gray-100" />

          {/* New password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                <KeyRound className="w-3.5 h-3.5 text-[#c8102e]" />
              </div>
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                className="w-full border border-gray-200 rounded-xl pl-12 pr-11 py-3.5 text-sm outline-none focus:border-[#c8102e] bg-gray-50 text-gray-800 transition-colors"
                data-testid="input-new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength bar */}
            {newPassword.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: passwordStrength >= level ? strengthColor : "#e5e7eb",
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs font-medium" style={{ color: strengthColor }}>
                  Force : {strengthLabel}
                </p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                <KeyRound className="w-3.5 h-3.5 text-[#c8102e]" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Répétez le nouveau mot de passe"
                className="w-full border border-gray-200 rounded-xl pl-12 pr-11 py-3.5 text-sm outline-none focus:border-[#c8102e] bg-gray-50 text-gray-800 transition-colors"
                data-testid="input-confirm-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Match indicator */}
            {confirmPassword.length > 0 && (
              <div className="mt-2 flex items-center gap-1.5">
                <CheckCircle2
                  className="w-3.5 h-3.5"
                  style={{ color: newPassword === confirmPassword ? "#22c55e" : "#ef4444" }}
                />
                <p
                  className="text-xs font-medium"
                  style={{ color: newPassword === confirmPassword ? "#22c55e" : "#ef4444" }}
                >
                  {newPassword === confirmPassword ? "Les mots de passe correspondent" : "Les mots de passe ne correspondent pas"}
                </p>
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={changePasswordMutation.isPending}
            className="w-full py-4 rounded-xl text-white font-bold text-base disabled:opacity-40 shadow-md mt-2"
            style={{ background: "linear-gradient(135deg, #c8102e, #a00d25)" }}
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
        </div>

        {/* Security tips */}
        <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm border-l-4 border-[#c8102e]">
          <p className="text-sm font-bold text-[#c8102e] mb-2">Conseils de sécurité</p>
          <ul className="space-y-1.5 text-xs text-gray-500">
            <li className="flex items-start gap-2">
              <span className="text-[#c8102e] font-bold mt-0.5">•</span>
              Utilisez au moins 6 caractères avec des lettres et des chiffres.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#c8102e] font-bold mt-0.5">•</span>
              Évitez d'utiliser votre nom ou date de naissance.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#c8102e] font-bold mt-0.5">•</span>
              Ne partagez jamais votre mot de passe avec quelqu'un.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
