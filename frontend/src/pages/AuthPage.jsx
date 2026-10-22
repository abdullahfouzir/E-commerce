import { useState } from "react";
import { Link } from "react-router-dom";
import { container } from "../assets.js";
import { login, register } from "../services/authService.js";

export default function AuthPage({ mode, onLoginSuccess }) {
  const isRegister = mode === "register";
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSubmitting(true);

    try {
      if (isRegister) {
        if (!avatar) {
          throw new Error("Please choose an avatar image.");
        }

        await register({ username, email, password, avatar });
        setNotice("Account created. Check your email to verify your account before logging in.");
      } else {
        const accessToken = await login({ email, password });
        onLoginSuccess(accessToken);
      }
    } catch (requestError) {
      const validationErrors = requestError.response?.data?.error;
      const validationMessage = Array.isArray(validationErrors)
        ? validationErrors.map((issue) => issue.message).join(" ")
        : "";
      setError(
        requestError.response?.data?.message ||
          validationMessage ||
          (requestError.request
            ? "Unable to reach the store. Check that the backend server is running."
            : requestError.message) ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={`${container} min-h-[520px] py-12`}>
      <section className="mx-auto max-w-[520px] rounded-[5px] border border-[#e5e5e5d5] bg-white p-8 shadow-[0px_8px_10px_#c0bfbf22] max-[500px]:p-5">
        <div className="mb-7 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#ff8716]">
            Welcome to our store
          </p>
          <h1 className="text-[30px] font-bold">
            {isRegister ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-[#7b7b7b]">
            {isRegister
              ? "Sign up to get started."
              : "Log in to continue shopping."}
          </p>
        </div>

        {notice ? (
          <div role="status" className="rounded-[3px] bg-[#eef8ed] p-4 text-sm text-[#376d32]">
            <p>{notice}</p>
            <Link to="/login" className="mt-3 inline-block font-semibold underline">
              Continue to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <>
                <label className="block text-sm font-semibold">
                  Username
                  <input
                    type="text"
                    name="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    autoComplete="username"
                    required
                    className="mt-2 h-11 w-full rounded-[3px] border border-[#d9d9d9] px-3 font-normal outline-none focus:border-[#ff8716]"
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Profile image
                  <input
                    type="file"
                    name="avatar"
                    accept="image/*"
                    onChange={(event) => setAvatar(event.target.files?.[0] ?? null)}
                    required
                    className="mt-2 block w-full rounded-[3px] border border-[#d9d9d9] p-2 text-sm font-normal file:mr-3 file:cursor-pointer file:rounded-[3px] file:border-0 file:bg-[#fff4e8] file:px-3 file:py-2 file:font-semibold file:text-[#ff8716]"
                  />
                </label>
              </>
            )}

            <label className="block text-sm font-semibold">
              Email address
              <input
                type="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                className="mt-2 h-11 w-full rounded-[3px] border border-[#d9d9d9] px-3 font-normal outline-none focus:border-[#ff8716]"
              />
            </label>

            <label className="block text-sm font-semibold">
              Password
              <input
                type="password"
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isRegister ? "new-password" : "current-password"}
                minLength={isRegister ? 6 : 4}
                required
                className="mt-2 h-11 w-full rounded-[3px] border border-[#d9d9d9] px-3 font-normal outline-none focus:border-[#ff8716]"
              />
              {isRegister && (
                <span className="mt-1 block text-xs font-normal text-[#7b7b7b]">
                  Use at least 6 characters.
                </span>
              )}
            </label>

            {error && (
              <p role="alert" className="rounded-[3px] bg-[#fff0f0] p-3 text-sm text-[#b42318]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full cursor-pointer rounded-[3px] border-2 border-[#ff8716] bg-[#ff8716] py-3 font-bold text-white transition hover:bg-white hover:text-[#ff8716] disabled:cursor-wait disabled:opacity-70"
            >
              {isSubmitting
                ? isRegister ? "Creating account..." : "Logging in..."
                : isRegister ? "Create account" : "Log in"}
            </button>
          </form>
        )}

        {!notice && (
          <p className="mt-6 text-center text-sm text-[#696969]">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link
              to={isRegister ? "/login" : "/register"}
              className="font-semibold text-[#ff8716] hover:underline"
            >
              {isRegister ? "Log in" : "Sign up"}
            </Link>
          </p>
        )}
      </section>
    </main>
  );
}
