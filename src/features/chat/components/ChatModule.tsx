import { useState } from 'react';
import { User, Send, AlertCircle, FileText } from 'lucide-react';

/**
 * Módulo de Chat con IA (ChatModule)
 * 
 * Renderiza la interfaz conversacional con la IA asistente.
 * Contiene el área de mensajes y el input para enviar nuevas consultas.
 */
export default function ChatModule() {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      console.log('Sending:', message);
      setMessage('');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="px-8 py-5 border-b bg-white" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '20px', fontWeight: '600', color: '#2B3777' }}>
              Sistema RAG Hospitalario · Clāris
            </h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: '#F7F7F7' }}>
            <FileText size={16} style={{ color: '#717182' }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#717182' }}>
              3 documentos indexados
            </span>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* User Message */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#3B2377' }}>
              <User size={16} style={{ color: '#FFFFFF' }} />
            </div>
            <div className="flex-1">
              <div className="bg-white rounded-lg p-4 shadow-sm" style={{ border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: '#050A0E' }}>
                  ¿Cuál es la dosis recomendada de Acetaminofén para un paciente adulto con fiebre?
                </p>
              </div>
            </div>
          </div>

          {/* RAG Response */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#00B8B3' }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#FFFFFF" strokeWidth="2">
                <path d="M12 6 L12 18 M6 12 L18 12" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1 space-y-4">
              {/* Info Alert */}
              <div
                className="rounded-lg p-4"
                style={{
                  backgroundColor: 'rgba(0, 184, 179, 0.08)',
                  border: '1px solid rgba(0, 184, 179, 0.2)'
                }}
              >
                <div className="flex gap-3">
                  <AlertCircle size={20} style={{ color: '#00B8B3', flexShrink: 0, marginTop: '2px' }} />
                  <div className="flex-1">
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: '#050A0E', lineHeight: '1.6' }}>
                      Según el <strong>Protocolo de Manejo de Analgésicos UCI 2024</strong>, la dosis recomendada de Acetaminofén
                      (Paracetamol) para adultos es de <strong>500-1000 mg cada 4-6 horas</strong>, con una dosis máxima de{' '}
                      <strong>4000 mg/día</strong>. En pacientes con insuficiencia hepática, se debe reducir la dosis.
                    </p>
                  </div>
                </div>
              </div>

              {/* RAG Metadata Card */}
              <div className="bg-white rounded-lg p-4 shadow-sm" style={{ border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p
                      className="mb-2"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#717182',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase'
                      }}
                    >
                      Fuente Consultada
                    </p>
                    <p
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '13px',
                        color: '#008A86',
                        lineHeight: '1.6'
                      }}
                    >
                      SOURCE: protocolo-uci-2024.pdf · p.34 · confianza 0.92
                    </p>
                  </div>
                  <button
                    className="px-4 py-2 rounded-lg transition-all flex-shrink-0"
                    style={{
                      backgroundColor: '#2B3777',
                      color: '#FFFFFF',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                  >
                    Ver Fuente
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 border-t bg-white" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu consulta clínica aquí..."
              className="flex-1 px-5 py-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px',
                borderColor: 'rgba(0, 0, 0, 0.1)',
                backgroundColor: '#F7F7F7'
              }}
            />
            <button
              onClick={handleSend}
              className="px-6 py-4 rounded-lg flex items-center gap-2 transition-all shadow-sm"
              style={{
                backgroundColor: '#00B8B3',
                color: '#FFFFFF',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px',
                fontWeight: '600'
              }}
            >
              <Send size={20} />
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
