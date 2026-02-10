import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api, toApiRole, toFrontendRole, normalizeUser } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<RoleType>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [existingUser, setExistingUser] = useState<{ id: string; email: string; role?: string; name?: string } | null>(null);
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    // Check for existing token/user in localStorage
    const token = localStorage.getItem('access_token');
    if (token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          const frontendRole = toFrontendRole(u.role);
          setExistingUser({
            id: u.id || '',
            email: u.email || '',
            role: frontendRole || undefined,
            name: u.name || u.fullName || undefined,
          });
          if (!frontendRole) {
            setNeedsRoleSelection(true);
          }
        } catch {
          // invalid stored user
        }
      }
    }
    setCheckingSession(false);
  }, []);

  const redirectBasedOnRole = (userRole?: string) => {
    if (userRole === "teacher") {
      navigate("/teacher/dashboard");
    } else {
      navigate("/student/dashboard");
    }
  };

  const handleContinueAsUser = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const role = toFrontendRole(user.role);
        if (role === 'teacher') {
          window.location.href = '/teacher/dashboard';
          return;
        } else if (role === 'student') {
          window.location.href = '/student/dashboard';
          return;
        }
      } catch { /* ignore */ }
    }
    // Fallback
    const userRole = localStorage.getItem('user_role');
    if (userRole === 'teacher') {
      window.location.href = '/teacher/dashboard';
    } else if (userRole === 'student') {
      window.location.href = '/student/dashboard';
    } else {
      window.location.href = '/auth';
    }
  };

  const handleSwitchAccount = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_role');
    sessionStorage.clear();
    setExistingUser(null);
    setNeedsRoleSelection(false);
    setSavingRole(false);
  };

  const handleSaveOAuthRole = (selectedRole: RoleType) => {
    if (!existingUser || !selectedRole) return;

    // Save role to localStorage only — backend doesn't have PUT /api/auth/me
    setExistingUser((prev) => (prev ? { ...prev, role: selectedRole } : null));
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        user.role = selectedRole;
        localStorage.setItem('user', JSON.stringify(user));
      } catch { /* ignore */ }
    }
    localStorage.setItem('user_role', selectedRole);
    setNeedsRoleSelection(false);

    toast({
      title: "Welcome to FairGrade!",
      description: `You're all set as a ${selectedRole === 'teacher' ? 'Teacher' : 'Student'}.`,
    });

    redirectBasedOnRole(selectedRole);
  };

  const validateInputs = (isSignUp: boolean) => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      if (isSignUp && !firstName.trim()) {
        throw new Error("First name is required");
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
      const response = await api.post('/api/auth/login', { email, password });
      
      localStorage.setItem('access_token', response.access_token);
      const normalized = normalizeUser(response.user);
      localStorage.setItem('user', JSON.stringify(normalized));
      localStorage.setItem('user_role', normalized.role || '');

      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      });

      // Navigate based on role
      if (normalized.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (normalized.role === 'student') {
        navigate('/student/dashboard');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: error.message || "Invalid email or password.",
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
      const response = await api.post('/api/auth/register', {
        email,
        password,
        first_name: firstName,
        last_name: lastName || '',
        role: toApiRole(role),
      });
      
      localStorage.setItem('access_token', response.access_token);
      const normalizedUserData = normalizeUser(response.user);
      localStorage.setItem('user', JSON.stringify(normalizedUserData));
      localStorage.setItem('user_role', normalizedUserData.role || '');

      console.log('Stored token:', localStorage.getItem('access_token'));
      console.log('Stored user:', localStorage.getItem('user'));

      toast({
        title: "Account Created!",
        description: "Welcome to FairGrade!",
      });

      if (normalizedUserData.role === 'student') {
        navigate('/student/dashboard');
      } else if (normalizedUserData.role === 'teacher') {
        navigate('/teacher/dashboard');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: error.message || "Registration failed. This email may already be registered.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    loginWithGoogle();
  };

  // Loading state
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-slate-400">Checking session...</p>
      </div>
    );
  }

  // Already logged in but needs role selection (OAuth users without role)
  if (existingUser && needsRoleSelection) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          <h1 className="text-2xl font-bold text-white mb-2">One More Step!</h1>
          <p className="text-slate-400 text-sm mb-2">Welcome, {existingUser.email}</p>
          <p className="text-slate-500 text-sm mb-8">Please tell us who you are to complete your account setup.</p>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSaveOAuthRole("student")}
              disabled={savingRole}
              className="w-full bg-white/[0.04] border border-white/10 hover:border-blue-500 rounded-xl p-6 transition-all duration-300 group disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-500/15 rounded-full flex items-center justify-center group-hover:bg-blue-500/25 transition-colors">
                  <GraduationCap className="h-7 w-7 text-blue-400" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-lg font-semibold text-white">I'm a Student</h3>
                  <p className="text-slate-400 text-sm">Track my contributions</p>
                </div>
                {savingRole ? (
                  <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                )}
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSaveOAuthRole("teacher")}
              disabled={savingRole}
              className="w-full bg-white/[0.04] border border-white/10 hover:border-blue-500 rounded-xl p-6 transition-all duration-300 group disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-500/15 rounded-full flex items-center justify-center group-hover:bg-blue-500/25 transition-colors">
                  <UserCheck className="h-7 w-7 text-blue-400" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-lg font-semibold text-white">I'm a Teacher</h3>
                  <p className="text-slate-400 text-sm">Grade fairly with data</p>
                </div>
                {savingRole ? (
                  <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                )}
              </div>
            </motion.button>

            <Button
              onClick={handleSwitchAccount}
              variant="outline"
              className="w-full mt-4 bg-white/10 border border-white/10 text-white hover:bg-white/15 py-3 rounded-xl"
              disabled={savingRole}
            >
              Sign in with different account
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Already logged in with role - show continue screen
  if (existingUser && existingUser.role) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back!</h1>
          <p className="text-slate-400 text-sm mb-8">You're already signed in</p>

          <div className="bg-white/[0.04] border border-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-4 justify-center mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {existingUser.email.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-white font-medium">{existingUser.email}</p>
                <p className="text-slate-400 text-sm capitalize">{existingUser.role}</p>
              </div>
            </div>

            <Button
              onClick={handleContinueAsUser}
              className="w-full mb-3 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium"
            >
              Continue to Dashboard
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>

            <Button
              onClick={handleSwitchAccount}
              variant="outline"
              className="w-full bg-white/10 border border-white/10 text-white hover:bg-white/15 py-3 rounded-xl"
            >
              Sign in with different account
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-white">Fair</span>
            <span className="text-blue-400">Grade</span>
          </h1>
          <p className="text-slate-400 text-sm">
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
              <p className="text-slate-400 text-center mb-6">I am a...</p>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRole("student")}
                className="w-full bg-white/[0.04] border border-white/10 hover:border-blue-500 rounded-xl p-6 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-500/15 rounded-full flex items-center justify-center group-hover:bg-blue-500/25 transition-colors">
                    <GraduationCap className="h-7 w-7 text-blue-400" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-lg font-semibold text-white">I'm a Student</h3>
                    <p className="text-slate-400 text-sm">Track my contributions</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRole("teacher")}
                className="w-full bg-white/[0.04] border border-white/10 hover:border-blue-500 rounded-xl p-6 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-500/15 rounded-full flex items-center justify-center group-hover:bg-blue-500/25 transition-colors">
                    <UserCheck className="h-7 w-7 text-blue-400" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-lg font-semibold text-white">I'm a Teacher</h3>
                    <p className="text-slate-400 text-sm">Grade fairly with data</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
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
              <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    {role === "teacher" ? (
                      <UserCheck className="h-4 w-4 text-blue-400" />
                    ) : (
                      <GraduationCap className="h-4 w-4 text-blue-400" />
                    )}
                  </div>
                  <span className="text-slate-300 text-sm">
                    {authMode === "signin" ? "Signing in" : "Signing up"} as {role === "teacher" ? "Teacher" : "Student"}
                  </span>
                </div>
                <button
                  onClick={() => setRole(null)}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Change
                </button>
              </div>

              {/* Auth Mode Toggle */}
              <div className="flex bg-white/10 rounded-xl p-1">
                <button
                  onClick={() => setAuthMode("signin")}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                    authMode === "signin"
                      ? "bg-blue-500 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthMode("signup")}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                    authMode === "signup"
                      ? "bg-blue-500 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={authMode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
                {authMode === "signup" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-slate-300 text-sm font-medium">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          autoComplete="off"
                          data-form-type="other"
                          data-lpignore="true"
                          data-1p-ignore="true"
                          className="pl-10 bg-white/10 border border-white/10 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-credentials-auto-fill-button]:!w-0 [&::-webkit-credentials-auto-fill-button]:!opacity-0 [&::-webkit-textfield-decoration-container]:hidden"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-slate-300 text-sm font-medium">Last Name</Label>
                      <div className="relative">
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          autoComplete="off"
                          data-form-type="other"
                          data-lpignore="true"
                          data-1p-ignore="true"
                          className="bg-white/10 border border-white/10 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-credentials-auto-fill-button]:!w-0 [&::-webkit-credentials-auto-fill-button]:!opacity-0 [&::-webkit-textfield-decoration-container]:hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300 text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="email"
                      type="text"
                      inputMode="email"
                      placeholder="you@school.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="off"
                      data-form-type="other"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      className="pl-10 bg-white/10 border border-white/10 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-credentials-auto-fill-button]:!w-0 [&::-webkit-credentials-auto-fill-button]:!opacity-0 [&::-webkit-textfield-decoration-container]:hidden"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300 text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      data-form-type="other"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      className="pl-10 bg-white/10 border border-white/10 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 [-webkit-text-security:disc] [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-credentials-auto-fill-button]:!w-0 [&::-webkit-credentials-auto-fill-button]:!opacity-0 [&::-webkit-textfield-decoration-container]:hidden"
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
                        className="border-white/20 data-[state=checked]:bg-blue-500"
                      />
                      <label htmlFor="remember" className="text-sm text-slate-400">
                        Remember me
                      </label>
                    </div>
                    <button type="button" className="text-sm text-blue-400 hover:text-blue-300">
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-300"
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
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#0f172a] px-2 text-slate-500">Or continue with</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full bg-white/10 border border-white/10 text-white hover:bg-white/15 py-3 rounded-xl"
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
                <Link to="/terms" className="text-blue-400 hover:text-blue-300">Terms</Link>
                {" "}and{" "}
                <Link to="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Auth;
