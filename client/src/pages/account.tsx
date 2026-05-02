import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCountryByCode } from "@/lib/countries";
import { Loader2, ChevronLeft, Shield } from "lucide-react";
import ContactSheet from "@/components/contact-sheet";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import jinkoLogo from "@assets/EdwUP_fe_400x400_1777682768333.jpg";

/* ── Icônes personnalisées ── */
import iconPersonnel    from "@assets/3-1_1777757766575.png";
import iconEquipe       from "@assets/4-1_1777757766509.png";
import iconInviter      from "@assets/3-1_1777757766575.png";
import iconMessage      from "@assets/1-2_1777757766535.png";
import iconAbout        from "@assets/images_(12)_1777757766621.png";
import iconServiceClient from "@assets/customer-service_1777742458188.png";
import iconSecurite     from "@assets/1-1_1777757766561.png";
import iconDeconnexion  from "@assets/téléchargement_(16)_1777757766643.png";
import iconDepot        from "@assets/6_1777757766471.png";
import iconRetrait      from "@assets/téléchargement_(18)_1777757766668.png";
import iconWallet       from "@assets/2-1_1777757766598.png";
import iconCle          from "@assets/téléchargement_(19)_1777757766714.png";

const GREEN = "#007054";

/* Filtre CSS qui rend n'importe quelle image totalement blanche */
const ICON_FILTER = "brightness(0) invert(1)";

/* Carré d'icône vert uniforme */
function IconBox({ src, alt, size = 26 }: { src: string; alt: string; size?: number }) {
  return (
    <div style={{
      width: 48, height: 48, borderRadius: 14,
      background: GREEN,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <img
        src={src} alt={alt}
        style={{ width: size, height: size, objectFit: "contain", filter: ICON_FILTER }}
      />
    </div>
  );
}

/* Carré d'icône vert plus petit pour les quick-links */
function IconBoxSm({ src, alt }: { src: string; alt: string }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: 10,
      background: GREEN,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, marginRight: 12,
    }}>
      <img
        src={src} alt={alt}
        style={{ width: 20, height: 20, objectFit: "contain", filter: ICON_FILTER }}
      />
    </div>
  );
}

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  useEffect(() => { document.title = "Compte | State Grid"; }, []);
  const [showPinModal,     setShowPinModal]     = useState(false);
  const [adminPin,         setAdminPin]         = useState("");
  const [showContactSheet, setShowContactSheet] = useState(false);

  const { data: userProducts } = useQuery<any[]>({ queryKey: ["/api/user/products"], staleTime: 0 });

  const verifyPinMutation = useMutation({
    mutationFn: async (pin: string) => {
      const res = await apiRequest("POST", "/api/admin/verify-pin", { pin });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Code PIN incorrect"); }
      return res.json();
    },
    onSuccess: () => { setShowPinModal(false); setAdminPin(""); navigate("/admin"); },
    onError:   (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const copyLink = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(`https://stategrid.app/register?ref=${user.referralCode}`);
      toast({ title: "Lien copié !" });
    }
  };

  if (!user) return null;

  const balance     = parseFloat(user.balance || "0");
  const totalEarned = (userProducts ?? []).reduce((s: number, p: any) => s + parseFloat(p.totalEarned || "0"), 0);
  const frozen      = (userProducts ?? []).filter((p: any) => p.status === "active").reduce((s: number, p: any) => s + parseFloat(p.product?.price || "0"), 0);
  const country     = getCountryByCode(user.country);
  const currency    = country?.currency || "FCFA";

  /* ── Centre de services ── */
  const services = [
    { src: iconPersonnel,   alt: "Personnel",         label: "Personnel",        action: () => navigate("/change-password") },
    { src: iconEquipe,      alt: "Rapport d'équipe",  label: "Rapport d'équipe", action: () => navigate("/team") },
    { src: iconInviter,     alt: "Inviter un ami",    label: "Inviter un ami",   action: () => navigate("/team") },
    { src: iconMessage,     alt: "Un message",        label: "Un message",       action: () => setShowContactSheet(true) },
    { src: iconAbout,       alt: "À propos de",       label: "À propos de",      action: () => navigate("/about") },
    { src: iconServiceClient, alt: "Service client",   label: "Service client",   action: () => setShowContactSheet(true) },
    { src: iconSecurite,    alt: "Sécurité",          label: "Sécurité",         action: () => navigate("/change-password") },
    { src: iconDeconnexion, alt: "Déconnexion",       label: "Déconnexion",      action: handleLogout },
  ];

  /* ── Quick Links ── */
  const quickLinks = [
    { src: iconDepot,   alt: "Dépôts",       label: "Historique des dépôts",   href: "/deposit-orders" },
    { src: iconRetrait, alt: "Retraits",     label: "Historique des retraits", href: "/withdrawal-history" },
    { src: iconWallet,  alt: "Portefeuille", label: "Mon portefeuille",        href: "/wallet" },
    { src: iconCle,     alt: "Clé",          label: "La clé du compte",        href: "/change-password" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f2f2f7", display: "flex", flexDirection: "column" }}>
      <ContactSheet open={showContactSheet} onClose={() => setShowContactSheet(false)} />

      {/* ── HEADER ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px 14px", backgroundColor: "#f2f2f7",
      }}>
        <button onClick={() => navigate("/")} data-testid="button-back"
          style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4 }}>
          <ChevronLeft style={{ width: 24, height: 24, color: "#374151" }} />
        </button>
        <h1 style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: 0 }}>Détails du compte</h1>
        <div style={{ width: 32, display: "flex", justifyContent: "flex-end" }}>
          {user.isAdmin && (
            <button onClick={() => setShowPinModal(true)} data-testid="button-admin"
              style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4 }}>
              <Shield style={{ width: 22, height: 22, color: GREEN }} />
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 100px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* ── PROFILE CARD ── */}
        <div style={{ background: "white", borderRadius: 16, padding: "16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%", overflow: "hidden",
            border: `2px solid ${GREEN}`, flexShrink: 0,
            background: "#f0faf7", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <img src={jinkoLogo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: 17, color: GREEN, margin: "0 0 2px 0" }} data-testid="text-phone">
              {user.phone}
            </p>
            <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
              Code d'invitation : <span style={{ fontWeight: 700, color: "#374151" }}>{user.referralCode}</span>
            </p>
          </div>
          <button
            onClick={copyLink}
            data-testid="button-copy-link"
            style={{
              flexShrink: 0, padding: "6px 12px", borderRadius: 20,
              border: `1.5px solid ${GREEN}`, background: "transparent",
              color: GREEN, fontSize: 12, fontWeight: 600, cursor: "pointer",
              lineHeight: 1.3, textAlign: "center",
            }}
          >
            Copier le<br />lien
          </button>
        </div>

        {/* ── BALANCE CARD ── */}
        <div style={{
          background: "white", borderRadius: 16, padding: "18px 18px 14px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.07)", overflow: "hidden", position: "relative",
        }}>
          <div style={{ position: "absolute", right: -30, top: -30, width: 130, height: 130, borderRadius: "50%", background: "rgba(0,112,84,0.08)" }} />
          <div style={{ position: "absolute", right: 10, top: 10, width: 80, height: 80, borderRadius: "50%", background: "rgba(0,112,84,0.06)" }} />

          <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 4px 0" }}>Équilibre</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: "0 0 16px 0" }} data-testid="text-balance">
            {currency}{balance.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>

          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/withdrawal" style={{ flex: 1 }}>
              <button data-testid="button-retrait" style={{
                width: "100%", height: 40, borderRadius: 999,
                border: `1.5px solid ${GREEN}`, background: "transparent",
                color: GREEN, fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}>Retrait</button>
            </Link>
            <Link href="/deposit" style={{ flex: 1 }}>
              <button data-testid="button-recharger" style={{
                width: "100%", height: 40, borderRadius: 999,
                border: "none", background: GREEN,
                color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer",
                boxShadow: "0 3px 10px rgba(0,112,84,0.35)",
              }}>Recharger</button>
            </Link>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div style={{
          background: "white", borderRadius: 16, padding: "16px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", textAlign: "center",
        }}>
          <div style={{ borderRight: "1px solid #f0f0f0", padding: "0 4px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
              <img src={iconWallet} alt="" style={{ width: 26, height: 26, objectFit: "contain", filter: `brightness(0) saturate(100%) invert(27%) sepia(49%) saturate(590%) hue-rotate(115deg) brightness(91%) contrast(97%)` }} />
            </div>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 4px 0" }}>Le total</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }} data-testid="text-total">
              {totalEarned.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div style={{ borderRight: "1px solid #f0f0f0", padding: "0 4px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
              <img src={iconDepot} alt="" style={{ width: 26, height: 26, objectFit: "contain", filter: `brightness(0) saturate(100%) invert(27%) sepia(49%) saturate(590%) hue-rotate(115deg) brightness(91%) contrast(97%)` }} />
            </div>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 4px 0" }}>Des détails</p>
            <Link href="/deposit-orders">
              <p style={{ fontSize: 13, fontWeight: 700, color: GREEN, margin: 0, cursor: "pointer" }}>
                {balance.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </Link>
          </div>
          <div style={{ padding: "0 4px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
              <img src={iconSecurite} alt="" style={{ width: 26, height: 26, objectFit: "contain", filter: `brightness(0) saturate(100%) invert(27%) sepia(49%) saturate(590%) hue-rotate(115deg) brightness(91%) contrast(97%)` }} />
            </div>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 4px 0" }}>Geler</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>
              {frozen.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* ── CENTRE DE SERVICES ── */}
        <div style={{ background: "white", borderRadius: 16, padding: "16px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: "#111827", margin: "0 0 16px 0" }}>
            Centre de services
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {services.map((svc, idx) => (
              <button
                key={idx}
                onClick={svc.action}
                data-testid={`button-service-${idx}`}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  background: "transparent", border: "none", cursor: "pointer", padding: "4px 0",
                }}
              >
                <IconBox src={svc.src} alt={svc.alt} />
                <span style={{ fontSize: 10, color: "#6b7280", textAlign: "center", lineHeight: 1.3 }}>
                  {svc.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── QUICK LINKS ── */}
        <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
          {quickLinks.map((item, idx, arr) => (
            <Link href={item.href} key={idx}>
              <button
                data-testid={`button-link-${idx}`}
                style={{
                  width: "100%", display: "flex", alignItems: "center", padding: "14px 16px",
                  background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
                  borderBottom: idx < arr.length - 1 ? "1px solid #f5f5f5" : "none",
                }}
              >
                <IconBoxSm src={item.src} alt={item.alt} />
                <span style={{ flex: 1, fontSize: 14, color: "#374151", fontWeight: 500 }}>{item.label}</span>
                <ChevronLeft style={{ width: 16, height: 16, color: "#d1d5db", transform: "rotate(180deg)" }} />
              </button>
            </Link>
          ))}
        </div>

      </div>

      {/* ── PIN MODAL ── */}
      <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Code d'accès administrateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Entrez votre code PIN pour accéder au panel administrateur
            </p>
            <Input
              type="password"
              value={adminPin}
              onChange={e => setAdminPin(e.target.value)}
              placeholder="Code PIN"
              className="text-center text-2xl tracking-widest"
              maxLength={8}
              data-testid="input-admin-pin"
            />
            <Button
              onClick={() => {
                if (adminPin.length < 4) { toast({ title: "Code PIN trop court", variant: "destructive" }); return; }
                verifyPinMutation.mutate(adminPin);
              }}
              disabled={verifyPinMutation.isPending || adminPin.length < 4}
              className="w-full"
              style={{ backgroundColor: GREEN }}
              data-testid="button-verify-pin"
            >
              {verifyPinMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirmer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
