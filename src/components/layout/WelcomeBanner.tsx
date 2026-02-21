import { useAuth } from "@/contexts/AuthContext";

export function WelcomeBanner() {
  const { user } = useAuth();
  const firstName = user?.firstName || user?.fullName?.split(' ')[0] || 'there';

  return (
    <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 px-8 py-6 mb-6">
      <h1 className="text-2xl sm:text-3xl font-medium text-foreground">
        Welcome, {firstName}!
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        Here's what's happening with your classrooms
      </p>
    </div>
  );
}
