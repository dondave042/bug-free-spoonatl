import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Lock } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useStore } from "../lib/store";
import { FIELD_LG } from "../lib/utils";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const { resetPassword } = useStore();
  const token = searchParams.get("token");
  const resetError = searchParams.get("error");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }
    if (!token) {
      setError("This reset link is invalid or expired. Request a new one.");
      return;
    }

    setPending(true);
    const resetErrorMessage = await resetPassword(token, password);
    setPending(false);
    if (resetErrorMessage) {
      setError(resetErrorMessage);
      return;
    }
    setComplete(true);
  };

  const canReset = Boolean(token) && !resetError && !complete;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto flex max-w-md flex-col px-4 pt-32 pb-20">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100">
          <div className="mb-6 text-center">
            <img
              src="/logo.png"
              alt="ATL Travels logo"
              className="mx-auto mb-4 h-16 w-16 rounded-2xl object-cover shadow-md"
            />
            <h1 className="font-display text-3xl font-bold text-primary">
              {complete ? "Password updated" : "Choose a new password"}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {complete
                ? "Your password has been changed. You can now sign in."
                : "Use at least 8 characters for your new password."}
            </p>
          </div>

          {canReset && (
            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-primary">
                  New password
                </span>
                <div className="relative">
                  <Lock className="absolute top-3.5 left-4 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={`${FIELD_LG} pl-12`}
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-primary">
                  Confirm new password
                </span>
                <div className="relative">
                  <Lock className="absolute top-3.5 left-4 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className={`${FIELD_LG} pl-12`}
                  />
                </div>
              </label>
              {error && (
                <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={pending}
                className="w-full cursor-pointer rounded-full bg-accent py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-accent-hover disabled:cursor-wait disabled:opacity-70"
              >
                {pending ? "Updating password..." : "Update password"}
              </button>
            </form>
          )}

          {!canReset && !complete && (
            <p role="alert" className="rounded-xl bg-amber-50 px-3 py-3 text-sm font-semibold text-amber-800">
              This reset link is missing, invalid, or expired. Request a new one from the login page.
            </p>
          )}

          <p className="mt-5 text-center">
            <Link
              to="/login"
              className="text-sm font-bold text-accent hover:text-accent-hover"
            >
              Return to sign in
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
