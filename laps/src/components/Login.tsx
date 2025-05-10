import { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-white">
      <div className="bg-white/90 p-10 rounded-3xl shadow-2xl w-full max-w-md border border-blue-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-white border-4 border-blue-800 shadow-lg flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Luciano Auto Peças"
              className="w-32 h-32 object-cover object-center"
              style={{ transform: 'scale(1.06)' }}
            />
          </div>
          <h1 className="text-3xl font-extrabold text-blue-900 mt-4">Sistema de Consultas</h1>
          <p className="text-blue-700 font-medium">Luciano Auto Peças</p>
        </div>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        )}
        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-blue-900 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-blue-50 text-blue-900 placeholder-blue-400"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-blue-900 mb-1">
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-blue-50 text-blue-900 placeholder-blue-400"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-800 text-white rounded-lg hover:bg-blue-900 disabled:bg-blue-300 disabled:cursor-not-allowed font-bold shadow transition-colors duration-200"
          >
            {loading ? 'Entrando...' : 'Entrar com Email'}
          </button>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-blue-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-blue-400">Ou</span>
            </div>
          </div>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full mt-4 py-2 px-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 disabled:bg-blue-100 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2 font-semibold text-blue-800 shadow"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Entrar com Google
          </button>
        </div>
      </div>
    </div>
  );
}
export default Login; 