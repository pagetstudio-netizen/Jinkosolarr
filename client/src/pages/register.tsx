import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { ELIGIBLE_COUNTRIES } from "@/lib/countries";
import { CountrySelector } from "@/components/country-selector";
import { Loader2, Eye, EyeOff, ChevronDown, QrCode } from "lucide-react";
import authBg from "@assets/auth_bg_solar.png";
import jinkoLogo from "@assets/jinko-solar-logo-png_seeklogo-265492_1775671142176.png";

const registerSchema = z.object({
  phone: z.string().min(8, "Numéro invalide"),
  country: z.string().min(2, "Sélectionnez un pays"),
  password: z.string().min(6, "Au moins 6 caractères"),
  confirmPassword: z.string().min(1, "Confirmez le mot de passe"),
  invitationCode: z.string().optional(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const INPUT_STYLE: React.CSSProperties = {
  background: "rgba(30,30,30,0.75)",
  border: "1px solid rgba(255,255,255,0.13)",
  borderRadius: 14,
  height: 52,
  color: "white",
  display: "flex",
  alignItems: "center",
  overflow: "hidden",
};

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const { register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [countryModalOpen, setCountryModalOpen] = useState(false);

  const params = new URLSearchParams(searchString);
  const refCode = params.get("money") || params.get("reg") || "";

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      phone: "",
      country: "CI",
      password: "",
      confirmPassword: "",
      invitationCode: refCode,
    },
  });

  const selectedCountry = form.watch("country");
  const countryData = ELIGIBLE_COUNTRIES.find(c => c.code === selectedCountry);

  async function onSubmit(data: RegisterForm) {
    setIsLoading(true);
    try {
      await register({
        fullName: `User_${data.phone}`,
        phone: data.phone,
        country: data.country,
        password: data.password,
        invitationCode: data.invitationCode,
      });
      toast({ title: "Inscription réussie !", description: "Bienvenue sur Jinko Solar !" });
      navigate("/");
    } catch (e: any) {
      toast({ title: "Erreur d'inscription", description: e.message || "Une erreur est survenue", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: `url(${authBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
      }}
    >
      {/* Dark overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.52)", zIndex: 0 }} />

      <div className="relative z-10 flex flex-col flex-1 px-6 pt-14 pb-10 overflow-y-auto">

        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden mb-4 shadow-xl backdrop-blur">
            <img src={jinkoLogo} alt="Jinko Solar" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-wide drop-shadow-lg">Jinko Solar</h1>
        </div>

        {/* Tab switcher */}
        <div
          className="flex rounded-full p-1 mb-6"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="flex-1 py-2.5 rounded-full font-semibold text-sm transition-all"
            style={{ color: "rgba(255,255,255,0.6)" }}
            data-testid="tab-login"
          >
            Se connecter
          </button>
          <button
            type="button"
            className="flex-1 py-2.5 rounded-full font-bold text-sm text-white transition-all"
            style={{ background: "rgba(0,0,0,0.85)" }}
            data-testid="tab-register"
          >
            S'inscrire
          </button>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3.5">

          {/* Phone */}
          <div>
            <div style={INPUT_STYLE}>
              <button
                type="button"
                onClick={() => setCountryModalOpen(true)}
                className="flex items-center gap-1 px-4 h-full shrink-0"
                style={{ borderRight: "1px solid rgba(255,255,255,0.1)" }}
                data-testid="button-select-country"
              >
                <span className="text-white font-bold text-sm">
                  {countryData ? `+${countryData.phonePrefix}` : "+"}
                </span>
                <ChevronDown className="w-4 h-4 text-white/60" />
              </button>
              <input
                {...form.register("phone")}
                type="tel"
                placeholder="Numéro de téléphone"
                className="flex-1 bg-transparent px-4 outline-none text-sm"
                style={{ color: "white" }}
                data-testid="input-phone"
              />
            </div>
            {form.formState.errors.phone && (
              <p className="text-xs mt-1 text-yellow-400">{form.formState.errors.phone.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div style={INPUT_STYLE}>
              <input
                {...form.register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Définir le mot de passe"
                className="flex-1 bg-transparent px-4 outline-none text-sm"
                style={{ color: "white" }}
                data-testid="input-password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="pr-4 pl-2" data-testid="button-toggle-password">
                {showPassword ? <EyeOff className="w-4 h-4 text-white/50" /> : <Eye className="w-4 h-4 text-white/50" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-xs mt-1 text-yellow-400">{form.formState.errors.password.message}</p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <div style={INPUT_STYLE}>
              <input
                {...form.register("confirmPassword")}
                type={showConfirm ? "text" : "password"}
                placeholder="Confirmer le mot de passe"
                className="flex-1 bg-transparent px-4 outline-none text-sm"
                style={{ color: "white" }}
                data-testid="input-confirm-password"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="pr-4 pl-2" data-testid="button-toggle-confirm">
                {showConfirm ? <EyeOff className="w-4 h-4 text-white/50" /> : <Eye className="w-4 h-4 text-white/50" />}
              </button>
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="text-xs mt-1 text-yellow-400">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Invitation code */}
          <div>
            <div style={INPUT_STYLE}>
              <div className="pl-4 pr-3 flex items-center">
                <QrCode className="w-4 h-4 text-white/40" />
              </div>
              <input
                {...form.register("invitationCode")}
                placeholder="Code d'invitation (optionnel)"
                className="flex-1 bg-transparent px-2 outline-none text-sm"
                style={{ color: "white" }}
                data-testid="input-invitation-code"
              />
            </div>
          </div>

          <input type="hidden" {...form.register("country")} />

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-full font-bold text-white text-base shadow-2xl disabled:opacity-50 mt-2"
            style={{ background: "rgba(0,0,0,0.88)", border: "1px solid rgba(255,255,255,0.15)" }}
            data-testid="button-register"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Inscription...
              </span>
            ) : "S'inscrire"}
          </button>

        </form>
      </div>

      <CountrySelector
        open={countryModalOpen}
        onClose={() => setCountryModalOpen(false)}
        onSelect={(code) => form.setValue("country", code, { shouldValidate: true })}
      />
    </div>
  );
}
