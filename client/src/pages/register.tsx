import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { ELIGIBLE_COUNTRIES } from "@/lib/countries";
import { Loader2 } from "lucide-react";
import authBgVideo from "@/assets/videos/auth-background.mp4";

const registerSchema = z.object({
  fullName: z.string().min(2, "Le nom complet est requis"),
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

  const params = new URLSearchParams(searchString);
  const refCode = params.get("reg") || "";

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      country: "",
      password: "",
      confirmPassword: "",
      invitationCode: refCode,
    },
  });

  async function onSubmit(data: RegisterForm) {
    setIsLoading(true);
    try {
      await register({
        fullName: data.fullName,
        phone: data.phone,
        country: data.country,
        password: data.password,
        invitationCode: data.invitationCode,
      });
      toast({ 
        title: "Inscription reussie!", 
        description: "Bienvenue sur Fanuc! Vous avez recu 500 FCFA de bonus.",
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
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
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
      
      <div className="relative z-10 w-full max-w-sm px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-gray-500">-</span>
            <span className="text-primary">fanuc</span>
            <span className="text-gray-500">+</span>
          </h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nom complet"
                      className="border-0 border-b border-gray-300 rounded-none bg-transparent px-0 h-12 text-base focus-visible:ring-0 focus-visible:border-primary"
                      data-testid="input-fullname"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger 
                        data-testid="select-country"
                        className="border-0 border-b border-gray-300 rounded-none bg-transparent px-0 h-12 text-base focus:ring-0 focus:border-primary"
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
                      className="border-0 border-b border-gray-300 rounded-none bg-transparent px-0 h-12 text-base focus-visible:ring-0 focus-visible:border-primary"
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
                      placeholder="Mot de passe de connexion"
                      className="border-0 border-b border-gray-300 rounded-none bg-transparent px-0 h-12 text-base focus-visible:ring-0 focus-visible:border-primary"
                      data-testid="input-password"
                    />
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
                    <Input
                      {...field}
                      type="password"
                      placeholder="Confirmez le mot de passe"
                      className="border-0 border-b border-gray-300 rounded-none bg-transparent px-0 h-12 text-base focus-visible:ring-0 focus-visible:border-primary"
                      data-testid="input-confirm-password"
                    />
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
                    <Input
                      {...field}
                      placeholder="Veuillez saisir le code d'invitation"
                      className="border-0 border-b border-gray-300 rounded-none bg-transparent px-0 h-12 text-base focus-visible:ring-0 focus-visible:border-primary"
                      data-testid="input-invitation-code"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-6 pb-2">
              <Button
                type="submit"
                className="w-full h-12 rounded-full text-base font-semibold"
                disabled={isLoading}
                data-testid="button-register"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Inscription...
                  </>
                ) : (
                  "Creer un compte"
                )}
              </Button>
            </div>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-primary hover:underline font-medium text-base"
            data-testid="link-login"
          >
            J'ai deja cree un compte, connectez-vous maintenant
          </button>
        </div>
      </div>
    </div>
  );
}
