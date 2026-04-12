import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Loader2, Sparkles } from "lucide-react";
import DynamicSky from "@/components/DynamicSky";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { hasSupabaseAuth } from "@/lib/authConfig";
import { PAGE_SHELL_GRADIENT } from "@/lib/pageTheme";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Login() {
  const { signIn, signUp, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isSignUp && hasSupabaseAuth) {
        const { error } = await signUp(email, password);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Check your email to confirm your account, then sign in.");
        setIsSignUp(false);
        return;
      }
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(hasSupabaseAuth ? "Welcome back!" : "Welcome!");
      navigate(from, { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DynamicSky>
      <div className={cn("min-h-screen w-full flex flex-col items-center justify-center px-4 py-10", PAGE_SHELL_GRADIENT)}>
        <div className="w-full max-w-md">
          <div className="flex justify-center gap-2 mb-6 text-3xl drop-shadow-md" aria-hidden>
            <Sparkles className="h-8 w-8 text-yellow-300" />
            <BookOpen className="h-8 w-8 text-white" />
            <Sparkles className="h-8 w-8 text-cyan-200" />
          </div>

          <Card className="border-white/50 bg-white/90 backdrop-blur-md shadow-lg">
            <CardHeader className="text-center space-y-1">
              <CardTitle className="font-heading text-2xl text-violet-950">Sign in</CardTitle>
              <CardDescription className="text-violet-900/80">
                {hasSupabaseAuth
                  ? "Use your email and password for ELA Growth Garden."
                  : "Enter a name or email to continue (local demo — add Supabase keys for real accounts)."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{hasSupabaseAuth ? "Email" : "Name or email"}</Label>
                  <Input
                    id="email"
                    type={hasSupabaseAuth ? "email" : "text"}
                    autoComplete={hasSupabaseAuth ? "email" : "username"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white"
                    placeholder={hasSupabaseAuth ? "you@example.com" : "Alex"}
                  />
                </div>
                {hasSupabaseAuth && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-white"
                    />
                  </div>
                )}

                <Button type="submit" className="w-full font-heading text-lg rounded-xl" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : isSignUp ? (
                    "Create account"
                  ) : hasSupabaseAuth ? (
                    "Sign in"
                  ) : (
                    "Continue"
                  )}
                </Button>

                {hasSupabaseAuth && (
                  <button
                    type="button"
                    className="w-full text-sm text-violet-700 hover:underline font-medium"
                    onClick={() => setIsSignUp(!isSignUp)}
                  >
                    {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
                  </button>
                )}
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-white/90 mt-6 drop-shadow-sm">
            ELA Growth Garden — reading fun for kids
          </p>
        </div>
      </div>
    </DynamicSky>
  );
}
