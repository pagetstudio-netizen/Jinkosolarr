import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Save, Link, Clock, Users, CreditCard } from "lucide-react";

const settingsSchema = z.object({
  supportLink:         z.string().min(5, "Lien requis"),
  support2Link:        z.string().min(5, "Lien requis"),
  channelLink:         z.string().min(5, "Lien requis"),
  groupLink:           z.string().min(5, "Lien requis"),
  congoPaymentLink:    z.string().min(5, "Lien requis"),
  minDeposit:          z.string().min(1, "Montant requis"),
  withdrawalFees:      z.string().min(1, "Frais requis"),
  withdrawalStartHour: z.string().min(1, "Heure requise"),
  withdrawalEndHour:   z.string().min(1, "Heure requise"),
  level1Commission:    z.string().min(1, "Commission requise"),
  level2Commission:    z.string().min(1, "Commission requise"),
  level3Commission:    z.string().min(1, "Commission requise"),
  westpayEnabled:        z.string(),
  westpaySlug:           z.string(),
  westpayEmail:          z.string(),
  westpayPassword:       z.string(),
  westpayWebhookSecret:  z.string(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

interface AdminSettingsProps {
  isSuperAdmin: boolean;
}

export default function AdminSettings({ isSuperAdmin }: AdminSettingsProps) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const { data: settings, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/admin/settings"],
  });

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      supportLink:         "https://t.me/Jinkosolarr",
      support2Link:        "https://t.me/Jinkosolarr",
      channelLink:         "https://t.me/Jinkosolarr",
      groupLink:           "https://t.me/Jinkosolarr",
      congoPaymentLink:    "https://my.moneyfusion.net/697e3d01869cdbb310f0d3e0",
      minDeposit:          "3000",
      withdrawalFees:      "17",
      withdrawalStartHour: "8",
      withdrawalEndHour:   "17",
      level1Commission:    "27",
      level2Commission:    "2",
      level3Commission:    "1",
      westpayEnabled:       "false",
      westpaySlug:          "",
      westpayEmail:         "",
      westpayPassword:      "",
      westpayWebhookSecret: "",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        supportLink:         settings.supportLink         || "https://t.me/Jinkosolarr",
        support2Link:        settings.support2Link        || "https://t.me/Jinkosolarr",
        channelLink:         settings.channelLink         || "https://t.me/Jinkosolarr",
        groupLink:           settings.groupLink           || "https://t.me/Jinkosolarr",
        congoPaymentLink:    settings.congoPaymentLink    || "https://my.moneyfusion.net/697e3d01869cdbb310f0d3e0",
        minDeposit:          settings.minDeposit          || "3000",
        withdrawalFees:      settings.withdrawalFees      || "17",
        withdrawalStartHour: settings.withdrawalStartHour || "8",
        withdrawalEndHour:   settings.withdrawalEndHour   || "17",
        level1Commission:    settings.level1Commission    || "27",
        level2Commission:    settings.level2Commission    || "2",
        level3Commission:    settings.level3Commission    || "1",
        westpayEnabled:       settings.westpayEnabled       || "false",
        westpaySlug:          settings.westpaySlug          || "",
        westpayEmail:         settings.westpayEmail         || "",
        westpayPassword:      settings.westpayPassword      || "",
        westpayWebhookSecret: settings.westpayWebhookSecret || "",
      });
    }
  }, [settings, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: SettingsForm) => {
      const response = await apiRequest("POST", "/api/admin/settings", data);
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Erreur");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Paramètres enregistrés !" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const westpayEnabled = form.watch("westpayEnabled") === "true";

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">

        {/* Liens sociaux */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Link className="w-5 h-5 text-primary" />
              Liens sociaux
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(["supportLink", "support2Link", "channelLink", "groupLink"] as const).map((name, i) => (
              <FormField key={name} control={form.control} name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{["Service client 1", "Service client 2", "Chaîne officielle", "Groupe de discussion"][i]}</FormLabel>
                    <FormControl><Input {...field} placeholder="https://t.me/..." /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <FormField control={form.control} name="congoPaymentLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lien MoneyFusion</FormLabel>
                  <FormControl><Input {...field} placeholder="https://my.moneyfusion.net/..." /></FormControl>
                  <FormDescription>Lien pour Congo Brazzaville et Burkina Faso</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Retraits */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Dépôts & Retraits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="minDeposit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dépôt minimum (FCFA)</FormLabel>
                  <FormControl><Input {...field} type="number" min="0" /></FormControl>
                  <FormDescription>Montant minimum de dépôt</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="withdrawalFees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frais de retrait (%)</FormLabel>
                  <FormControl><Input {...field} type="number" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="withdrawalStartHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure début</FormLabel>
                    <FormControl><Input {...field} type="number" min="0" max="23" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="withdrawalEndHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure fin</FormLabel>
                    <FormControl><Input {...field} type="number" min="0" max="23" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* WestPay */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              WestPay (RobotPay) — Paiement automatique
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="westpayEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Activer WestPay</FormLabel>
                    <FormDescription>
                      Page de paiement hébergée RobotPay (Mobile Money multi-pays)
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === "true"}
                      onCheckedChange={(checked) => field.onChange(checked ? "true" : "false")}
                      data-testid="switch-westpay"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {westpayEnabled && (
              <>
                <FormField control={form.control} name="westpaySlug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug marchand WestPay</FormLabel>
                      <FormControl><Input {...field} placeholder="ex: ecomat" /></FormControl>
                      <FormDescription>
                        Visible dans votre dashboard WestPay. Utilisé dans l'URL de paiement.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="westpayEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email marchand WestPay</FormLabel>
                      <FormControl><Input {...field} type="email" placeholder="contact@votreentreprise.com" /></FormControl>
                      <FormDescription>Email de connexion à votre compte WestPay (pour les transferts automatiques)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="westpayPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe WestPay</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input {...field} type={showPassword ? "text" : "password"} placeholder="••••••••" />
                          <button type="button" onClick={() => setShowPassword(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                            {showPassword ? "Cacher" : "Voir"}
                          </button>
                        </div>
                      </FormControl>
                      <FormDescription>Mot de passe de votre compte WestPay (chiffré, jamais exposé)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="westpayWebhookSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secret Webhook (optionnel)</FormLabel>
                      <FormControl><Input {...field} type="password" placeholder="Secret HMAC-SHA256" /></FormControl>
                      <FormDescription>
                        URL webhook à configurer dans WestPay :{" "}
                        <strong>{typeof window !== "undefined" ? window.location.origin : ""}/api/webhooks/westpay</strong>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Commissions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Commissions de parrainage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {(["level1Commission", "level2Commission", "level3Commission"] as const).map((name, i) => (
                <FormField key={name} control={form.control} name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niveau {i + 1} (%)</FormLabel>
                      <FormControl><Input {...field} type="number" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" />Enregistrer</>}
        </Button>
      </form>
    </Form>
  );
}
