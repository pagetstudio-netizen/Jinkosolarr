import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { ELIGIBLE_COUNTRIES } from "@/lib/countries";
import { CountrySelector } from "@/components/country-selector";
import { Loader2, Eye, EyeOff, Smartphone, Lock, CheckSquare, ChevronDown } from "lucide-react";
import authBgVideo from "@/assets/videos/auth-background.mp4";
import elfLogo from "@/assets/images/fanuc-logo.png";

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
        description: "Bienvenue sur ELF! Vous avez recu 500 FCFA de bonus.",
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
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={authBgVideo} type="video/mp4" />
      </video>
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white/95" />

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center pt-8 pb-4">
          <img src={elfLogo} alt="ELF" className="h-16" />
        </div>

        <div className="relative z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-t-3xl px-6 pt-6 pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-800 overflow-visible">
                        <button
                          type="button"
                          onClick={() => setCountryModalOpen(true)}
                          className="flex items-center gap-1 pl-4 pr-2 py-3 text-gray-600 dark:text-gray-300 shrink-0"
                          data-testid="button-select-country"
                        >
                          <Smartphone className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium">
                            {countryData ? `+${countryData.phonePrefix}` : ""}
                          </span>
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="Veuillez entrer le numero de compte"
                          className="border-0 bg-transparent h-12 text-sm focus-visible:ring-0 shadow-none px-2"
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
                      <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-800 overflow-visible">
                        <div className="pl-4 pr-2">
                          <Lock className="w-4 h-4 text-gray-400" />
                        </div>
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Veuillez entrer le numero de compte mot de ..."
                          className="border-0 bg-transparent h-12 text-sm focus-visible:ring-0 shadow-none px-2"
                          data-testid="input-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="pr-4 pl-2 text-blue-500"
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
                      <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-800 overflow-visible">
                        <div className="pl-4 pr-2">
                          <Lock className="w-4 h-4 text-gray-400" />
                        </div>
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Entrez le mot de passe en double"
                          className="border-0 bg-transparent h-12 text-sm focus-visible:ring-0 shadow-none px-2"
                          data-testid="input-confirm-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="pr-4 pl-2 text-blue-500"
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
                      <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-800 overflow-visible">
                        <div className="pl-4 pr-2">
                          <CheckSquare className="w-4 h-4 text-blue-500" />
                        </div>
                        <Input
                          {...field}
                          placeholder="Code d'invitation"
                          className="border-0 bg-transparent h-12 text-sm focus-visible:ring-0 shadow-none px-2"
                          data-testid="input-invitation-code"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <input type="hidden" {...form.register("country")} />

              <div className="text-right pt-1">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-blue-500 text-sm font-medium"
                  data-testid="link-login"
                >
                  Se connecter &gt;
                </button>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-12 rounded-full text-base font-semibold bg-gradient-to-r from-blue-400 to-blue-500 border-0"
                  disabled={isLoading}
                  data-testid="button-register"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Inscription...
                    </>
                  ) : (
                    "S'inscrire"
                  )}
                </Button>
              </div>
            </form>
          </Form>
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
