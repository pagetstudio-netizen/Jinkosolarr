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
import { Loader2, Eye, EyeOff, Phone, Lock, UserPlus } from "lucide-react";
import jinkoBanner from "@assets/20260408_191813_1775839627189.jpg";
import serviceAgent from "@assets/service_p1_1775839314312.png";

const GREEN = "#3db51d";

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
  useEffect(() => { document.title = "Inscription | Jinko Solar"; }, []);
  const { register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const params = new URLSearchParams(searchString);
  const refCode = params.get("money") || params.get("reg") || "";

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
      toast({ title: "Inscription réussie !", description: "Bienvenue sur Jinko Solar !" });
      navigate("/");
    } catch (e: any) {
      toast({ title: "Erreur d'inscription", description: e.message || "Une erreur est survenue", variant: "destructive" });
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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#080d18", maxWidth: 480, margin: "0 auto", position: "relative", overflow: "hidden" }}>

      {/* ── Header banner (Jinko Solar image) ── */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <img
          src={jinkoBanner}
          alt="Jinko Solar"
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </div>

      {/* ── White form card ── */}
      <div style={{ flex: 1, background: "white", borderRadius: "28px 28px 0 0", marginTop: -26, padding: "30px 20px 20px", overflowY: "auto" }}>

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

          {/* Invitation code */}
          <div>
            <div style={{ background: "#f9fafb", borderRadius: 14, height: 56, display: "flex", alignItems: "center", border: "1.5px solid #e5e7eb", overflow: "hidden" }}>
              <div style={{ paddingLeft: 14, paddingRight: 10, color: "#9ca3af", display: "flex", alignItems: "center" }}>
                <UserPlus size={18} />
              </div>
              <input
                {...form.register("invitationCode")}
                type="text"
                placeholder="Code d'invitation (optionnel)"
                data-testid="input-invitation-code"
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", paddingLeft: 4, paddingRight: 12, fontSize: 14, color: "#111827" }}
              />
            </div>
          </div>

          <input type="hidden" {...form.register("country")} />

          {/* Green submit */}
          <button
            type="submit"
            disabled={isLoading}
            data-testid="button-register"
            style={{ width: "100%", height: 52, borderRadius: 28, background: GREEN, color: "white", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", opacity: isLoading ? 0.72 : 1, marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 18px rgba(61,181,29,0.35)" }}
          >
            {isLoading ? <><Loader2 size={20} className="animate-spin" />Inscription...</> : "S'inscrire"}
          </button>

          {/* Outlined login button */}
          <button
            type="button"
            onClick={() => navigate("/login")}
            data-testid="button-goto-login"
            style={{ width: "100%", height: 52, borderRadius: 28, background: "white", color: "#e53935", fontWeight: 700, fontSize: 16, border: "2px solid #e53935", cursor: "pointer" }}
          >
            J'ai un compte
          </button>

        </form>

        {/* Bottom space */}
        <div style={{ height: 80 }} />
      </div>

      {/* ── Draggable service agent button (bottom-right) ── */}
      <button
        type="button"
        onClick={() => { if (!dragging.current) setShowContact(true); }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        data-testid="button-contact-agent"
        style={{
          position: "fixed",
          bottom: 28 - pos.y,
          right: 20 - pos.x,
          width: 58,
          height: 58,
          borderRadius: "50%",
          overflow: "hidden",
          border: "3px solid white",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          background: "white",
          cursor: "grab",
          padding: 0,
          zIndex: 100,
          touchAction: "none",
        }}
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
