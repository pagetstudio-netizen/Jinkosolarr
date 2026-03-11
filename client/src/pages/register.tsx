import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { ELIGIBLE_COUNTRIES } from "@/lib/countries";
import { CountrySelector } from "@/components/country-selector";
import { Loader2, Eye, EyeOff, Smartphone, Lock, Users, ChevronDown } from "lucide-react";
import wendysLogo from "@assets/Wendy's_full_logo_2012.svg_1773248029392.png";

const registerSchema = z.object({
  phone: z.string().min(8, "Numero de telephone invalide"),
  country: z.string().min(2, "Selectionnez un pays"),
  password: z.string().min(6, "Le mot de passe doit avoir au moins 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirmez le mot de passe"),
  invitationCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const { register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const params = new URLSearchParams(searchString);
  const refCode = params.get("reg") || "";

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
      toast({
        title: "Inscription reussie!",
        description: "Bienvenue sur Wendy's! Vous avez recu 500 FCFA de bonus.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden">
      <div className="relative flex flex-col flex-1">
        <div
          className="absolute inset-x-0 top-0 h-[42%]"
          style={{ background: "linear-gradient(180deg, #c8102e 0%, #e8394e 60%, #f8d0d5 100%)" }}
        />

        <div className="relative z-10 flex flex-col items-center pt-12 pb-2 px-6">
          <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
            <img src={wendysLogo} alt="Wendy's" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="mt-3 text-2xl font-extrabold text-white tracking-tight">Wendy's</h1>
          <p className="text-white/80 text-xs mt-0.5">Fast Food, Smart Investment</p>
        </div>

        <div className="relative z-10 flex-1 bg-white rounded-t-3xl mx-0 mt-5 px-6 pt-6 pb-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center border border-gray-200 rounded-full bg-gray-50 overflow-visible">
                        <button
                          type="button"
                          onClick={() => setCountryModalOpen(true)}
                          className="flex items-center gap-1.5 pl-4 pr-2 py-3.5 text-gray-500 shrink-0"
                          data-testid="button-select-country"
                        >
                          <Smartphone className="w-5 h-5 text-gray-400" />
                          <span className="text-base font-medium text-gray-600">
                            {countryData ? `+${countryData.phonePrefix}` : ""}
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="Entrez votre numéro"
                          className="border-0 bg-transparent h-13 text-base focus-visible:ring-0 shadow-none px-2 text-gray-700 placeholder:text-gray-400"
                          data-testid="input-phone"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center border border-gray-200 rounded-full bg-gray-50">
                        <div className="pl-4 pr-2">
                          <Lock className="w-5 h-5 text-gray-400" />
                        </div>
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Entrez votre mot de passe"
                          className="border-0 bg-transparent h-13 text-base focus-visible:ring-0 shadow-none px-2 text-gray-700 placeholder:text-gray-400"
                          data-testid="input-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="pr-4 pl-2 text-gray-400"
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center border border-gray-200 rounded-full bg-gray-50">
                        <div className="pl-4 pr-2">
                          <Lock className="w-5 h-5 text-gray-400" />
                        </div>
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirmez le mot de passe"
                          className="border-0 bg-transparent h-13 text-base focus-visible:ring-0 shadow-none px-2 text-gray-700 placeholder:text-gray-400"
                          data-testid="input-confirm-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="pr-4 pl-2 text-gray-400"
                          data-testid="button-toggle-confirm-password"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invitationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center border border-gray-200 rounded-full bg-gray-50">
                        <div className="pl-4 pr-2">
                          <Users className="w-5 h-5 text-gray-400" />
                        </div>
                        <Input
                          {...field}
                          placeholder="Code d'invitation (optionnel)"
                          className="border-0 bg-transparent h-13 text-base focus-visible:ring-0 shadow-none px-2 text-gray-700 placeholder:text-gray-400"
                          data-testid="input-invitation-code"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <input type="hidden" {...form.register("country")} />

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-14 rounded-full text-lg font-bold border-0 text-white"
                  style={{ background: "linear-gradient(90deg, #c8102e, #e8394e)" }}
                  disabled={isLoading}
                  data-testid="button-register"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Inscription...
                    </>
                  ) : (
                    "S'inscrire"
                  )}
                </Button>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <Checkbox
                  id="agree"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                  className="mt-0.5"
                  data-testid="checkbox-agree"
                />
                <label htmlFor="agree" className="text-sm text-gray-500 leading-snug cursor-pointer">
                  Lire et accepter{" "}
                  <span className="text-[#c8102e] font-medium">Accord d'utilisation</span>{" "}
                  et{" "}
                  <span className="text-[#c8102e] font-medium">Politique de confidentialité</span>
                </label>
              </div>
            </form>
          </Form>

          <div className="mt-5 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-[#c8102e] text-base font-semibold"
              data-testid="link-login"
            >
              Déjà inscrit ? Se connecter &gt;
            </button>
          </div>
        </div>
      </div>

      <CountrySelector
        open={countryModalOpen}
        onClose={() => setCountryModalOpen(false)}
        onSelect={(code) => form.setValue("country", code, { shouldValidate: true })}
      />
    </div>
  );
}
