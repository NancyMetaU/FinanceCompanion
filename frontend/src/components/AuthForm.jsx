import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();

const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                alert("Logged in!");
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                alert("Account created!");
            }
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>{isLogin ? "Login" : "Sign Up"}</h1>
            <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">
                {isLogin ? "Login" : "Sign Up"}
            </button>
            <button type="button" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Don't have an Account?" : "Already Have an Account?"}
            </button>
        </form>
    );
};

export default AuthForm;
