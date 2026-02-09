import { useState } from "react";
import { useLocation } from "wouter";
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
import { Loader2, Eye, EyeOff, Smartphone, Lock, ChevronDown } from "lucide-react";
import authBgVideo from "@/assets/videos/auth-background.mp4";
import elfLogo from "@/assets/images/fanuc-logo.png";

const loginSchema = z.object({
  phone: z.string().min(8, "Numero de telephone invalide"),
  country: z.string().min(2, "Selectionnez un pays"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  
  const savedCredentials = typeof window !== 'undefined' ? localStorage.getItem('elf_credentials') : null;
  const parsedCredentials = savedCredentials ? JSON.parse(savedCredentials) : null;
  
  const [rememberMe, setRememberMe] = useState(!!parsedCredentials);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: parsedCredentials?.phone || "",
      country: parsedCredentials?.country || "CI",
      password: parsedCredentials?.password || "",
    },
  });

  const selectedCountry = form.watch("country");
  const countryData = ELIGIBLE_COUNTRIES.find(c => c.code === selectedCountry);

  async function onSubmit(data: LoginForm) {
    setIsLoading(true);
    try {
      await login(data.phone, data.country, data.password);
      
      if (rememberMe) {
        localStorage.setItem('elf_credentials', JSON.stringify({
          phone: data.phone,
          country: data.country,
          password: data.password
        }));
      } else {
        localStorage.removeItem('elf_credentials');
      }
      
      toast({ title: "Connexion reussie", description: "Bienvenue sur ELF!" });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Verifiez vos informations",
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
        <div className="flex-1 flex items-center justify-center pt-16 pb-8">
          <img src={elfLogo} alt="ELF" className="h-24" />
        </div>

        <div className="relative z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-t-3xl px-6 pt-8 pb-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          className="flex items-center gap-1.5 pl-4 pr-2 py-3.5 text-gray-600 dark:text-gray-300 shrink-0"
                          data-testid="button-select-country"
                        >
                          <Smartphone className="w-5 h-5 text-blue-500" />
                          <span className="text-base font-medium">
                            {countryData ? `+${countryData.phonePrefix}` : ""}
                          </span>
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="Veuillez entrer le numero de compte"
                          className="border-0 bg-transparent h-14 text-base focus-visible:ring-0 shadow-none px-2"
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
                          <Lock className="w-5 h-5 text-gray-400" />
                        </div>
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Veuillez saisir votre mot de passe"
                          className="border-0 bg-transparent h-14 text-base focus-visible:ring-0 shadow-none px-2"
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

              <input type="hidden" {...form.register("country")} />

              <div className="flex items-center gap-2 pt-2 pb-4">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  data-testid="checkbox-remember"
                />
                <label htmlFor="remember" className="text-base text-gray-600 dark:text-gray-400 cursor-pointer">
                  Se souvenir du mot de passe
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-14 rounded-full text-lg font-semibold bg-gradient-to-r from-blue-400 to-blue-500 border-0"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/register")}
              className="text-blue-500 text-base font-medium"
              data-testid="link-register"
            >
              Acceder au registre &gt;
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
