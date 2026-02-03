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
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setTimeout(() => {
            redirectBasedOnRole(session.user.id);
          }, 0);
        }
        setCheckingSession(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        redirectBasedOnRole(session.user.id);
      } else {
        setCheckingSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const redirectBasedOnRole = async (userId: string) => {
    try {
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (userRole?.role === "teacher") {
        navigate("/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (error) {
      navigate("/student/dashboard");
    }
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  const accentColor = role === "teacher" ? "orange" : "blue";
  const accentClasses = {
    border: role === "teacher" ? "border-orange-500" : "border-blue-500",
    bg: role === "teacher" ? "bg-orange-500" : "bg-blue-500",
    bgHover: role === "teacher" ? "hover:bg-orange-600" : "hover:bg-blue-600",
    text: role === "teacher" ? "text-orange-400" : "text-blue-400",
    focus: role === "teacher" ? "focus:border-orange-500" : "focus:border-blue-500",
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">F</span>
            </div>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">
            {authMode === "signin" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-zinc-400">
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
              <p className="text-zinc-400 text-center mb-6">I am a...</p>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRole("student")}
                className="w-full bg-zinc-900 border-2 border-zinc-800 hover:border-blue-500 rounded-xl p-6 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <GraduationCap className="h-7 w-7 text-blue-500" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-lg font-semibold text-white">I'm a Student</h3>
                    <p className="text-zinc-400 text-sm">Track my contributions</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-blue-500 transition-colors" />
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRole("teacher")}
                className="w-full bg-zinc-900 border-2 border-zinc-800 hover:border-orange-500 rounded-xl p-6 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-orange-500/20 rounded-full flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                    <UserCheck className="h-7 w-7 text-orange-500" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-lg font-semibold text-white">I'm a Teacher</h3>
                    <p className="text-zinc-400 text-sm">Grade fairly with data</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-orange-500 transition-colors" />
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
              <div className={`flex items-center justify-between bg-zinc-900 rounded-lg p-3 border ${accentClasses.border}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${role === "teacher" ? "bg-orange-500/20" : "bg-blue-500/20"} rounded-full flex items-center justify-center`}>
                    {role === "teacher" ? (
                      <UserCheck className={`h-4 w-4 ${accentClasses.text}`} />
                    ) : (
                      <GraduationCap className={`h-4 w-4 ${accentClasses.text}`} />
                    )}
                  </div>
                  <span className="text-white text-sm">
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
              <div className="flex bg-zinc-900 rounded-lg p-1">
                <button
                  onClick={() => setAuthMode("signin")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    authMode === "signin"
                      ? `${accentClasses.bg} text-white`
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthMode("signup")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    authMode === "signup"
                      ? `${accentClasses.bg} text-white`
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={authMode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
                {authMode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-zinc-300">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 ${accentClasses.focus}`}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-300">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@school.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 ${accentClasses.focus}`}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-zinc-300">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 ${accentClasses.focus}`}
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
                        className="border-zinc-700"
                      />
                      <label htmlFor="remember" className="text-sm text-zinc-400">
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
                  <span className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black px-2 text-zinc-500">Or continue with</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800"
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

              <p className="text-center text-sm text-zinc-500">
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
