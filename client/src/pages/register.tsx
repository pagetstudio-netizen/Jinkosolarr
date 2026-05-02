import { useState, useEffect, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { ELIGIBLE_COUNTRIES } from "@/lib/countries";
import { CountrySelector } from "@/components/country-selector";
import ContactSheet from "@/components/contact-sheet";
import { Loader2, Eye, EyeOff, ChevronDown, Sun, Zap, ShieldCheck, Gift } from "lucide-react";
import solarBg from "@assets/auth_bg_solar.png";
import serviceAgent from "@assets/service_p1_1775839314312.png";

const GREEN = "#007054";
const GREEN_LIGHT = "#00a878";

const registerSchema = z.object({
  phone: z.string().min(8, "Numéro invalide"),
  country: z.string().min(2, "Sélectionnez un pays"),
  password: z.string().min(6, "Au moins 6 caractères"),
  invitationCode: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  useEffect(() => { document.title = "Inscription | State Grid"; }, []);
  const { register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <div style={{ minHeight: "100vh", background: "#071510", maxWidth: 480, margin: "0 auto", position: "relative", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── Hero top ───────────────────────────────────── */}
      <div style={{ position: "relative", height: 260, flexShrink: 0, overflow: "hidden" }}>
        <img
          src={solarBg}
          alt="State Grid Solar"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(7,21,16,0.1) 0%, rgba(7,21,16,0.55) 70%, #071510 100%)" }} />

        <div style={{ position: "absolute", bottom: 22, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_LIGHT} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,160,120,0.5)" }}>
              <Sun size={22} color="white" />
            </div>
            <div>
              <p style={{ color: "white", fontWeight: 800, fontSize: 22, margin: 0, letterSpacing: 0.4, lineHeight: 1 }}>State Grid</p>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, margin: 0, letterSpacing: 1, textTransform: "uppercase" }}>Investissement Solaire</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── White card ─────────────────────────────────── */}
      <div style={{ flex: 1, background: "white", borderRadius: "24px 24px 0 0", marginTop: -18, padding: "28px 22px 36px", display: "flex", flexDirection: "column" }}>

        {/* Tabs */}
        <div style={{ display: "flex", background: "#f1f5f1", borderRadius: 14, padding: 4, marginBottom: 24, gap: 4 }}>
          <button
            type="button"
            onClick={() => navigate("/login")}
            data-testid="tab-login"
            style={{ flex: 1, height: 42, borderRadius: 11, background: "transparent", color: "#6b7280", fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" }}
          >
            Connexion
          </button>
          <button
            type="button"
            data-testid="tab-register"
            style={{ flex: 1, height: 42, borderRadius: 11, background: GREEN, color: "white", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,112,84,0.35)" }}
          >
            Inscription
          </button>
        </div>

        {/* Subtitle */}
        <p style={{ color: "#374151", fontWeight: 700, fontSize: 18, margin: "0 0 6px 0" }}>Créer un compte ✨</p>
        <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 20px 0" }}>Rejoignez des milliers d'investisseurs africains</p>

        <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 13, flex: 1 }}>

          {/* Phone */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6, letterSpacing: 0.3 }}>Numéro de téléphone</label>
            <div style={{
              borderRadius: 14, height: 54, display: "flex", alignItems: "center", overflow: "hidden",
              border: `1.5px solid ${form.formState.errors.phone ? "#ef4444" : "#e5e7eb"}`,
              background: "#fafafa"
            }}>
              <button
                type="button"
                onClick={() => setCountryModalOpen(true)}
                data-testid="button-select-country"
                style={{ paddingLeft: 14, paddingRight: 12, height: "100%", display: "flex", alignItems: "center", gap: 4, background: "transparent", border: "none", borderRight: "1.5px solid #e5e7eb", cursor: "pointer", flexShrink: 0 }}
              >
                <span style={{ fontSize: 18 }}>
                  {countryData ? String.fromCodePoint(...([...countryData.code].map(c => 0x1F1E6 + c.charCodeAt(0) - 65))) : "🌍"}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{countryData ? `+${countryData.phonePrefix}` : "+"}</span>
                <ChevronDown size={13} color="#9ca3af" />
              </button>
              <input
                {...form.register("phone")}
                type="tel"
                placeholder="XX XX XX XX"
                data-testid="input-phone"
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", paddingLeft: 12, paddingRight: 12, fontSize: 15, color: "#111827", fontWeight: 500 }}
              />
            </div>
            {form.formState.errors.phone && (
              <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{form.formState.errors.phone.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6, letterSpacing: 0.3 }}>Mot de passe</label>
            <div style={{
              borderRadius: 14, height: 54, display: "flex", alignItems: "center", overflow: "hidden",
              border: `1.5px solid ${form.formState.errors.password ? "#ef4444" : "#e5e7eb"}`,
              background: "#fafafa"
            }}>
              <input
                {...form.register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 caractères"
                data-testid="input-password"
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", paddingLeft: 16, fontSize: 15, color: "#111827", fontWeight: 500, letterSpacing: showPassword ? 0 : 2 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="button-toggle-password"
                style={{ paddingRight: 16, paddingLeft: 8, color: "#9ca3af", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{form.formState.errors.password.message}</p>
            )}
          </div>

          {/* Invitation code */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6, letterSpacing: 0.3 }}>Code d'invitation <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optionnel)</span></label>
            <div style={{
              borderRadius: 14, height: 54, display: "flex", alignItems: "center", overflow: "hidden",
              border: "1.5px solid #e5e7eb", background: "#fafafa"
            }}>
              <div style={{ paddingLeft: 14, paddingRight: 10, color: "#9ca3af", display: "flex", alignItems: "center" }}>
                <Gift size={18} />
              </div>
              <input
                {...form.register("invitationCode")}
                type="text"
                placeholder="Entrez votre code parrain"
                data-testid="input-invitation-code"
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", paddingRight: 12, fontSize: 15, color: "#111827", fontWeight: 500 }}
              />
            </div>
          </div>

          <input type="hidden" {...form.register("country")} />

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            data-testid="button-register"
            style={{
              width: "100%", height: 54, borderRadius: 16, marginTop: 6,
              background: isLoading ? "#94a3b8" : `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_LIGHT} 100%)`,
              color: "white", fontWeight: 700, fontSize: 16, border: "none", cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: isLoading ? "none" : "0 6px 24px rgba(0,112,84,0.38)", transition: "all 0.2s"
            }}
          >
            {isLoading ? <><Loader2 size={20} className="animate-spin" /> Inscription...</> : "Créer mon compte"}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
            <span style={{ fontSize: 12, color: "#cbd5e1" }}>ou</span>
            <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
          </div>

          {/* Login link */}
          <button
            type="button"
            onClick={() => navigate("/login")}
            data-testid="button-goto-login"
            style={{ width: "100%", height: 54, borderRadius: 16, background: "transparent", color: GREEN, fontWeight: 700, fontSize: 15, border: `2px solid ${GREEN}`, cursor: "pointer" }}
          >
            J'ai déjà un compte
          </button>

          {/* Trust badges */}
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 4 }}>
            {[
              { icon: <ShieldCheck size={14} color={GREEN} />, label: "Sécurisé" },
              { icon: <Zap size={14} color={GREEN} />, label: "Instantané" },
              { icon: <Sun size={14} color={GREEN} />, label: "Solaire" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                {item.icon}
                <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>{item.label}</span>
              </div>
            ))}
          </div>

        </form>
      </div>

      {/* Draggable service agent */}
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
