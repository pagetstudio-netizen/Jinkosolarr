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
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Save, Link, Clock, Users, CreditCard, Zap } from "lucide-react";

const SOLEASPAY_COUNTRIES = [
  { code: "CM", name: "Cameroun" },
  { code: "BF", name: "Burkina Faso" },
  { code: "TG", name: "Togo" },
  { code: "BJ", name: "Benin" },
  { code: "CI", name: "Cote d'Ivoire" },
  { code: "CG", name: "Congo Brazzaville" },
  { code: "CD", name: "RDC" },
];

const settingsSchema = z.object({
  supportLink: z.string().min(5, "Lien requis"),
  support2Link: z.string().min(5, "Lien requis"),
  channelLink: z.string().min(5, "Lien requis"),
  groupLink: z.string().min(5, "Lien requis"),
  withdrawalFees: z.string().min(1, "Frais requis"),
  withdrawalStartHour: z.string().min(1, "Heure requise"),
  withdrawalEndHour: z.string().min(1, "Heure requise"),
  level1Commission: z.string().min(1, "Commission requise"),
  level2Commission: z.string().min(1, "Commission requise"),
  level3Commission: z.string().min(1, "Commission requise"),
  soleaspayEnabled: z.string(),
  soleaspayCountries: z.string(),
  soleaspayChannelName: z.string().min(1, "Nom requis"),
  omnipayEnabled: z.string(),
  omnipayChannelName: z.string().min(1, "Nom requis"),
  omnipayCallbackKey: z.string(),
  congoPaymentLink: z.string().min(5, "Lien requis"),
});

type SettingsForm = z.infer<typeof settingsSchema>;

interface AdminSettingsProps {
  isSuperAdmin: boolean;
}

export default function AdminSettings({ isSuperAdmin }: AdminSettingsProps) {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/admin/settings"],
  });

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      supportLink: "https://t.me/wendysappgroup",
      support2Link: "https://t.me/wendysappgroup",
      channelLink: "https://t.me/wendysappgroup",
      groupLink: "https://t.me/wendysappgroup",
      withdrawalFees: "15",
      withdrawalStartHour: "8",
      withdrawalEndHour: "17",
      level1Commission: "27",
      level2Commission: "2",
      level3Commission: "1",
      soleaspayEnabled: "false",
      soleaspayCountries: "",
      soleaspayChannelName: "Westpay",
      omnipayEnabled: "false",
      omnipayChannelName: "OmniPay",
      omnipayCallbackKey: "",
      congoPaymentLink: "https://my.moneyfusion.net/697e3d01869cdbb310f0d3e0",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        supportLink: settings.supportLink || "https://t.me/wendysappgroup",
        support2Link: settings.support2Link || "https://t.me/wendysappgroup",
        channelLink: settings.channelLink || "https://t.me/wendysappgroup",
        groupLink: settings.groupLink || "https://t.me/wendysappgroup",
        withdrawalFees: settings.withdrawalFees || "15",
        withdrawalStartHour: settings.withdrawalStartHour || "8",
        withdrawalEndHour: settings.withdrawalEndHour || "17",
        level1Commission: settings.level1Commission || "27",
        level2Commission: settings.level2Commission || "2",
        level3Commission: settings.level3Commission || "1",
        soleaspayEnabled: settings.soleaspayEnabled || "false",
        soleaspayCountries: settings.soleaspayCountries || "",
        soleaspayChannelName: settings.soleaspayChannelName || "Westpay",
        omnipayEnabled: settings.omnipayEnabled || "false",
        omnipayChannelName: settings.omnipayChannelName || "OmniPay",
        omnipayCallbackKey: settings.omnipayCallbackKey || "",
        congoPaymentLink: settings.congoPaymentLink || "https://my.moneyfusion.net/697e3d01869cdbb310f0d3e0",
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
      queryClient.invalidateQueries({ queryKey: ["/api/soleaspay/services"] });
      toast({ title: "Parametres enregistres!" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const soleaspayEnabled = form.watch("soleaspayEnabled") === "true";
  const soleaspayCountriesValue = form.watch("soleaspayCountries") || "";
  const selectedCountries = soleaspayCountriesValue ? soleaspayCountriesValue.split(",").filter(Boolean) : [];

  const toggleCountry = (code: string) => {
    let updated: string[];
    if (selectedCountries.includes(code)) {
      updated = selectedCountries.filter(c => c !== code);
    } else {
      updated = [...selectedCountries, code];
    }
    form.setValue("soleaspayCountries", updated.join(","), { shouldDirty: true });
  };

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Link className="w-5 h-5 text-primary" />
              Liens sociaux
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="supportLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service client 1</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://t.me/..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="support2Link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service client 2</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://t.me/..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="channelLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chaine officielle</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://t.me/..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="groupLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Groupe de discussion</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://t.me/..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="congoPaymentLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lien MoneyFusion</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://my.moneyfusion.net/..." />
                  </FormControl>
                  <FormDescription>
                    Lien MoneyFusion pour Congo Brazzaville et Burkina Faso
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Retraits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="withdrawalFees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frais de retrait (%)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="withdrawalStartHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure debut</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" max="23" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="withdrawalEndHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure fin</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" max="23" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Paiement automatique (Soleaspay)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="soleaspayEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Activer Soleaspay</FormLabel>
                    <FormDescription>
                      Permet le paiement automatique via mobile money
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === "true"}
                      onCheckedChange={(checked) => field.onChange(checked ? "true" : "false")}
                      data-testid="switch-soleaspay"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="soleaspayChannelName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du canal (affiché aux utilisateurs)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Westpay" />
                  </FormControl>
                  <FormDescription>Ce nom apparaît comme option de recharge sur la page dépôt.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {soleaspayEnabled && (
              <div className="rounded-lg border p-4 space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Pays actives pour Soleaspay
                </p>
                <p className="text-xs text-muted-foreground">
                  Les utilisateurs de ces pays utiliseront le paiement automatique. Les autres verront les canaux de recharge manuels.
                </p>
                <div className="space-y-2">
                  {SOLEASPAY_COUNTRIES.map((country) => (
                    <label
                      key={country.code}
                      className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover-elevate"
                      data-testid={`checkbox-soleaspay-${country.code}`}
                    >
                      <Checkbox
                        checked={selectedCountries.includes(country.code)}
                        onCheckedChange={() => toggleCountry(country.code)}
                      />
                      <span className="text-sm">{country.name} ({country.code})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Paiement automatique (OmniPay)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="omnipayEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Activer OmniPay</FormLabel>
                    <FormDescription>Permet les depots et retraits automatiques via OmniPay</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === "true"}
                      onCheckedChange={(checked) => field.onChange(checked ? "true" : "false")}
                      data-testid="switch-omnipay"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="omnipayChannelName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du canal (affiché aux utilisateurs)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: OmniPay" />
                  </FormControl>
                  <FormDescription>Ce nom apparaît comme option de recharge sur la page dépôt.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="omnipayCallbackKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clé Callback OmniPay</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Clé trouvée dans Mon Compte > Callback URL sur OmniPay" />
                  </FormControl>
                  <FormDescription>
                    URL webhook a configurer sur OmniPay : <strong>https://wendysapp.sbs/api/webhooks/omnipay</strong>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Commissions de parrainage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="level1Commission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau 1 (%)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="level2Commission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau 2 (%)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="level3Commission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau 3 (%)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
