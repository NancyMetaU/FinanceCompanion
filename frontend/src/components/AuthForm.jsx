const AuthForm = () => {
    return (
        <form>
            <h2>Login</h2>
            <input
                placeholder="Email"
                required
            />
            <input
                placeholder="Password"
                required
            />
            <button type="submit">
                Login
            </button>
        </form>
    );
};

export default AuthForm;
