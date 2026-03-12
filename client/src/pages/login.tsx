import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { ELIGIBLE_COUNTRIES } from "@/lib/countries";
import { CountrySelector } from "@/components/country-selector";
import { Loader2, Eye, EyeOff, Lock, ChevronDown } from "lucide-react";
import wendysLogo from "@assets/wendys_logo.png";
import bgImage from "@assets/20260312_184552_1773341347211.jpg";

const loginSchema = z.object({
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  country: z.string().min(2, "Sélectionnez un pays"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [countryModalOpen, setCountryModalOpen] = useState(false);

  const savedCredentials = typeof window !== "undefined" ? localStorage.getItem("wendys_credentials") : null;
  const parsedCredentials = savedCredentials ? JSON.parse(savedCredentials) : null;
  const [rememberMe, setRememberMe] = useState(!!parsedCredentials);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: parsedCredentials?.phone || "",
      country: parsedCredentials?.country || "CI",
      password: parsedCredentials?.password || "",
    },
  });

  const selectedCountry = form.watch("country");
  const countryData = ELIGIBLE_COUNTRIES.find(c => c.code === selectedCountry);

  async function onSubmit(data: LoginForm) {
    setIsLoading(true);
    try {
      await login(data.phone, data.country, data.password);
      if (rememberMe) {
        localStorage.setItem("wendys_credentials", JSON.stringify({ phone: data.phone, country: data.country, password: data.password }));
      } else {
        localStorage.removeItem("wendys_credentials");
      }
      navigate("/");
    } catch (error: any) {
      toast({ title: "Erreur de connexion", description: error.message || "Vérifiez vos informations", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {/* Soft overlay for readability */}
      <div className="absolute inset-0 bg-white/30" />

      <div className="relative z-10 flex flex-col flex-1 px-6 pt-14 pb-8">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden mb-3">
            <img src={wendysLogo} alt="Wendy's" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-white drop-shadow-md">Wendy's</h1>
          <p className="text-white/90 text-xs mt-0.5 drop-shadow">Fast Food, Smart Investment</p>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col gap-5">

          {/* Mobile field */}
          <div>
            <p className="text-white font-semibold text-sm mb-2 drop-shadow">Mobile</p>
            <div className="flex items-center bg-white/25 backdrop-blur-sm border border-white/40 rounded-2xl overflow-hidden h-14">
              <button
                type="button"
                onClick={() => setCountryModalOpen(true)}
                className="flex items-center gap-1 pl-4 pr-3 h-full border-r border-white/30 shrink-0"
                data-testid="button-select-country"
              >
                <span className="text-white font-bold text-base">
                  {countryData ? `+${countryData.phonePrefix}` : "+"}
                </span>
                <ChevronDown className="w-4 h-4 text-white/80" />
              </button>
              <input
                {...form.register("phone")}
                type="tel"
                placeholder="Mobile"
                className="flex-1 bg-transparent px-4 text-white placeholder:text-white/60 text-base outline-none"
                data-testid="input-phone"
              />
            </div>
            {form.formState.errors.phone && (
              <p className="text-white text-xs mt-1 drop-shadow">{form.formState.errors.phone.message}</p>
            )}
          </div>

          {/* Password field */}
          <div>
            <p className="text-white font-semibold text-sm mb-2 drop-shadow">Mot de passe</p>
            <div className="flex items-center bg-white/25 backdrop-blur-sm border border-white/40 rounded-2xl h-14">
              <div className="pl-4 pr-3">
                <Lock className="w-5 h-5 text-white/80" />
              </div>
              <input
                {...form.register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                className="flex-1 bg-transparent text-white placeholder:text-white/60 text-base outline-none"
                data-testid="input-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="pr-4 pl-2"
                data-testid="button-toggle-password"
              >
                {showPassword ? <EyeOff className="w-5 h-5 text-white/80" /> : <Eye className="w-5 h-5 text-white/80" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-white text-xs mt-1 drop-shadow">{form.formState.errors.password.message}</p>
            )}
          </div>

          <input type="hidden" {...form.register("country")} />

          {/* Remember me */}
          <div className="flex items-center justify-between -mt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-[#c8102e]"
                data-testid="checkbox-remember"
              />
              <span className="text-white text-sm drop-shadow">Se souvenir</span>
            </label>
            <button type="button" className="text-white text-sm font-medium drop-shadow">
              Mot de passe oublié ?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-full text-white font-bold text-lg shadow-lg disabled:opacity-50 mt-1"
            style={{ background: "linear-gradient(135deg, #c8102e, #a00d25)" }}
            data-testid="button-login"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Connexion...
              </span>
            ) : "Connexion"}
          </button>

          {/* Link to register */}
          <div className="text-center mt-auto pt-4">
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-white font-semibold text-base drop-shadow"
              data-testid="link-register"
            >
              S'inscrire
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
