import { useState, useEffect, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useCountries } from "@/lib/countries";
import { CountrySelector } from "@/components/country-selector";
import ContactSheet from "@/components/contact-sheet";
import { Loader2, Eye, EyeOff, Smartphone, Lock, UserPlus } from "lucide-react";
import serviceAgent from "@assets/service_p1_1775839314312.png";

const GREEN = "#007054";

const registerSchema = z.object({
  phone: z.string().min(8, "Numéro invalide"),
  country: z.string().min(2, "Sélectionnez un pays"),
  password: z.string().min(6, "Au moins 6 caractères"),
  confirmPassword: z.string().min(1, "Confirmez le mot de passe"),
  invitationCode: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

function IconCircle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#e6f2ee", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {children}
    </div>
  );
}

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  useEffect(() => { document.title = "Inscription | State Grid"; }, []);
  const { register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const params = new URLSearchParams(searchString);
  const refCode = params.get("start") || params.get("money") || params.get("reg") || "";

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

  const { data: countries = [] } = useCountries();
  const selectedCountry = form.watch("country");
  const countryData = countries.find(c => c.code === selectedCountry);

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
      toast({ title: "Inscription réussie !", description: "Bienvenue sur State Grid !" });
      navigate("/");
    } catch (e: any) {
      toast({ title: "Erreur d'inscription", description: e.message || "Une erreur est survenue", variant: "destructive" });
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
          Inscription
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
                  style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", color: "#374151", fontWeight: 700, fontSize: 14, flexShrink: 0 }}
                >
                  {countryData ? `+${countryData.phonePrefix}` : "+"}
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
                  placeholder="Min. 6 caractères"
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

          {/* Confirmer le mot de passe */}
          <div style={{ background: "white", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <IconCircle><Lock size={20} color={GREEN} /></IconCircle>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 3px", fontWeight: 500 }}>Confirmer le mot de passe</p>
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  {...form.register("confirmPassword")}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Retapez votre mot de passe"
                  data-testid="input-confirm-password"
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#111827", fontWeight: 500 }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  data-testid="button-toggle-confirm"
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, display: "flex", alignItems: "center" }}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
          {form.formState.errors.confirmPassword && (
            <p style={{ fontSize: 12, color: "#ef4444", margin: "-6px 4px 0" }}>{form.formState.errors.confirmPassword.message}</p>
          )}

          {/* Code d'invitation */}
          <div style={{ background: "white", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <IconCircle><UserPlus size={20} color={GREEN} /></IconCircle>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 3px", fontWeight: 500 }}>Code d'invitation</p>
              <input
                {...form.register("invitationCode")}
                type="text"
                placeholder="Entrez votre code parrain"
                data-testid="input-invitation-code"
                style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#111827", fontWeight: 500 }}
              />
            </div>
          </div>

          <input type="hidden" {...form.register("country")} />

          {/* Bouton S'inscrire */}
          <button
            type="submit"
            disabled={isLoading}
            data-testid="button-register"
            style={{
              width: "100%", height: 54, borderRadius: 999, marginTop: 6,
              background: isLoading ? "#94a3b8" : GREEN,
              color: "white", fontWeight: 700, fontSize: 16, border: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: isLoading ? "none" : "0 4px 20px rgba(0,112,84,0.35)",
            }}
          >
            {isLoading ? <><Loader2 size={20} className="animate-spin" /> Inscription...</> : "S'inscrire"}
          </button>

        </form>

        {/* Lien connexion */}
        <p style={{ textAlign: "center", fontSize: 14, color: "#6b7280", marginTop: 24 }}>
          Déjà membre ?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            data-testid="button-goto-login"
            style={{ background: "transparent", border: "none", color: GREEN, fontWeight: 700, fontSize: 14, cursor: "pointer", padding: 0 }}
          >
            Se connecter
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
