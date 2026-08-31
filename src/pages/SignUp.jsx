import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from "../components/ui";
import { School, Mail, Lock, Eye, EyeOff, User, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

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
      const data = await signUp({ name: name.trim(), email: email.trim(), password });
      
      // If user requires email verification or signup succeeded
      setIsSuccess(true);
      toast.success("Account created successfully!");
      if (data.session) {
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    } catch (err) {
      console.error(err);
      if (err.message?.toLowerCase().includes("already registered")) {
        setError("An account with this email already exists.");
      } else {
        setError(err.message || "Failed to create account. Please try again.");
      }
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
          <p className="text-text-secondary mt-2">Admin Account Registration</p>
        </div>

        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Create Admin Account</CardTitle>
            <CardDescription>Enter your details to register as an administrator</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {isSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="inline-flex items-center justify-center size-14 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                  <CheckCircle2 className="size-8" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary">Check Your Email</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  We sent a confirmation link to <span className="font-semibold text-text-primary">{email}</span>. Please verify your email to log in to your account.
                </p>
                <div className="pt-4">
                  <Link to="/login">
                    <Button variant="primary" fullWidth>
                      Back to Sign In
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

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted size-5" aria-hidden="true" />
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full pl-11 pr-4 py-3 border border-border rounded-xl bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted size-5" aria-hidden="true" />
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full pl-11 pr-4 py-3 border border-border rounded-xl bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted size-5" aria-hidden="true" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password (min 6 chars)"
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
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted size-5" aria-hidden="true" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="w-full pl-11 pr-4 py-3 border border-border rounded-xl bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" fullWidth loading={loading} className="py-3 mt-2">
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>

                <div className="text-center pt-2">
                  <p className="text-sm text-text-secondary">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary font-medium hover:underline">
                      Sign In
                    </Link>
                  </p>
                </div>
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

export default SignUp;
