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
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {loading && <Loading message="Logging in..." />}
      {error && <ErrorMessage message={error} />}
      <input
        type="email"
        placeholder="Email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="auth-input"
      />
      <input
        type="password"
        placeholder="Password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="auth-input"
      />
      <button type="submit" className="auth-submit-btn">
        {isLogin ? "Login" : "Sign Up"}
      </button>
      <button
        type="button"
        onClick={() => setIsLogin(!isLogin)}
        className="auth-change-btn"
      >
        {isLogin ? "Don't have an Account?" : "Already Have an Account?"}
      </button>
    </form>
  );
};

export default AuthForm;
