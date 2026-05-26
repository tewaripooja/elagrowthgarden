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
});

type FormValues = z.infer<typeof formSchema>;

export default function ForgotPassword() {
  const { session, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
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
      const { data, error } = await supabase.auth.resetPasswordForEmail(values.email.trim(), {
        redirectTo,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Check your email for a password reset link.");
      form.reset();
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
            <CardTitle className="font-heading text-2xl text-emerald-950">Reset your password</CardTitle>
            <CardDescription>Enter the email attached to your account — we'll send a reset link there.</CardDescription>
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
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Sending…" : "Send reset email"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 border-t pt-6">
            <p className="text-center text-sm text-muted-foreground">
              Remembered your password? <Link to="/login" className="font-medium text-emerald-700 underline-offset-4 hover:underline">Sign in</Link>
            </p>
            <Link to="/" className="text-center text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
          </CardFooter>
        </Card>
      </div>
    </DynamicSky>
  );
}
