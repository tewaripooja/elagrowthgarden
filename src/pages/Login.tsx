import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import DynamicSky from "@/components/DynamicSky";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PAGE_SHELL_GRADIENT } from "@/lib/pageTheme";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

type LocationState = { from?: { pathname: string } };

export default function Login() {
  const { session, loading } = useAuth();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const from = (location.state as LocationState | null)?.from?.pathname ?? "/";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  if (loading) {
    return (
      <DynamicSky>
        <div className={cn("min-h-screen w-full flex flex-col items-center justify-center", PAGE_SHELL_GRADIENT)}>
          <p className="text-cyan-50 font-medium drop-shadow-sm">Loading…</p>
        </div>
      </DynamicSky>
    );
  }

  if (session) {
    return <Navigate to={from} replace />;
  }

  const redirectTo = `${window.location.origin}/auth/callback`;

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) toast.error(error.message);
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email.trim(),
        password: values.password,
      });
      if (error) {
        const msg = error.message?.toLowerCase() ?? "";
        if (msg.includes("email not confirmed")) {
          toast.error("Confirm your email first. Check your inbox or sign up again to resend.");
        } else {
          toast.error(error.message);
        }
        return;
      }
      toast.success("Welcome back!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DynamicSky>
      <div
        className={cn(
          "min-h-screen w-full flex flex-col items-center justify-center px-4 py-12",
          PAGE_SHELL_GRADIENT,
        )}
      >
        <Card className="w-full max-w-md border-white/20 bg-white/95 shadow-lg backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="font-heading text-2xl text-emerald-950">Log in</CardTitle>
            <CardDescription>Use your email or Google to continue your garden adventure.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button type="button" variant="outline" className="w-full" onClick={() => void signInWithGoogle()}>
              Continue with Google
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or email</span>
              </div>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="current-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 border-t pt-6">
            <p className="text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link to="/signup" className="font-medium text-emerald-700 underline-offset-4 hover:underline">
                Create an account
              </Link>
            </p>
            <Link to="/" className="text-center text-sm text-muted-foreground hover:text-foreground">
              ← Back to home
            </Link>
          </CardFooter>
        </Card>
      </div>
    </DynamicSky>
  );
}
