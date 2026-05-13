import { useState } from 'react';
import { LogIn } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

/**
 * Pantalla de Inicio de Sesión (LoginScreen)
 * 
 * Componente que maneja el formulario de ingreso de los usuarios.
 * Recibe 'onLogin' que es la función que avisa a App.tsx que el usuario se autenticó.
 */
export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: '#3B2377' }}>
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-2xl">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            {/* Logo Icon */}
            <div className="mb-4 flex justify-center">
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 64 64" className="w-full h-full">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#00B8B3" strokeWidth="3" />
                  <path d="M32 16 L32 48 M16 32 L48 32" stroke="#00B8B3" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h1 className="mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', lineHeight: '1.2' }}>
              <span style={{ color: '#00B8B3' }}>Clā</span>
              <span style={{ color: '#3B2377' }}>ris</span>
            </h1>

            {/* Hospital Name */}
            <div className="mb-2" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: '600', color: '#2B3777', letterSpacing: '0.5px' }}>
              HOSPITAL SAN RAFAEL
            </div>

            {/* Tagline */}
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: '#717182' }}>
              Inicie sesión en el sistema de asistencia clínica inteligente
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block mb-2"
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: '500', color: '#050A0E' }}
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '15px',
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                  backgroundColor: '#FFFFFF'
                }}
                placeholder="doctor@sanrafael.med"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block mb-2"
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: '500', color: '#050A0E' }}
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '15px',
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                  backgroundColor: '#FFFFFF'
                }}
                placeholder="••••••••"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
              style={{
                backgroundColor: '#00B8B3',
                color: '#FFFFFF',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '16px',
                fontWeight: '600'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#008A86';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#00B8B3';
                e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
              }}
            >
              <LogIn size={20} />
              Iniciar Sesión
            </button>

            {/* Forgot Password Link */}
            <div className="text-center pt-2">
              <a
                href="#"
                className="hover:underline transition-all"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  color: '#2B3777'
                }}
              >
                Olvidé mi contraseña
              </a>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
            Sistema RAG Hospitalario v2.0 · 2026
          </p>
        </div>
      </div>
    </div>
  );
}
