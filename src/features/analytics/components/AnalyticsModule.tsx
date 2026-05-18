import { useRef } from "react";
import jsPDF from "jspdf";
import {
  Download,
  Bot,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Activity,
  BarChart3,
  TrendingUp,
  Clock,
  Users,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const usageData = [
  { day: "Lun", consultas: 45 },
  { day: "Mar", consultas: 62 },
  { day: "Mié", consultas: 58 },
  { day: "Jue", consultas: 80 },
  { day: "Vie", consultas: 73 },
  { day: "Sáb", consultas: 38 },
  { day: "Dom", consultas: 29 },
];

const protocolData = [
  { name: "Sepsis", value: 82 },
  { name: "Antibióticos", value: 67 },
  { name: "UCI", value: 54 },
  { name: "Pediatría", value: 41 },
];

const adherenceData = [
  { name: "Cumple", value: 72 },
  { name: "Parcial", value: 20 },
  { name: "No cumple", value: 8 },
];

const COLORS = ["#22C55E", "#F59E0B", "#EF4444"];

type InsightType = "warning" | "danger" | "success" | "info";

export default function AnalyticsModule() {
  const reportRef = useRef<HTMLDivElement>(null);

  const downloadPDF = () => {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 297;
    const pageHeight = 210;

    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    pdf.setFillColor(37, 99, 235);
    pdf.rect(0, 0, pageWidth, 34, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(11);
    pdf.text("Panel inteligente del sistema RAG", 15, 12);

    pdf.setFontSize(24);
    pdf.text("Reporte Analytics IA", 15, 25);

    pdf.setFontSize(9);
    pdf.text(
      `Generado por Dr. Juan Sandoval · ${new Date().toLocaleDateString()}`,
      205,
      18
    );

    const card = (
      x: number,
      y: number,
      w: number,
      h: number,
      title: string,
      value: string,
      subtitle: string,
      color: [number, number, number]
    ) => {
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(x, y, w, h, 4, 4, "F");

      pdf.setDrawColor(226, 232, 240);
      pdf.roundedRect(x, y, w, h, 4, 4, "S");

      pdf.setFillColor(color[0], color[1], color[2]);
      pdf.roundedRect(x + 5, y + 6, 4, h - 12, 2, 2, "F");

      pdf.setFontSize(9);
      pdf.setTextColor(71, 85, 105);
      pdf.text(title, x + 13, y + 12);

      pdf.setFontSize(22);
      pdf.setTextColor(15, 23, 42);
      pdf.text(value, x + 13, y + 27);

      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text(subtitle, x + 13, y + 36);
    };

    card(15, 44, 62, 42, "Consultas IA", "856", "+12% este mes", [37, 99, 235]);
    card(83, 44, 62, 42, "Documentos analizados", "1,284", "+8% esta semana", [14, 165, 233]);
    card(151, 44, 62, 42, "Adherencia GPC", "92%", "Nivel óptimo", [34, 197, 94]);
    card(219, 44, 62, 42, "Alertas clínicas", "37", "5 requieren revisión", [245, 158, 11]);

    const sectionTitle = (text: string, x: number, y: number) => {
      pdf.setFontSize(14);
      pdf.setTextColor(15, 23, 42);
      pdf.text(text, x, y);

      pdf.setDrawColor(37, 99, 235);
      pdf.setLineWidth(0.8);
      pdf.line(x, y + 3, x + 42, y + 3);
    };

    sectionTitle("Resumen analítico", 15, 105);
    sectionTitle("Insights IA", 155, 105);

    const bullet = (text: string, x: number, y: number) => {
      pdf.setFillColor(37, 99, 235);
      pdf.circle(x, y - 1.5, 1.1, "F");

      pdf.setFontSize(9.5);
      pdf.setTextColor(51, 65, 85);
      pdf.text(text, x + 5, y);
    };

    bullet("Mayor actividad del chat IA registrada el jueves.", 15, 120);
    bullet("Consultas frecuentes agrupadas por intención clínica y tema principal.", 15, 132);
    bullet("Adherencia clínica general en nivel óptimo con 92%.", 15, 144);
    bullet("37 alertas clínicas registradas; 5 requieren revisión prioritaria.", 15, 156);

    bullet("Aumento de consultas relacionadas con sepsis durante la semana.", 155, 120);
    bullet("Baja adherencia detectada en protocolo antibiótico.", 155, 132);
    bullet("Alta consulta de guías UCI con buena consistencia clínica.", 155, 144);
    bullet("Horario con mayor actividad: 2:00 p.m. a 5:00 p.m.", 155, 156);

    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(15, 168, 126, 28, 4, 4, "F");
    pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(15, 168, 126, 28, 4, 4, "S");

    pdf.setFontSize(10);
    pdf.setTextColor(15, 23, 42);
    pdf.text("Consultas destacadas", 22, 177);

    const consultas = [
      "Manejo inicial de sepsis en paciente adulto.",
      "Uso de antibióticos según protocolo institucional.",
      "Criterios de ingreso a UCI.",
    ];

    let consultaY = 185;

    consultas.forEach((consulta) => {
      const lines = pdf.splitTextToSize(`• ${consulta}`, 105);
      const visibleLines = lines.slice(0, 2);

      pdf.setFontSize(7.5);
      pdf.setTextColor(51, 65, 85);
      pdf.text(visibleLines, 22, consultaY);

      consultaY += visibleLines.length * 4 + 2;
    });

    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(155, 168, 126, 28, 4, 4, "F");
    pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(155, 168, 126, 28, 4, 4, "S");

    pdf.setFontSize(10);
    pdf.setTextColor(15, 23, 42);
    pdf.text("Actividad reciente", 162, 177);

    pdf.setFontSize(8);
    pdf.setTextColor(51, 65, 85);
    pdf.text("Dr. Juan Sandoval consultó guía de antibióticos · 4:30 p.m.", 162, 186);
    pdf.text("Medicina interna revisó protocolo de sepsis · 3:12 p.m.", 162, 192);

    pdf.setDrawColor(203, 213, 225);
    pdf.line(15, 201, 282, 201);

    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text("Sistema RAG Hospitalario v2.0", 15, 206);
    pdf.text("Reporte generado automáticamente", 220, 206);

    const today = new Date().toISOString().split("T")[0];
    pdf.save(`analytics-report-${today}.pdf`);
  };

  return (
    <main className="min-h-screen overflow-y-auto bg-[#F8FAFC] p-6 lg:p-8">
      <div ref={reportRef} className="mx-auto w-[1200px] rounded-2xl bg-white p-8 shadow-sm">
        <section className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-5">
            <div>
              <p className="text-sm font-semibold text-[#2563EB]">
                Panel inteligente del sistema RAG
              </p>
              <h1 className="mt-1 text-4xl font-bold text-[#111827]">Analytics</h1>
              <p className="mt-2 max-w-3xl text-sm text-[#6B7280]">
                Métricas de uso del chat IA, documentos analizados, protocolos
                consultados, adherencia clínica y actividad reciente.
              </p>
            </div>

            <button
              onClick={downloadPDF}
              className="no-print flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1D4ED8]"
            >
              <Download size={18} />
              Descargar PDF
            </button>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-4 gap-5">
          <KpiCard title="Consultas IA" value="856" change="+12% este mes" icon={<Bot />} color="#2563EB" />
          <KpiCard title="Documentos analizados" value="1,284" change="+8% esta semana" icon={<FileText />} color="#0EA5E9" />
          <KpiCard title="Adherencia GPC" value="92%" change="Nivel óptimo" icon={<ShieldCheck />} color="#22C55E" />
          <KpiCard title="Alertas clínicas" value="37" change="5 requieren revisión" icon={<AlertTriangle />} color="#F59E0B" />
        </section>

        <section className="mb-6 grid grid-cols-2 gap-6">
          <Card title="Consultas al chat IA por día" icon={<Activity size={18} />}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="consultas" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Protocolos más consultados" icon={<BarChart3 size={18} />}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={protocolData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </section>

        <section className="grid grid-cols-3 gap-6">
          <Card title="Adherencia a guías clínicas" icon={<TrendingUp size={18} />}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={adherenceData} dataKey="value" innerRadius={60} outerRadius={90} paddingAngle={4}>
                  {adherenceData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex justify-center gap-4 text-sm text-[#6B7280]">
              <span>🟢 Cumple</span>
              <span>🟡 Parcial</span>
              <span>🔴 No cumple</span>
            </div>
          </Card>

          <Card title="Insights IA" icon={<Bot size={18} />}>
            <div className="space-y-3 text-sm">
              <Insight type="warning" text="Aumento de consultas relacionadas con sepsis durante esta semana." />
              <Insight type="danger" text="Baja adherencia detectada en protocolo antibiótico." />
              <Insight type="success" text="Alta consulta de guías UCI con buena consistencia clínica." />
              <Insight type="info" text="El horario con mayor actividad es entre 2:00 p.m. y 5:00 p.m." />
            </div>
          </Card>

          <Card title="Actividad reciente" icon={<Clock size={18} />}>
            <div className="space-y-4 text-sm">
              <ActivityItem user="Dr. Juan Sandoval" action="Consultó guía de antibióticos" time="4:30 p.m." />
              <ActivityItem user="Medicina interna" action="Revisó protocolo de sepsis" time="3:12 p.m." />
              <ActivityItem user="UCI" action="Analizó documento clínico" time="2:45 p.m." />
              <ActivityItem user="Pediatría" action="Consultó recomendaciones de manejo" time="1:20 p.m." />
            </div>
          </Card>
        </section>

        <section className="mt-6 grid grid-cols-3 gap-5">
          <MiniStat icon={<Users size={18} />} title="Usuarios activos" value="24" description="Usuarios con actividad registrada hoy." />
          <MiniStat icon={<FileText size={18} />} title="Documentos nuevos" value="18" description="Archivos cargados y procesados esta semana." />
          <MiniStat icon={<ShieldCheck size={18} />} title="Respuestas verificadas" value="96%" description="Consultas con fuente documental asociada." />
        </section>
      </div>
    </main>
  );
}

function KpiCard({
  title,
  value,
  change,
  icon,
  color,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {icon}
      </div>
      <p className="text-sm text-[#6B7280]">{title}</p>
      <h2 className="mt-1 text-3xl font-bold text-[#111827]">{value}</h2>
      <p className="mt-2 text-xs font-medium text-[#6B7280]">{change}</p>
    </div>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <div className="text-[#2563EB]">{icon}</div>
        <h3 className="font-semibold text-[#111827]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Insight({ text, type }: { text: string; type: InsightType }) {
  const styles: Record<InsightType, string> = {
    warning: "bg-[#FEF3C7] text-[#92400E]",
    danger: "bg-[#FEE2E2] text-[#991B1B]",
    success: "bg-[#DCFCE7] text-[#166534]",
    info: "bg-[#DBEAFE] text-[#1E40AF]",
  };

  return <div className={`rounded-xl px-4 py-3 ${styles[type]}`}>{text}</div>;
}

function ActivityItem({
  user,
  action,
  time,
}: {
  user: string;
  action: string;
  time: string;
}) {
  return (
    <div className="border-b border-[#E5E7EB] pb-3 last:border-0">
      <p className="font-medium text-[#111827]">{user}</p>
      <p className="text-[#6B7280]">{action}</p>
      <p className="mt-1 text-xs text-[#9CA3AF]">{time}</p>
    </div>
  );
}

function MiniStat({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-[#2563EB]">
        {icon}
        <p className="font-semibold text-[#111827]">{title}</p>
      </div>
      <p className="text-3xl font-bold text-[#111827]">{value}</p>
      <p className="mt-2 text-sm text-[#6B7280]">{description}</p>
    </div>
  );
}