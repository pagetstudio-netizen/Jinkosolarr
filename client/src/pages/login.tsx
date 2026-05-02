import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { ELIGIBLE_COUNTRIES } from "@/lib/countries";
import { CountrySelector } from "@/components/country-selector";
import ContactSheet from "@/components/contact-sheet";
import { Loader2, Eye, EyeOff, Phone, Lock, ChevronDown } from "lucide-react";
import jinkoBanner from "@assets/20260408_191813_1775839627189.jpg";
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

  const selectedCountry = form.watch("country");
  const countryData = ELIGIBLE_COUNTRIES.find(c => c.code === selectedCountry);

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

  // Draggable service agent button
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
    setPos({
      x: startRef.current.bx + (e.clientX - startRef.current.mx),
      y: startRef.current.by + (e.clientY - startRef.current.my),
    });
  }
  function onPointerUp() {
    dragging.current = false;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#080d18", maxWidth: 480, margin: "0 auto", position: "relative", overflow: "hidden" }}>

      {/* Image absolue en arrière-plan */}
      <img
        src={jinkoBanner}
        alt="State Grid"
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "auto", display: "block", zIndex: 0 }}
      />

      {/* Contenu principal par-dessus (z-index 1) */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* Espaceur invisible calqué sur la hauteur de l'image */}
        <img
          src={jinkoBanner}
          alt=""
          aria-hidden="true"
          style={{ width: "100%", height: "auto", visibility: "hidden", display: "block", flexShrink: 0 }}
        />

        {/* Carte blanche formulaire */}
        <div style={{ flex: 1, background: "white", borderRadius: "16px 16px 0 0", marginTop: -14, padding: "28px 20px 20px" }}>

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
                  style={{ fontSize: 14, fontWeight: 700, color: "#374151", paddingRight: 10, height: "100%", display: "flex", alignItems: "center", gap: 2, background: "transparent", border: "none", borderRight: "1.5px solid #e5e7eb", cursor: "pointer" }}
                >
                  {countryData ? `+${countryData.phonePrefix}` : "+"}
                  <ChevronDown size={14} style={{ color: "#9ca3af" }} />
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

            {/* Remember */}
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

            {/* Bouton Se connecter */}
            <button
              type="submit"
              disabled={isLoading}
              data-testid="button-login"
              style={{ width: "100%", height: 52, borderRadius: 28, background: GREEN, color: "white", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", opacity: isLoading ? 0.72 : 1, marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 18px rgba(61,181,29,0.35)" }}
            >
              {isLoading ? <><Loader2 size={20} className="animate-spin" />Connexion...</> : "Se connecter"}
            </button>

            {/* Bouton S'inscrire outline */}
            <button
              type="button"
              onClick={() => navigate("/register")}
              data-testid="button-goto-register"
              style={{ width: "100%", height: 52, borderRadius: 28, background: "white", color: "#e53935", fontWeight: 700, fontSize: 16, border: "2px solid #e53935", cursor: "pointer" }}
            >
              Autoriser
            </button>

          </form>

          <div style={{ height: 80 }} />
        </div>
      </div>

      {/* Bouton service agent déplaçable – bas droite */}
      <button
        type="button"
        onClick={() => { if (!dragging.current) setShowContact(true); }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        data-testid="button-contact-agent"
        style={{ position: "fixed", bottom: 28 - pos.y, right: 20 - pos.x, width: 58, height: 58, borderRadius: "50%", overflow: "hidden", border: "3px solid white", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", background: "white", cursor: "grab", padding: 0, zIndex: 100, touchAction: "none" }}
      >
        <img
          src={serviceAgent}
          alt="Nous contacter"
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(0.6px) brightness(1.05)", pointerEvents: "none" }}
        />
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
