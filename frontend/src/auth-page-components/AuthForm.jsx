import Loading from "../shared-components/Loading";
import { useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import ErrorMessage from "../shared-components/ErrorMessage";
import { useNavigate } from "react-router-dom";

const auth = getAuth();
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AuthForm = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();

        await fetch(`${BACKEND_URL}/api/user/init`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
      }

      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {loading && <Loading message="Logging in..." />}
      {error && <ErrorMessage message={error} />}

      <div className="space-y-4">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-blue-900 mb-2"
        >
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        <label
          htmlFor="password"
          className="block text-sm font-medium text-blue-900 mb-2"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-royal hover:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg hover:scale-[1.01] cursor-pointer"
      >
        {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-royal hover:text-blue-800 font-medium underline-offset-4 hover:underline cursor-pointer"
        >
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </form>
  );
};

export default AuthForm;
