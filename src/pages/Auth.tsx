import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User, GraduationCap, UserCheck, ArrowLeft, ChevronRight } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

type RoleType = "teacher" | "student" | null;
type AuthMode = "signin" | "signup";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<RoleType>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [existingUser, setExistingUser] = useState<{ id: string; email: string; role?: string } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setExistingUser(null);
        }
        setCheckingSession(false);
      }
    );

    // Check for existing session but DON'T auto-redirect
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Fetch user role
        const { data: userRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();

        setExistingUser({
          id: session.user.id,
          email: session.user.email || "",
          role: userRole?.role
        });
      }
      setCheckingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const redirectBasedOnRole = (userRole?: string) => {
    if (userRole === "teacher") {
      navigate("/dashboard");
    } else {
      navigate("/student/dashboard");
    }
  };

  const handleContinueAsUser = () => {
    if (existingUser) {
      redirectBasedOnRole(existingUser.role);
    }
  };

  const handleSwitchAccount = async () => {
    await supabase.auth.signOut();
    setExistingUser(null);
  };

  const validateInputs = (isSignUp: boolean) => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      if (isSignUp && !fullName.trim()) {
        throw new Error("Full name is required");
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: error.errors[0].message,
        });
      } else if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: error.message,
        });
      }
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs(false)) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password. Please try again.");
        }
        throw error;
      }

      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs(true) || !role) return;

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          throw new Error("An account with this email already exists. Please sign in instead.");
        }
        throw error;
      }

      if (data.user) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: data.user.id, role });

        if (roleError) {
          console.error("Error setting role:", roleError);
        }
      }

      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Sign In Failed",
        description: error.message,
      });
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-slate-500">Checking session...</p>
      </div>
    );
  }

  // Show "already logged in" state
  if (existingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          <Link to="/" className="inline-flex flex-col items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </Link>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back!</h1>
          <p className="text-slate-500 mb-8">You're already signed in</p>

          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-lg">
            <div className="flex items-center gap-4 justify-center mb-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                {existingUser.email.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-slate-900 font-medium">{existingUser.email}</p>
                <p className="text-slate-500 text-sm capitalize">{existingUser.role || "Student"}</p>
              </div>
            </div>

            <Button
              onClick={handleContinueAsUser}
              className="w-full mb-3 bg-primary hover:bg-primary/90 text-white"
            >
              Continue to Dashboard
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>

            <Button
              onClick={handleSwitchAccount}
              variant="outline"
              className="w-full border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            >
              Sign in with different account
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const accentClasses = {
    border: "border-primary",
    bg: "bg-primary",
    bgHover: "hover:bg-primary/90",
    text: "text-primary",
    focus: "focus:border-primary",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </Link>
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-slate-900">Fair</span>
            <span className="text-blue-500">Grade</span>
          </h1>
          <p className="text-slate-500">
            {authMode === "signin" ? "Sign in to continue" : "Join FairGrade today"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Role Selection */}
          {!role && (
            <motion.div
              key="role-selection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <p className="text-slate-500 text-center mb-6">I am a...</p>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRole("student")}
                className="w-full bg-white border-2 border-slate-200 hover:border-primary rounded-xl p-6 transition-all duration-300 group shadow-sm hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <GraduationCap className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">I'm a Student</h3>
                    <p className="text-slate-500 text-sm">Track my contributions</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRole("teacher")}
                className="w-full bg-white border-2 border-slate-200 hover:border-primary rounded-xl p-6 transition-all duration-300 group shadow-sm hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <UserCheck className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">I'm a Teacher</h3>
                    <p className="text-slate-500 text-sm">Grade fairly with data</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                </div>
              </motion.button>
            </motion.div>
          )}

          {/* Login/Signup Form */}
          {role && (
            <motion.div
              key="auth-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Role indicator */}
              <div className={`flex items-center justify-between bg-blue-50 rounded-lg p-3 border ${accentClasses.border}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    {role === "teacher" ? (
                      <UserCheck className={`h-4 w-4 ${accentClasses.text}`} />
                    ) : (
                      <GraduationCap className={`h-4 w-4 ${accentClasses.text}`} />
                    )}
                  </div>
                  <span className="text-slate-700 text-sm">
                    {authMode === "signin" ? "Signing in" : "Signing up"} as {role === "teacher" ? "Teacher" : "Student"}
                  </span>
                </div>
                <button
                  onClick={() => setRole(null)}
                  className={`text-sm ${accentClasses.text} hover:underline`}
                >
                  Change
                </button>
              </div>

              {/* Auth Mode Toggle */}
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setAuthMode("signin")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    authMode === "signin"
                      ? `${accentClasses.bg} text-white`
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthMode("signup")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    authMode === "signup"
                      ? `${accentClasses.bg} text-white`
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={authMode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
                {authMode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-slate-700">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 ${accentClasses.focus}`}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@school.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 ${accentClasses.focus}`}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 ${accentClasses.focus}`}
                      required
                    />
                  </div>
                </div>

                {authMode === "signin" && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        className="border-slate-300"
                      />
                      <label htmlFor="remember" className="text-sm text-slate-600">
                        Remember me
                      </label>
                    </div>
                    <button type="button" className={`text-sm ${accentClasses.text} hover:underline`}>
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  className={`w-full py-3 ${accentClasses.bg} ${accentClasses.bgHover} text-white rounded-lg font-semibold transition-all duration-300`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {authMode === "signin" ? "Signing in..." : "Creating account..."}
                    </>
                  ) : (
                    authMode === "signin" ? "Sign In" : "Create Account"
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gradient-to-br from-blue-50 via-white to-slate-50 px-2 text-slate-500">Or continue with</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </Button>

              <p className="text-center text-sm text-slate-500">
                By signing up, you agree to our{" "}
                <Link to="/terms" className={`${accentClasses.text} hover:underline`}>Terms</Link>
                {" "}and{" "}
                <Link to="/privacy" className={`${accentClasses.text} hover:underline`}>Privacy Policy</Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Auth;
