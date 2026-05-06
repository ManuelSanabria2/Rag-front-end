import { useState } from 'react';
import { Upload, X, FileText, Tag, Hash, Award } from 'lucide-react';

interface DocumentUploadPanelProps {
  onClose: () => void;
}

export default function DocumentUploadPanel({ onClose }: DocumentUploadPanelProps) {
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('');
  const [version, setVersion] = useState('');
  const [keywords, setKeywords] = useState('');
  const [confidence, setConfidence] = useState(0.85);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    console.log('Files dropped:', e.dataTransfer.files);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Indexing document:', { title, area, version, keywords, confidence });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl"
        style={{ backgroundColor: '#F7F7F7' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white px-8 py-6 border-b flex items-center justify-between" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '32px',
              fontWeight: '600',
              color: '#2B3777'
            }}
          >
            Gestión de Fuentes Documentales RAG
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all"
            style={{ color: '#717182', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="bg-white rounded-lg p-12 border-2 border-dashed transition-all cursor-pointer"
              style={{
                borderColor: isDragging ? '#00B8B3' : '#2B3777',
                backgroundColor: isDragging ? 'rgba(0, 184, 179, 0.05)' : '#FFFFFF'
              }}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'rgba(43, 55, 119, 0.1)' }}
                >
                  <Upload size={36} style={{ color: '#2B3777' }} />
                </div>
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#050A0E'
                  }}
                >
                  Arrastre y suelte su protocolo
                </h3>
                <p
                  className="mb-4"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '14px',
                    color: '#717182'
                  }}
                >
                  Soporta archivos PDF y DOCX · Tamaño máximo 50MB
                </p>
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg transition-all"
                  style={{
                    backgroundColor: '#2B3777',
                    color: '#FFFFFF',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '15px',
                    fontWeight: '600'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1f2858';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2B3777';
                  }}
                >
                  Buscar archivo
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="bg-white rounded-lg p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <FileText size={18} style={{ color: '#717182' }} />
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#050A0E'
                    }}
                  >
                    Título de Documento
                  </span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Protocolo de Manejo de Analgésicos UCI 2024"
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '15px',
                    borderColor: 'rgba(0, 0, 0, 0.1)'
                  }}
                  required
                />
              </div>

              {/* Area and Version */}
              <div className="grid grid-cols-2 gap-4">
                {/* Area */}
                <div>
                  <label className="flex items-center gap-2 mb-2">
                    <Tag size={18} style={{ color: '#717182' }} />
                    <span
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#050A0E'
                      }}
                    >
                      Área Médica
                    </span>
                  </label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '15px',
                      borderColor: 'rgba(0, 0, 0, 0.1)'
                    }}
                    required
                  >
                    <option value="">Seleccionar área</option>
                    <option value="uci">UCI - Unidad de Cuidados Intensivos</option>
                    <option value="cardiologia">Cardiología</option>
                    <option value="pediatria">Pediatría</option>
                    <option value="medicina-interna">Medicina Interna</option>
                    <option value="cirugia">Cirugía General</option>
                    <option value="neurologia">Neurología</option>
                  </select>
                </div>

                {/* Version */}
                <div>
                  <label className="flex items-center gap-2 mb-2">
                    <Hash size={18} style={{ color: '#717182' }} />
                    <span
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#050A0E'
                      }}
                    >
                      Versión
                    </span>
                  </label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="Ej: v2024.1"
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '15px',
                      borderColor: 'rgba(0, 0, 0, 0.1)'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Keywords */}
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <Tag size={18} style={{ color: '#717182' }} />
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#050A0E'
                    }}
                  >
                    Palabras Clave de Indexación
                  </span>
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Ej: acetaminofén, paracetamol, analgésico, dosis, UCI"
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '15px',
                    borderColor: 'rgba(0, 0, 0, 0.1)'
                  }}
                />
                <p
                  className="mt-2"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    color: '#717182'
                  }}
                >
                  Separar con comas. Esto mejora la precisión de búsqueda RAG.
                </p>
              </div>

              {/* Confidence Level */}
              <div>
                <label className="flex items-center gap-2 mb-3">
                  <Award size={18} style={{ color: '#717182' }} />
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#050A0E'
                    }}
                  >
                    Nivel de Confianza Clínica
                  </span>
                  <span
                    className="ml-auto px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: confidence >= 0.8 ? 'rgba(168, 207, 68, 0.15)' : 'rgba(0, 0, 0, 0.05)',
                      color: confidence >= 0.8 ? '#6B8E23' : '#717182',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                  >
                    {confidence.toFixed(2)}
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={confidence}
                  onChange={(e) => setConfidence(parseFloat(e.target.value))}
                  className="w-full"
                  style={{ accentColor: '#00B8B3' }}
                />
                <div className="flex justify-between mt-2">
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#717182' }}>Baja (0.0)</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#717182' }}>Alta (1.0)</span>
                </div>
                <p
                  className="mt-2"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    color: '#717182'
                  }}
                >
                  Este valor determina la prioridad del documento en las respuestas del sistema RAG.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 rounded-lg transition-all border"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                  color: '#050A0E',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '15px',
                  fontWeight: '600'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F7F7F7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
                style={{
                  backgroundColor: '#00B8B3',
                  color: '#FFFFFF',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '15px',
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
                <Upload size={20} />
                Indexar Documento
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
