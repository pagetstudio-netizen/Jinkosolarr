import { useEffect } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, CheckCircle } from "lucide-react";

const GREEN = "#007054";
const GREEN_DARK = "#005040";

const steps = [
  {
    num: 1,
    title: "Accédez à la page de recharge",
    desc: "Depuis l'accueil, appuyez sur l'icône « Recharger » ou rendez-vous dans la section Dépôt.",
    icon: "📱",
  },
  {
    num: 2,
    title: "Choisissez votre montant",
    desc: "Sélectionnez un montant prédéfini ou saisissez le montant souhaité. Le minimum est de 3 000 FCFA.",
    icon: "💰",
  },
  {
    num: 3,
    title: "Entrez votre numéro Mobile Money",
    desc: "Saisissez le numéro de téléphone lié à votre compte Mobile Money (Wave, MTN, Orange Money, Moov, etc.).",
    icon: "📞",
  },
  {
    num: 4,
    title: "Confirmez la demande",
    desc: "Appuyez sur « Recharger maintenant ». Une invite USSD sera envoyée sur votre téléphone.",
    icon: "✅",
  },
  {
    num: 5,
    title: "Validez sur votre téléphone",
    desc: "Répondez à l'invite USSD sur votre téléphone en entrant votre code PIN Mobile Money pour autoriser le paiement.",
    icon: "🔐",
  },
  {
    num: 6,
    title: "Crédit automatique",
    desc: "Dès confirmation, votre solde est crédité instantanément. Vérifiez votre historique de dépôts si besoin.",
    icon: "⚡",
  },
];

const faqs = [
  {
    q: "Combien de temps prend le crédit ?",
    a: "Le crédit est instantané après confirmation de votre PIN Mobile Money.",
  },
  {
    q: "Je n'ai pas reçu l'invite USSD, que faire ?",
    a: "Vérifiez que votre téléphone est allumé et que le numéro saisi correspond bien à votre compte Mobile Money. Réessayez ou contactez le service client.",
  },
  {
    q: "Mon solde n'est pas crédité après confirmation ?",
    a: "Attendez quelques minutes. Si le problème persiste, contactez le service client avec votre référence de transaction.",
  },
  {
    q: "Quel est le montant maximum ?",
    a: "Le montant maximum par recharge est de 2 000 000 FCFA.",
  },
  {
    q: "Quels opérateurs sont acceptés ?",
    a: "Nous acceptons Wave, MTN Mobile Money, Orange Money, Moov Money, et d'autres opérateurs selon votre pays.",
  },
];

export default function DepositTutorialPage() {
  const [, navigate] = useLocation();
  useEffect(() => { document.title = "Tutoriel de recharge | State Grid"; }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f2f2f7", fontFamily: "Inter, sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={{
        background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_DARK} 100%)`,
        padding: "48px 16px 24px",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <button
            onClick={() => navigate("/deposit")}
            data-testid="button-back"
            style={{
              width: 36, height: 36,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              border: "none",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ChevronLeft style={{ width: 20, height: 20, color: "white" }} />
          </button>
          <h1 style={{ flex: 1, textAlign: "center", color: "white", fontSize: 17, fontWeight: 700, margin: 0, paddingRight: 36 }}>
            Tutoriel de recharge
          </h1>
        </div>

        {/* Hero banner */}
        <div style={{
          background: "rgba(255,255,255,0.15)",
          borderRadius: 16,
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}>
          <div style={{ fontSize: 40, lineHeight: 1 }}>📖</div>
          <div>
            <p style={{ color: "white", fontWeight: 700, fontSize: 15, margin: "0 0 4px 0" }}>
              Comment recharger votre compte
            </p>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, margin: 0, lineHeight: 1.5 }}>
              Suivez ces 6 étapes simples pour créditer votre solde via Mobile Money
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 16px 80px" }}>

        {/* ── ÉTAPES ── */}
        <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
          Étapes à suivre
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
          {steps.map((step, idx) => (
            <div
              key={step.num}
              style={{
                background: "white",
                borderRadius: 16,
                padding: "16px",
                boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
              }}
            >
              {/* Step number bubble */}
              <div style={{
                width: 42, height: 42,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 3px 10px rgba(0,112,84,0.35)",
              }}>
                <span style={{ color: "white", fontWeight: 800, fontSize: 16 }}>{step.num}</span>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 20 }}>{step.icon}</span>
                  <p style={{ fontWeight: 700, fontSize: 14, color: "#111827", margin: 0 }}>
                    {step.title}
                  </p>
                </div>
                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, margin: 0 }}>
                  {step.desc}
                </p>
              </div>

              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div style={{
                  position: "absolute",
                  left: 36,
                }} />
              )}
            </div>
          ))}
        </div>

        {/* ── CONSEIL IMPORTANT ── */}
        <div style={{
          background: "linear-gradient(135deg, #fff7ed, #fef3c7)",
          border: "1.5px solid #fbbf24",
          borderRadius: 16,
          padding: "16px",
          marginBottom: 28,
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>⚠️</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: "#92400e", margin: "0 0 6px 0" }}>
              Conseil important
            </p>
            <p style={{ fontSize: 13, color: "#78350f", lineHeight: 1.6, margin: 0 }}>
              Assurez-vous que le numéro Mobile Money saisi est le bon et que votre compte dispose d'un solde suffisant avant de confirmer.
            </p>
          </div>
        </div>

        {/* ── FAQ ── */}
        <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
          Questions fréquentes
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                background: "white",
                borderRadius: 14,
                padding: "14px 16px",
                boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
              }}
            >
              <p style={{ fontWeight: 600, fontSize: 13, color: "#111827", margin: "0 0 6px 0", display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ color: GREEN, flexShrink: 0, fontWeight: 800 }}>Q.</span>
                {faq.q}
              </p>
              <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, margin: 0, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ color: "#34d399", flexShrink: 0, fontWeight: 800 }}>R.</span>
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        {/* ── SUCCESS NOTE ── */}
        <div style={{
          background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})`,
          borderRadius: 16,
          padding: "20px",
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 24,
        }}>
          <CheckCircle style={{ width: 36, height: 36, color: "#4ade80", flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: "white", margin: "0 0 4px 0" }}>
              Prêt à recharger ?
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", margin: 0, lineHeight: 1.5 }}>
              Votre solde sera crédité instantanément après confirmation de votre Mobile Money.
            </p>
          </div>
        </div>

        {/* ── BOUTON RETOUR ── */}
        <button
          onClick={() => navigate("/deposit")}
          data-testid="button-go-deposit"
          style={{
            width: "100%",
            height: 52,
            borderRadius: 999,
            background: `linear-gradient(135deg, ${GREEN} 0%, #009688 100%)`,
            color: "white",
            fontWeight: 700,
            fontSize: 16,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,112,84,0.4)",
          }}
        >
          Recharger maintenant
        </button>
      </div>
    </div>
  );
}
