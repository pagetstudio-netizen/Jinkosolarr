import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Plus, Pencil, Trash2, Globe, X, Check, Power } from "lucide-react";
import type { PlatformCountry } from "@shared/schema";

const GREEN = "#007054";

const KNOWN_PREFIXES: Record<string, { prefix: string; currency: string }> = {
  BJ: { prefix: "229", currency: "XOF" },
  CM: { prefix: "237", currency: "XAF" },
  BF: { prefix: "226", currency: "XOF" },
  CI: { prefix: "225", currency: "XOF" },
  TG: { prefix: "228", currency: "XOF" },
  SN: { prefix: "221", currency: "XOF" },
  ML: { prefix: "223", currency: "XOF" },
  CG: { prefix: "242", currency: "XAF" },
  CD: { prefix: "243", currency: "CDF" },
  GA: { prefix: "241", currency: "XAF" },
  GN: { prefix: "224", currency: "GNF" },
  NE: { prefix: "227", currency: "XOF" },
};

interface FormState {
  code: string;
  name: string;
  currency: string;
  phonePrefix: string;
  operatorsInput: string;
  isActive: boolean;
}

const emptyForm: FormState = {
  code: "",
  name: "",
  currency: "",
  phonePrefix: "",
  operatorsInput: "",
  isActive: true,
};

export default function AdminCountries() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: countries = [], isLoading } = useQuery<PlatformCountry[]>({
    queryKey: ["/api/admin/countries"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<FormState, "operatorsInput"> & { operators: string[] }) => {
      const res = await apiRequest("POST", "/api/admin/countries", data);
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/countries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/countries"] });
      toast({ title: "Pays ajouté avec succès" });
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/admin/countries/${id}`, data);
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/countries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/countries"] });
      toast({ title: "Pays mis à jour" });
      setEditId(null);
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/countries/${id}`, {});
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/countries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/countries"] });
      toast({ title: "Pays supprimé" });
      setDeleteConfirm(null);
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PUT", `/api/admin/countries/${id}`, { isActive });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/countries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/countries"] });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  function handleCodeChange(code: string) {
    const upper = code.toUpperCase().slice(0, 2);
    const hint = KNOWN_PREFIXES[upper];
    setForm(f => ({
      ...f,
      code: upper,
      currency: hint?.currency || f.currency,
      phonePrefix: hint?.prefix || f.phonePrefix,
    }));
  }

  function handleSubmit() {
    if (!form.code || !form.name || !form.currency || !form.phonePrefix) {
      toast({ title: "Champs requis", description: "Code, nom, devise et préfixe sont obligatoires", variant: "destructive" });
      return;
    }
    const operators = form.operatorsInput.split(",").map(s => s.trim()).filter(Boolean);
    const payload = { code: form.code, name: form.name, currency: form.currency, phonePrefix: form.phonePrefix, operators, isActive: form.isActive };
    if (editId !== null) {
      updateMutation.mutate({ id: editId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  function handleEdit(c: PlatformCountry) {
    setEditId(c.id);
    setForm({
      code: c.code,
      name: c.name,
      currency: c.currency,
      phonePrefix: c.phonePrefix,
      operatorsInput: (c.operators || []).join(", "),
      isActive: c.isActive,
    });
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Globe size={20} color={GREEN} />
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Gestion des Pays</h2>
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: GREEN, color: "white", border: "none", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            data-testid="button-add-country"
          >
            <Plus size={15} /> Ajouter un pays
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{ background: "white", borderRadius: 14, border: "1.5px solid #e5e7eb", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{editId ? "Modifier le pays" : "Nouveau pays"}</h3>
            <button onClick={handleCancel} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color="#6b7280" /></button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {/* Code ISO */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Code ISO (2 lettres) *</label>
              <input
                value={form.code}
                onChange={e => handleCodeChange(e.target.value)}
                placeholder="CI"
                maxLength={2}
                data-testid="input-country-code"
                style={{ width: "100%", height: 42, borderRadius: 10, border: "1.5px solid #e5e7eb", padding: "0 12px", fontSize: 14, fontWeight: 700, textTransform: "uppercase", boxSizing: "border-box" }}
              />
            </div>

            {/* Nom */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Nom du pays *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Côte d'Ivoire"
                data-testid="input-country-name"
                style={{ width: "100%", height: 42, borderRadius: 10, border: "1.5px solid #e5e7eb", padding: "0 12px", fontSize: 14, boxSizing: "border-box" }}
              />
            </div>

            {/* Devise */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Devise *</label>
              <input
                value={form.currency}
                onChange={e => setForm(f => ({ ...f, currency: e.target.value.toUpperCase() }))}
                placeholder="XOF"
                data-testid="input-country-currency"
                style={{ width: "100%", height: 42, borderRadius: 10, border: "1.5px solid #e5e7eb", padding: "0 12px", fontSize: 14, boxSizing: "border-box" }}
              />
            </div>

            {/* Préfixe */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Préfixe téléphonique *</label>
              <input
                value={form.phonePrefix}
                onChange={e => setForm(f => ({ ...f, phonePrefix: e.target.value.replace(/\D/g, "") }))}
                placeholder="225"
                data-testid="input-country-prefix"
                style={{ width: "100%", height: 42, borderRadius: 10, border: "1.5px solid #e5e7eb", padding: "0 12px", fontSize: 14, boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* Opérateurs */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
              Opérateurs <span style={{ color: "#9ca3af", fontWeight: 400 }}>(séparés par des virgules)</span>
            </label>
            <input
              value={form.operatorsInput}
              onChange={e => setForm(f => ({ ...f, operatorsInput: e.target.value }))}
              placeholder="MTN, Orange Money, Wave, Moov Money"
              data-testid="input-country-operators"
              style={{ width: "100%", height: 42, borderRadius: 10, border: "1.5px solid #e5e7eb", padding: "0 12px", fontSize: 14, boxSizing: "border-box" }}
            />
            <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Ces opérateurs apparaîtront dans la sélection du portefeuille</p>
          </div>

          {/* Actif */}
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <div
              onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
              style={{
                width: 44, height: 24, borderRadius: 12, background: form.isActive ? GREEN : "#d1d5db",
                position: "relative", cursor: "pointer", transition: "background 0.2s"
              }}
            >
              <div style={{
                position: "absolute", top: 2, left: form.isActive ? 22 : 2,
                width: 20, height: 20, borderRadius: "50%", background: "white",
                transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)"
              }} />
            </div>
            <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>
              {form.isActive ? "Pays actif" : "Pays inactif"}
            </span>
          </label>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleCancel}
              style={{ flex: 1, height: 42, borderRadius: 10, border: "1.5px solid #e5e7eb", background: "white", color: "#6b7280", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              data-testid="button-save-country"
              style={{ flex: 2, height: 42, borderRadius: 10, background: GREEN, color: "white", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: isPending ? 0.7 : 1 }}
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {editId ? "Enregistrer" : "Ajouter"}
            </button>
          </div>
        </div>
      )}

      {/* Countries list */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Loader2 size={28} color={GREEN} className="animate-spin" />
        </div>
      ) : countries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af" }}>
          <Globe size={40} color="#d1d5db" style={{ margin: "0 auto 12px" }} />
          <p style={{ margin: 0, fontWeight: 600 }}>Aucun pays configuré</p>
          <p style={{ margin: "4px 0 0", fontSize: 13 }}>Ajoutez des pays pour les rendre disponibles sur la plateforme</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {countries.map(c => (
            <div key={c.id} style={{ background: "white", borderRadius: 14, border: `1.5px solid ${c.isActive ? "#e5e7eb" : "#fca5a5"}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}
              data-testid={`country-row-${c.id}`}>

              {/* Flag + info */}
              <div style={{ fontSize: 26, flexShrink: 0 }}>
                {String.fromCodePoint(...([...c.code].map(ch => 0x1F1E6 + ch.charCodeAt(0) - 65)))}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</span>
                  <span style={{ fontSize: 11, background: "#f3f4f6", color: "#6b7280", borderRadius: 6, padding: "2px 7px", fontWeight: 600 }}>{c.code}</span>
                  <span style={{ fontSize: 11, background: "#eff6ff", color: "#3b82f6", borderRadius: 6, padding: "2px 7px", fontWeight: 600 }}>+{c.phonePrefix}</span>
                  <span style={{ fontSize: 11, background: "#f0fdf4", color: GREEN, borderRadius: 6, padding: "2px 7px", fontWeight: 600 }}>{c.currency}</span>
                  {!c.isActive && <span style={{ fontSize: 11, background: "#fee2e2", color: "#dc2626", borderRadius: 6, padding: "2px 7px", fontWeight: 600 }}>Inactif</span>}
                </div>
                {(c.operators || []).length > 0 && (
                  <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {(c.operators || []).map(op => (
                      <span key={op} style={{ fontSize: 11, background: "#f9fafb", border: "1px solid #e5e7eb", color: "#374151", borderRadius: 6, padding: "2px 8px" }}>
                        {op}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => toggleMutation.mutate({ id: c.id, isActive: !c.isActive })}
                  title={c.isActive ? "Désactiver" : "Activer"}
                  style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #e5e7eb", background: c.isActive ? "#f0fdf4" : "#fef2f2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  data-testid={`button-toggle-country-${c.id}`}
                >
                  <Power size={14} color={c.isActive ? GREEN : "#dc2626"} />
                </button>
                <button
                  onClick={() => handleEdit(c)}
                  style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  data-testid={`button-edit-country-${c.id}`}
                >
                  <Pencil size={14} color="#6b7280" />
                </button>
                {deleteConfirm === c.id ? (
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => deleteMutation.mutate(c.id)} style={{ padding: "0 10px", height: 32, borderRadius: 8, background: "#dc2626", color: "white", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      {deleteMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : "Oui"}
                    </button>
                    <button onClick={() => setDeleteConfirm(null)} style={{ padding: "0 10px", height: 32, borderRadius: 8, background: "#f3f4f6", color: "#374151", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Non</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(c.id)}
                    style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #fca5a5", background: "#fef2f2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    data-testid={`button-delete-country-${c.id}`}
                  >
                    <Trash2 size={14} color="#dc2626" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
