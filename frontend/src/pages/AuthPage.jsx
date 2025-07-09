import AuthForm from "../auth-page-components/AuthForm";

const AuthPage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <section className="w-full max-w-md">
        <article className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-royal mb-2">Welcome</h1>
            <p className="text-blue-700 text-lg font-medium">
              To Your Finance Companion
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto mt-4 rounded-full"></div>
          </header>
          <AuthForm />
        </article>
      </section>
    </main>
  );
};

export default AuthPage;
