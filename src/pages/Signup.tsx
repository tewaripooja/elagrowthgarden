import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
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

export default function Signup() {
  const { session, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

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
    return <Navigate to="/" replace />;
  }

  const redirectTo = `${window.location.origin}/auth/callback`;

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email.trim(),
        password: values.password,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      if (data.user && !data.session) {
        toast.success("Check your email to verify your account, then log in.");
        form.reset();
      } else if (data.session) {
        toast.success("Account ready!");
      }
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
            <CardTitle className="font-heading text-2xl text-emerald-950">Sign up</CardTitle>
            <CardDescription>Create an account with your email. We will email you to verify new accounts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Creating account…" : "Create account"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 border-t pt-6">
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-emerald-700 underline-offset-4 hover:underline">
                Log in
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
