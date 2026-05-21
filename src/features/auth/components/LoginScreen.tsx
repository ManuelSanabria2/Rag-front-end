import { /*useRef,*/ useState } from 'react';
import { LogIn } from 'lucide-react';
// import ReCAPTCHA from 'react-google-recaptcha';

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  // const recaptchaRef = useRef<ReCAPTCHA>(null);
  const API_URL = 'http://localhost:3001';

  // const resetRecaptcha = () => {
  //   recaptchaRef.current?.reset();
  //   setRecaptchaToken(null);
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // if (!recaptchaToken) {
    //   setError('Debes completar el reCAPTCHA.');
    //   return;
    // }

    setIsLoading(true);

    try {
      // const captchaResponse = await fetch(`${API_URL}/api/verify-recaptcha`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token: recaptchaToken }),
      // });
      // const captchaData = await captchaResponse.json();
      // if (!captchaResponse.ok || !captchaData.success) {
      //   setError(captchaData.message || 'reCAPTCHA incorrecto.');
      //   resetRecaptcha();
      //   return;
      // }

      const loginResponse = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok || !loginData.success) {
        setError(loginData.message || 'Credenciales incorrectas.');
        // resetRecaptcha();
        return;
      }

      onLogin();
    } catch {
      setError('No se pudo conectar al servidor.');
      // resetRecaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: '#3B2377' }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center">
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 64 64" className="w-full h-full">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#00B8B3" strokeWidth="3" />
                  <path d="M32 16 L32 48 M16 32 L48 32" stroke="#00B8B3" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <h1 className="mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px' }}>
              <span style={{ color: '#00B8B3' }}>Clā</span>
              <span style={{ color: '#3B2377' }}>ris</span>
            </h1>

            <div className="mb-2" style={{ fontSize: '14px', fontWeight: '600', color: '#2B3777' }}>
              HOSPITAL SAN RAFAEL
            </div>

            <p style={{ fontSize: '15px', color: '#717182' }}>
              Inicie sesión en el sistema de asistencia clínica inteligente
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium">
                Correo electrónico
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300"
                placeholder="doctor@sanrafael.med"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium">
                Contraseña
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300"
                placeholder="••••••••"
                required
              />
            </div>

            {/* CAPTCHA temporalmente desactivado
            <div>
              <label className="block mb-2 text-sm font-medium">
                Verificación reCAPTCHA
              </label>

              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6LeCcu8sAAAAAGHkxUAu6FoZ1ORqPLcCcAn3NlYZ"
                  onChange={(token) => setRecaptchaToken(token)}
                  onExpired={resetRecaptcha}
                  onErrored={resetRecaptcha}
                />
              </div>
            </div>
            */}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-70"
              style={{
                backgroundColor: '#00B8B3',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              <LogIn size={20} />
              {isLoading ? 'Validando...' : 'Iniciar Sesión'}
            </button>

            <div className="text-center pt-2">
              <a href="#" className="hover:underline" style={{ fontSize: '14px', color: '#2B3777' }}>
                Olvidé mi contraseña
              </a>
            </div>
          </form>
        </div>

        <div className="text-center mt-6">
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
            Sistema RAG Hospitalario v2.0 · 2026
          </p>
        </div>
      </div>
    </div>
  );
}