import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useCountries } from "@/lib/countries";
import { CountrySelector } from "@/components/country-selector";
import ContactSheet from "@/components/contact-sheet";
import { Loader2, Eye, EyeOff, Smartphone, Lock, ChevronDown } from "lucide-react";
import serviceAgent from "@assets/service_p1_1775839314312.png";

const GREEN = "#007054";

const loginSchema = z.object({
  phone: z.string().min(8, "Numéro invalide"),
  country: z.string().min(2, "Sélectionnez un pays"),
  password: z.string().min(1, "Mot de passe requis"),
});

type LoginForm = z.infer<typeof loginSchema>;

function IconCircle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#e6f2ee", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {children}
    </div>
  );
}

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  useEffect(() => { document.title = "Connexion | State Grid"; }, []);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const saved = typeof window !== "undefined" ? localStorage.getItem("state_grid_credentials") : null;
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

  const { data: countries = [] } = useCountries();
  const selectedCountry = form.watch("country");
  const countryData = countries.find(c => c.code === selectedCountry);

  async function onSubmit(data: LoginForm) {
    setIsLoading(true);
    const cleanPhone = data.phone.replace(/\D/g, "");
    try {
      await login(cleanPhone, data.country, data.password.trim());
      if (rememberMe) {
        localStorage.setItem("state_grid_credentials", JSON.stringify({ phone: cleanPhone, country: data.country, password: data.password.trim() }));
      } else {
        localStorage.removeItem("state_grid_credentials");
      }
      navigate("/");
    } catch (e: any) {
      toast({ title: "Erreur de connexion", description: e.message || "Vérifiez vos informations", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const startRef = useRef({ mx: 0, my: 0, bx: 0, by: 0 });
  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true;
    startRef.current = { mx: e.clientX, my: e.clientY, bx: pos.x, by: pos.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    setPos({ x: startRef.current.bx + (e.clientX - startRef.current.mx), y: startRef.current.by + (e.clientY - startRef.current.my) });
  }
  function onPointerUp() { dragging.current = false; }

  return (
    <div style={{ minHeight: "100vh", background: "#111111", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

      {/* ── En-tête sombre avec vague ── */}
      <div style={{ padding: "56px 24px 44px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
        {/* Vague décorative */}
        <svg width="100%" height="60" viewBox="0 0 375 60" preserveAspectRatio="none"
          style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
          <path d="M0 30 C70 8, 140 52, 210 30 C280 8, 330 48, 375 28"
            stroke={GREEN} strokeWidth="2.5" fill="none" opacity="0.85" />
        </svg>

        <h1 style={{ color: "white", fontSize: 38, fontWeight: 800, margin: 0, letterSpacing: -0.5, textAlign: "center" }}>
          Connexion
        </h1>
      </div>

      {/* ── Zone formulaire ── */}
      <div style={{ flex: 1, background: "#f2f3f5", borderRadius: "24px 24px 0 0", padding: "28px 18px 40px", display: "flex", flexDirection: "column" }}>

        <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Numéro de téléphone */}
          <div style={{ background: "white", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <IconCircle><Smartphone size={20} color={GREEN} /></IconCircle>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 3px", fontWeight: 500 }}>Numéro de téléphone</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setCountryModalOpen(true)}
                  data-testid="button-select-country"
                  style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", color: "#374151", fontWeight: 700, fontSize: 14, flexShrink: 0, display: "flex", alignItems: "center", gap: 3 }}
                >
                  {countryData ? `+${countryData.phonePrefix}` : "+"}
                  <ChevronDown size={14} color="#9ca3af" />
                </button>
                <span style={{ color: "#d1d5db" }}>|</span>
                <input
                  {...form.register("phone")}
                  type="tel"
                  placeholder="Entrez votre numéro"
                  data-testid="input-phone"
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#111827", fontWeight: 500 }}
                />
              </div>
            </div>
          </div>
          {form.formState.errors.phone && (
            <p style={{ fontSize: 12, color: "#ef4444", margin: "-6px 4px 0" }}>{form.formState.errors.phone.message}</p>
          )}

          {/* Mot de passe */}
          <div style={{ background: "white", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <IconCircle><Lock size={20} color={GREEN} /></IconCircle>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 3px", fontWeight: 500 }}>Mot de passe</p>
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  {...form.register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Entrez votre mot de passe"
                  data-testid="input-password"
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#111827", fontWeight: 500 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, display: "flex", alignItems: "center" }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
          {form.formState.errors.password && (
            <p style={{ fontSize: 12, color: "#ef4444", margin: "-6px 4px 0" }}>{form.formState.errors.password.message}</p>
          )}

          <input type="hidden" {...form.register("country")} />

          {/* Se souvenir de moi */}
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none", padding: "2px 4px" }}>
            <div
              onClick={() => setRememberMe(!rememberMe)}
              style={{
                width: 20, height: 20, borderRadius: 6, border: `2px solid ${rememberMe ? GREEN : "#d1d5db"}`,
                background: rememberMe ? GREEN : "white", display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, cursor: "pointer"
              }}
            >
              {rememberMe && <span style={{ color: "white", fontSize: 12, fontWeight: 800, lineHeight: 1 }}>✓</span>}
            </div>
            <span style={{ fontSize: 13, color: "#6b7280" }}>Se souvenir de moi</span>
          </label>

          {/* Bouton Se connecter */}
          <button
            type="submit"
            disabled={isLoading}
            data-testid="button-login"
            style={{
              width: "100%", height: 54, borderRadius: 999, marginTop: 6,
              background: isLoading ? "#94a3b8" : GREEN,
              color: "white", fontWeight: 700, fontSize: 16, border: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: isLoading ? "none" : "0 4px 20px rgba(0,112,84,0.35)",
              touchAction: "manipulation",
            }}
          >
            {isLoading ? <><Loader2 size={20} className="animate-spin" /> Connexion...</> : "Se connecter"}
          </button>

        </form>

        {/* Lien inscription */}
        <p style={{ textAlign: "center", fontSize: 14, color: "#6b7280", marginTop: 24 }}>
          Pas encore membre ?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            data-testid="button-goto-register"
            style={{ background: "transparent", border: "none", color: GREEN, fontWeight: 700, fontSize: 14, cursor: "pointer", padding: 0 }}
          >
            S'inscrire
          </button>
        </p>

      </div>

      {/* Agent service flottant */}
      <button
        type="button"
        onClick={() => { if (!dragging.current) setShowContact(true); }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        data-testid="button-contact-agent"
        style={{ position: "fixed", bottom: 28 - pos.y, right: 20 - pos.x, width: 56, height: 56, borderRadius: "50%", overflow: "hidden", border: "3px solid white", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", background: "white", cursor: "grab", padding: 0, zIndex: 100, touchAction: "none" }}
      >
        <img src={serviceAgent} alt="Contact" style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
      </button>

      <CountrySelector
        open={countryModalOpen}
        onClose={() => setCountryModalOpen(false)}
        onSelect={(code) => form.setValue("country", code, { shouldValidate: true })}
      />
      <ContactSheet open={showContact} onClose={() => setShowContact(false)} />
    </div>
  );
}
