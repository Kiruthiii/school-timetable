import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from "../components/ui";
import { School, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function ResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(password);
      setIsSuccess(true);
      toast.success("Password updated successfully!");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update password. Please try requesting a new reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-6">
            <School className="size-8 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary">School Timetable</h1>
          <p className="text-text-secondary mt-2">Create New Password</p>
        </div>

        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Set New Password</CardTitle>
            <CardDescription>Enter your new admin password below</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {isSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="inline-flex items-center justify-center size-14 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                  <CheckCircle2 className="size-8" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary">Password Updated!</h3>
                <p className="text-text-secondary text-sm">
                  Your password has been reset successfully. Redirecting you to dashboard...
                </p>
                <div className="pt-2">
                  <Link to="/dashboard">
                    <Button variant="primary" fullWidth>
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="p-4 bg-danger-light border border-danger/20 rounded-xl text-danger text-sm flex items-center gap-2" role="alert">
                    <svg className="size-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted size-5" aria-hidden="true" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password (min 6 chars)"
                        className="w-full pl-11 pr-12 py-3 border border-border rounded-xl bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted size-5" aria-hidden="true" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full pl-11 pr-4 py-3 border border-border rounded-xl bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" fullWidth loading={loading} className="py-3">
                    {loading ? "Updating Password..." : "Update Password"}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-text-muted text-sm mt-6">
          School Timetable Management System.
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
