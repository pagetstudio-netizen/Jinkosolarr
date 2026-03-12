import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { ELIGIBLE_COUNTRIES } from "@/lib/countries";
import { CountrySelector } from "@/components/country-selector";
import { Loader2, Eye, EyeOff, Lock, QrCode, ChevronDown } from "lucide-react";
import wendysLogo from "@assets/wendys_logo.png";
import bgImage from "@assets/20260312_184552_1773341347211.jpg";

const registerSchema = z.object({
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  country: z.string().min(2, "Sélectionnez un pays"),
  password: z.string().min(6, "Au moins 6 caractères"),
  confirmPassword: z.string().min(1, "Confirmez le mot de passe"),
  invitationCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const { register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      toast({ title: "Inscription réussie !", description: "Bienvenue sur Wendy's !" });
      navigate("/");
    } catch (error: any) {
      toast({ title: "Erreur d'inscription", description: error.message || "Une erreur est survenue", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="relative z-10 flex flex-col flex-1 px-6 pt-10 pb-6 overflow-y-auto">

        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-18 h-18 rounded-full bg-white shadow-xl flex items-center justify-center overflow-hidden mb-2" style={{ width: 68, height: 68 }}>
            <img src={wendysLogo} alt="Wendy's" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-xl font-extrabold text-[#c8102e] drop-shadow-sm">Wendy's</h1>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">

          {/* Mobile */}
          <div>
            <p className="text-gray-700 font-semibold text-sm mb-2">Mobile</p>
            <div className="flex items-center bg-white border border-gray-200 rounded-2xl overflow-hidden h-14 shadow-sm">
              <button
                type="button"
                onClick={() => setCountryModalOpen(true)}
                className="flex items-center gap-1 pl-4 pr-3 h-full border-r border-gray-200 shrink-0"
                data-testid="button-select-country"
              >
                <span className="text-gray-700 font-bold text-base">
                  {countryData ? `+${countryData.phonePrefix}` : "+"}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              <input
                {...form.register("phone")}
                type="tel"
                placeholder="Mobile"
                className="flex-1 bg-transparent px-4 text-gray-800 placeholder:text-gray-400 text-base outline-none"
                data-testid="input-phone"
              />
            </div>
            {form.formState.errors.phone && (
              <p className="text-[#c8102e] text-xs mt-1 font-medium">{form.formState.errors.phone.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <p className="text-gray-700 font-semibold text-sm mb-2">Mot de passe</p>
            <div className="flex items-center bg-white border border-gray-200 rounded-2xl h-14 shadow-sm">
              <div className="pl-4 pr-3">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                {...form.register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                className="flex-1 bg-transparent text-gray-800 placeholder:text-gray-400 text-base outline-none"
                data-testid="input-password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="pr-4 pl-2" data-testid="button-toggle-password">
                {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-[#c8102e] text-xs mt-1 font-medium">{form.formState.errors.password.message}</p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <p className="text-gray-700 font-semibold text-sm mb-2">Confirmer le mot de passe</p>
            <div className="flex items-center bg-white border border-gray-200 rounded-2xl h-14 shadow-sm">
              <div className="pl-4 pr-3">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                {...form.register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmer le mot de passe"
                className="flex-1 bg-transparent text-gray-800 placeholder:text-gray-400 text-base outline-none"
                data-testid="input-confirm-password"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="pr-4 pl-2" data-testid="button-toggle-confirm-password">
                {showConfirmPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
              </button>
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="text-[#c8102e] text-xs mt-1 font-medium">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Invitation code */}
          <div>
            <p className="text-gray-700 font-semibold text-sm mb-2">Code d'invitation</p>
            <div className="flex items-center bg-white border border-gray-200 rounded-2xl h-14 shadow-sm">
              <div className="pl-4 pr-3">
                <QrCode className="w-5 h-5 text-gray-400" />
              </div>
              <input
                {...form.register("invitationCode")}
                placeholder="Code d'invitation (optionnel)"
                className="flex-1 bg-transparent text-gray-800 placeholder:text-gray-400 text-base outline-none"
                data-testid="input-invitation-code"
              />
            </div>
          </div>

          <input type="hidden" {...form.register("country")} />

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-full text-white font-bold text-lg shadow-lg disabled:opacity-50 mt-1"
            style={{ background: "linear-gradient(135deg, #c8102e, #a00d25)" }}
            data-testid="button-register"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Inscription...
              </span>
            ) : "Registre"}
          </button>

          {/* Link to login */}
          <div className="text-center pt-1 pb-4">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-[#c8102e] font-semibold text-base"
              data-testid="link-login"
            >
              Déjà un compte ? Se connecter maintenant
            </button>
          </div>
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
