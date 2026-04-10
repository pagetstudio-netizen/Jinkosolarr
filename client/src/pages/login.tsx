import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { ELIGIBLE_COUNTRIES } from "@/lib/countries";
import { CountrySelector } from "@/components/country-selector";
import ContactSheet from "@/components/contact-sheet";
import { Loader2, Eye, EyeOff, Phone, Lock } from "lucide-react";
import authBg from "@assets/auth_bg_solar.png";
import jinkoLogo from "@assets/jinko-solar-logo-png_seeklogo-265492_1775671142176.png";
import serviceAgent from "@assets/service_p1_1775839314312.png";

const GREEN = "#3db51d";

const loginSchema = z.object({
  phone: z.string().min(8, "Numéro invalide"),
  country: z.string().min(2, "Sélectionnez un pays"),
  password: z.string().min(1, "Mot de passe requis"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  useEffect(() => { document.title = "Connexion | Jinko Solar"; }, []);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const saved = typeof window !== "undefined" ? localStorage.getItem("jinko_credentials") : null;
  const parsed = saved ? JSON.parse(saved) : null;
  const [rememberMe, setRememberMe] = useState(!!parsed);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: parsed?.phone || "",
      country: parsed?.country || "CI",
      password: parsed?.password || "",
    },
  });

  const selectedCountry = form.watch("country");
  const countryData = ELIGIBLE_COUNTRIES.find(c => c.code === selectedCountry);

  async function onSubmit(data: LoginForm) {
    setIsLoading(true);
    const cleanPhone = data.phone.replace(/\D/g, "");
    try {
      await login(cleanPhone, data.country, data.password.trim());
      if (rememberMe) {
        localStorage.setItem("jinko_credentials", JSON.stringify({ phone: cleanPhone, country: data.country, password: data.password.trim() }));
      } else {
        localStorage.removeItem("jinko_credentials");
      }
      navigate("/");
    } catch (e: any) {
      toast({ title: "Erreur de connexion", description: e.message || "Vérifiez vos informations", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f3f4f6", maxWidth: 480, margin: "0 auto", position: "relative" }}>

      {/* ── Header banner ── */}
      <div style={{ position: "relative", height: "42vh", minHeight: 230, overflow: "hidden", flexShrink: 0 }}>
        <img
          src={authBg}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)" }} />

        {/* Brand logo + name */}
        <div style={{ position: "absolute", bottom: 24, left: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "white", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 2px 14px rgba(0,0,0,0.3)" }}>
            <img src={jinkoLogo} alt="Jinko Solar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <span style={{ color: "white", fontWeight: 800, fontSize: 22, letterSpacing: 0.3, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            Jinko Solar
          </span>
        </div>

        {/* Service agent floating photo (blurred) – opens contact popup */}
        <button
          type="button"
          onClick={() => setShowContact(true)}
          data-testid="button-contact-agent"
          style={{ position: "absolute", top: 18, right: 18, width: 54, height: 54, borderRadius: "50%", overflow: "hidden", border: "2.5px solid white", boxShadow: "0 4px 16px rgba(0,0,0,0.35)", background: "white", cursor: "pointer", padding: 0 }}
        >
          <img
            src={serviceAgent}
            alt="Nous contacter"
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(0.8px) brightness(1.05)" }}
          />
        </button>
      </div>

      {/* ── White form card ── */}
      <div style={{ flex: 1, background: "white", borderRadius: "28px 28px 0 0", marginTop: -26, padding: "30px 20px 40px", overflowY: "auto" }}>

        <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Phone */}
          <div>
            <div style={{ background: "#f9fafb", borderRadius: 14, height: 56, display: "flex", alignItems: "center", border: "1.5px solid #e5e7eb", overflow: "hidden" }}>
              <div style={{ paddingLeft: 14, paddingRight: 10, color: "#9ca3af", display: "flex", alignItems: "center" }}>
                <Phone size={18} />
              </div>
              <button
                type="button"
                onClick={() => setCountryModalOpen(true)}
                data-testid="button-select-country"
                style={{ fontSize: 14, fontWeight: 700, color: "#374151", paddingRight: 12, height: "100%", display: "flex", alignItems: "center", background: "transparent", border: "none", borderRight: "1.5px solid #e5e7eb", cursor: "pointer" }}
              >
                {countryData ? `+${countryData.phonePrefix}` : "+"}
              </button>
              <input
                {...form.register("phone")}
                type="tel"
                placeholder="Numéro de téléphone"
                data-testid="input-phone"
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", paddingLeft: 12, paddingRight: 12, fontSize: 14, color: "#111827" }}
              />
            </div>
            {form.formState.errors.phone && (
              <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{form.formState.errors.phone.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div style={{ background: "#f9fafb", borderRadius: 14, height: 56, display: "flex", alignItems: "center", border: "1.5px solid #e5e7eb", overflow: "hidden" }}>
              <div style={{ paddingLeft: 14, paddingRight: 10, color: "#9ca3af", display: "flex", alignItems: "center" }}>
                <Lock size={18} />
              </div>
              <input
                {...form.register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                data-testid="input-password"
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#111827" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="button-toggle-password"
                style={{ paddingRight: 14, paddingLeft: 8, color: "#9ca3af", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{form.formState.errors.password.message}</p>
            )}
          </div>

          <input type="hidden" {...form.register("country")} />

          {/* Remember + Forgot */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                data-testid="checkbox-remember"
                style={{ width: 16, height: 16, accentColor: GREEN }}
              />
              <span style={{ fontSize: 13, color: "#6b7280" }}>Souviens-toi</span>
            </label>
            <span style={{ fontSize: 13, color: "#6b7280" }}>Mot de passe oublié ?</span>
          </div>

          {/* Green submit */}
          <button
            type="submit"
            disabled={isLoading}
            data-testid="button-login"
            style={{ width: "100%", height: 52, borderRadius: 28, background: GREEN, color: "white", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", opacity: isLoading ? 0.72 : 1, marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 18px rgba(61,181,29,0.35)" }}
          >
            {isLoading ? <><Loader2 size={20} className="animate-spin" />Connexion...</> : "Se connecter"}
          </button>

          {/* Outlined register button */}
          <button
            type="button"
            onClick={() => navigate("/register")}
            data-testid="button-goto-register"
            style={{ width: "100%", height: 52, borderRadius: 28, background: "white", color: "#e53935", fontWeight: 700, fontSize: 16, border: "2px solid #e53935", cursor: "pointer" }}
          >
            S'inscrire
          </button>

        </form>
      </div>

      <CountrySelector
        open={countryModalOpen}
        onClose={() => setCountryModalOpen(false)}
        onSelect={(code) => form.setValue("country", code, { shouldValidate: true })}
      />
      <ContactSheet open={showContact} onClose={() => setShowContact(false)} />
    </div>
  );
}
