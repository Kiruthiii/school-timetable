import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from "../components/ui";
import { School, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function ForgotPassword() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to send password reset email. Please try again.");
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
          <p className="text-text-secondary mt-2">Password Recovery</p>
        </div>

        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Reset your password</CardTitle>
            <CardDescription>
              Enter your admin email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {isSubmitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="inline-flex items-center justify-center size-14 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                  <CheckCircle2 className="size-8" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary">Reset Link Sent</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  We have sent password reset instructions to <span className="font-semibold text-text-primary">{email}</span>. Please check your inbox.
                </p>
                <div className="pt-4">
                  <Link to="/login">
                    <Button variant="outline" fullWidth className="gap-2">
                      <ArrowLeft className="size-4" />
                      Return to Sign In
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
                        placeholder="Enter your registered email"
                        className="w-full pl-11 pr-4 py-3 border border-border rounded-xl bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <Button type="submit" fullWidth loading={loading} className="py-3">
                    {loading ? "Sending Link..." : "Send Reset Link"}
                  </Button>
                </form>

                <div className="text-center pt-2">
                  <Link to="/login" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
                    <ArrowLeft className="size-4" />
                    Back to Sign In
                  </Link>
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

export default ForgotPassword;
