import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { ELIGIBLE_COUNTRIES } from "@/lib/countries";
import { Loader2 } from "lucide-react";
import authBgVideo from "@/assets/videos/auth-background.mp4";
import authSound from "@/assets/audio/auth-sound.mp3";
import fanucLogo from "@/assets/images/fanuc-logo.png";

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
  const [rememberMe, setRememberMe] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      country: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginForm) {
    setIsLoading(true);
    try {
      await login(data.phone, data.country, data.password);
      toast({ title: "Connexion reussie", description: "Bienvenue sur Fanuc!" });
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
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      <audio autoPlay loop>
        <source src={authSound} type="audio/mpeg" />
      </audio>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      >
        <source src={authBgVideo} type="video/mp4" />
      </video>
      
      <div className="absolute inset-0 bg-white/80" />
      
      <div className="relative z-10 w-full max-w-sm px-8 py-12">
        <div className="text-center mb-10">
          <img src={fanucLogo} alt="FANUC" className="h-12 mx-auto" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger 
                        data-testid="select-country"
                        className="border-0 border-b border-gray-300 rounded-none bg-transparent px-0 h-14 text-base focus:ring-0 focus:border-primary"
                      >
                        <SelectValue placeholder="Selectionner le code pays >>" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ELIGIBLE_COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.code} - {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      placeholder="Saisir le numero de telephone portable"
                      className="border-0 border-b border-gray-300 rounded-none bg-transparent px-0 h-14 text-base focus-visible:ring-0 focus-visible:border-primary"
                      data-testid="input-phone"
                    />
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
                    <Input
                      {...field}
                      type="password"
                      placeholder="Veuillez saisir votre mot de passe"
                      className="border-0 border-b border-gray-300 rounded-none bg-transparent px-0 h-14 text-base focus-visible:ring-0 focus-visible:border-primary"
                      data-testid="input-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2 pt-4 pb-6">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                Se souvenir du mot de passe
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-full text-base font-semibold"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/register")}
            className="text-primary hover:underline font-medium text-base"
            data-testid="link-register"
          >
            Acceder au registre &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
