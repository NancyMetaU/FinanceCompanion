import AuthForm from "../components/AuthForm";

const AuthPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-page-title">WELCOME</h1>
        <AuthForm />
      </div>
    </div>
  );
};

export default AuthPage;
