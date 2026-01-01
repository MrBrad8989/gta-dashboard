"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { requestEvent } from "@/app/actions/eventActions";
import { FaHome, FaPlusCircle, FaList, FaBroadcastTower, FaCar, FaCubes, FaQuestionCircle, FaDiscord, FaClock, FaCheckCircle, FaTimesCircle, FaInfoCircle } from "react-icons/fa";

export default function UserEventPanel() {
  const { data: session } = useSession();
  
  // ESTADO DE PESTAÑAS (Igual que tu script.js)
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard | create | list
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myEvents, setMyEvents] = useState<any[]>([]);

  // ESTADO DEL FORMULARIO (Para la Preview en tiempo real)
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    needsCars: "false",
    needsRadio: "false",
    needsMapping: "false"
  });
  const [flyerPreview, setFlyerPreview] = useState<string>("");

  // Cargar eventos al iniciar (Simulado como tu JS cargaba datos)
  useEffect(() => {
    fetch('/api/my-events').then(res => res.json()).then(data => setMyEvents(data));
  }, [activeTab]);

  // Manejadores (Replican tu script.js)
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFile = (e: any) => {
    const file = e.target.files[0];
    if (file) setFlyerPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
        await requestEvent(formData);
        alert("Evento enviado correctamente.");
        setActiveTab("list"); // Volver a la lista tras enviar
        // Limpiar form
        setForm({ title: "", description: "", date: "", needsCars: "false", needsRadio: "false", needsMapping: "false" });
        setFlyerPreview("");
    } catch (error) {
        alert("Hubo un error al enviar.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!session) return <div className="p-10 text-white">Cargando...</div>;

  // Estadísticas reales calculadas al vuelo
  const stats = {
      total: myEvents.length,
      pending: myEvents.filter(e => e.status === 'PENDING').length,
      approved: myEvents.filter(e => e.status === 'APPROVED').length,
      rejected: myEvents.filter(e => e.status === 'REJECTED').length
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-gray-200 p-6 font-sans">
      
      {/* HEADER TIPO PANEL */}
      <header className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <FaBroadcastTower className="text-pink-500" /> Panel de Eventos
            </h1>
            <p className="text-sm text-gray-500">Gestión de solicitudes y estado</p>
          </div>
          <div className="flex items-center gap-3 bg-gray-800 px-4 py-2 rounded-full">
              <span className="text-sm font-bold">{session.user.name}</span>
              <img src={session.user.image || "/default-avatar.png"} className="w-8 h-8 rounded-full" />
          </div>
      </header>

      {/* NAVEGACIÓN INTERNA (Tabs) */}
      <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
          >
            <FaHome /> Inicio
          </button>
          <button 
            onClick={() => setActiveTab("create")}
            className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition ${activeTab === 'create' ? 'bg-indigo-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
          >
            <FaPlusCircle /> Solicitar Evento
          </button>
          <button 
            onClick={() => setActiveTab("list")}
            className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition ${activeTab === 'list' ? 'bg-indigo-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
          >
            <FaList /> Historial
          </button>
      </div>

      {/* --- VISTA 1: DASHBOARD (Tus tarjetas de colores) --- */}
      {activeTab === 'dashboard' && (
          <div className="animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <StatCard label="Total Eventos" value={stats.total} color="border-l-indigo-500" />
                  <StatCard label="Pendientes" value={stats.pending} color="border-l-yellow-500" />
                  <StatCard label="Aceptados" value={stats.approved} color="border-l-green-500" />
                  <StatCard label="Rechazados" value={stats.rejected} color="border-l-red-500" />
              </div>

              <div className="bg-yellow-900/30 border border-yellow-700 p-4 rounded-lg text-yellow-200 mb-8 flex items-center gap-3">
                  <FaClock />
                  <strong>Nota:</strong> Los eventos deben solicitarse con al menos 24 horas de antelación.
              </div>

              {/* Action Cards Grandes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div onClick={() => setActiveTab("create")} className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center gap-4 group">
                      <FaPlusCircle className="text-5xl text-gray-600 group-hover:text-indigo-500 transition" />
                      <span className="font-bold text-xl">Crear Nueva Solicitud</span>
                  </div>
                  <div onClick={() => setActiveTab("list")} className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center gap-4 group">
                      <FaList className="text-5xl text-gray-600 group-hover:text-indigo-500 transition" />
                      <span className="font-bold text-xl">Ver Mi Historial</span>
                  </div>
              </div>
          </div>
      )}

      {/* --- VISTA 2: CREAR (Formulario + Preview) --- */}
      {activeTab === 'create' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-fadeIn">
              
              {/* FORMULARIO (Izquierda) */}
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <div className="mb-6 bg-[#5865F2] p-4 rounded flex items-center gap-3 text-white">
                      <FaDiscord className="text-2xl" />
                      <div className="text-sm">
                          <strong>¡IMPORTANTE!</strong> Debes estar presente en Discord. Se abrirá un ticket.
                      </div>
                  </div>

                  <form action={handleSubmit} className="space-y-4">
                      {/* ID Discord */}
                      <div>
                          <label className="block text-xs font-bold uppercase text-gray-400 mb-1">ID Usuario Discord</label>
                          <input type="text" name="userId" defaultValue={session.user.discordId || ""} className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-indigo-500 outline-none" placeholder="Ej: 351278352..." required />
                      </div>

                      {/* Título */}
                      <div>
                          <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Título del Evento</label>
                          <input type="text" name="title" onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-indigo-500 outline-none" required />
                      </div>

                      {/* Flyer */}
                      <div>
                          <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Flyer del Evento</label>
                          <input type="file" name="flyer" accept="image/*" onChange={handleFile} className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-sm text-gray-300" required />
                          <p className="text-xs text-gray-500 mt-1">Recomendado: 1920x1080 (JPG, PNG)</p>
                      </div>

                      {/* Descripción */}
                      <div>
                          <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Descripción</label>
                          <textarea name="description" rows={4} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-indigo-500 outline-none" required></textarea>
                          <p className="text-xs text-gray-500 mt-1 text-right">Soporta Markdown</p>
                      </div>

                      {/* Fecha */}
                      <div>
                          <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Fecha y Hora</label>
                          <input type="datetime-local" name="date" onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-indigo-500 outline-none" required />
                      </div>

                      <hr className="border-gray-700 my-6" />
                      <h3 className="text-[#f0ad4e] font-bold mb-4">Soporte Técnico</h3>

                      {/* Coches */}
                      <div className="bg-gray-900/50 p-4 rounded border border-gray-700">
                          <div className="flex justify-between items-center mb-2">
                              <label className="font-bold flex items-center gap-2 text-sm"><FaCar /> ¿Coches?</label>
                              <select name="needsCars" onChange={handleChange} className="bg-gray-800 border border-gray-600 rounded p-1 text-sm">
                                  <option value="false">No</option>
                                  <option value="true">Sí</option>
                              </select>
                          </div>
                          {form.needsCars === "true" && (
                              <textarea name="carsDesc" placeholder="Modelo, color y tuning..." className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-sm text-white mt-2"></textarea>
                          )}
                      </div>

                      {/* Radio */}
                      <div className="bg-gray-900/50 p-4 rounded border border-gray-700">
                          <div className="flex justify-between items-center">
                              <label className="font-bold flex items-center gap-2 text-sm"><FaBroadcastTower /> ¿Emisora?</label>
                              <select name="needsRadio" onChange={handleChange} className="bg-gray-800 border border-gray-600 rounded p-1 text-sm">
                                  <option value="false">No</option>
                                  <option value="true">Sí</option>
                              </select>
                          </div>
                      </div>

                      {/* Mapeo */}
                      <div className="bg-gray-900/50 p-4 rounded border border-gray-700">
                          <div className="flex justify-between items-center mb-2">
                              <label className="font-bold flex items-center gap-2 text-sm"><FaCubes /> ¿Mapeo?</label>
                              <select name="needsMapping" onChange={handleChange} className="bg-gray-800 border border-gray-600 rounded p-1 text-sm">
                                  <option value="false">No</option>
                                  <option value="true">Sí</option>
                              </select>
                          </div>
                          {form.needsMapping === "true" && (
                              <div className="space-y-2 mt-2">
                                  <textarea name="mappingDesc" placeholder="Descripción del mapeo..." className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-sm text-white"></textarea>
                                  <label className="block text-xs text-gray-400">Fotos referencia:</label>
                                  <input type="file" name="mappingFiles" multiple className="w-full text-xs text-gray-300" />
                              </div>
                          )}
                      </div>

                      <button disabled={isSubmitting} type="submit" className="w-full bg-[#5865f2] hover:bg-indigo-600 text-white font-bold py-4 rounded-lg shadow-lg mt-4 transition disabled:opacity-50">
                          {isSubmitting ? "ENVIANDO..." : "ENVIAR SOLICITUD"}
                      </button>
                  </form>
              </div>

              {/* PREVIEW (Derecha) - Estilo IDÉNTICO a tu HTML */}
              <div className="hidden xl:block sticky top-8 h-fit">
                  <h3 className="text-gray-500 font-bold mb-3 uppercase text-sm">Vista Previa (Anuncios)</h3>
                  <div className="bg-[#36393f] p-4 rounded-lg shadow-xl border border-[#2f3136] max-w-md mx-auto">
                      {/* Discord Header */}
                      <div className="flex gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">BOT</div>
                          <div>
                              <div className="flex items-baseline gap-2">
                                  <span className="text-white font-bold text-sm">GTAWEvent</span>
                                  <span className="bg-[#5865F2] text-white text-[10px] px-1 rounded h-fit">BOT</span>
                                  <span className="text-[#72767d] text-xs">Hoy a las 12:00</span>
                              </div>
                          </div>
                      </div>

                      {/* Embed Content */}
                      <div className="bg-[#2f3136] border-l-4 border-[#5865F2] p-4 rounded-r grid gap-2">
                          <div className="text-white font-bold text-base">{form.title || "Título del Evento"}</div>
                          <div className="text-[#dcddde] text-sm whitespace-pre-wrap">{form.description || "La descripción aparecerá aquí..."}</div>
                          
                          <div className="grid gap-1 mt-2">
                                <div className="text-sm">
                                    <span className="text-[#b9bbbe] font-bold inline-block w-6">🕒</span>
                                    <span className="text-[#dcddde]">{form.date ? new Date(form.date).toLocaleString() : "--/--/---- --:--"}</span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-[#b9bbbe] font-bold inline-block w-6">👥</span>
                                    <span className="text-[#dcddde]">0 personas</span>
                                </div>
                          </div>

                          {/* Image Preview */}
                          <div className="mt-2 w-full bg-[#202225] rounded h-48 flex items-center justify-center overflow-hidden">
                              {flyerPreview ? (
                                  <img src={flyerPreview} className="w-full h-full object-cover" />
                              ) : (
                                  <span className="text-[#72767d] text-xs">Previsualización de imagen</span>
                              )}
                          </div>

                          <div className="text-[#72767d] text-xs mt-1">Evento solicitado al Equipo de Eventos del PM.</div>
                      </div>
                  </div>
              </div>

          </div>
      )}

      {/* --- VISTA 3: LISTA (Historial) --- */}
      {activeTab === 'list' && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden animate-fadeIn">
              <div className="p-4 border-b border-gray-700 font-bold flex items-center gap-2 text-white">
                  <FaList /> Historial de Eventos
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                    <thead className="bg-gray-900 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="p-4">Título</th>
                            <th className="p-4">Fecha</th>
                            <th className="p-4">Estado</th>
                            <th className="p-4 text-center">Detalles</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {myEvents.map(event => (
                            <tr key={event.id} className="hover:bg-gray-700/50 transition">
                                <td className="p-4 font-bold text-white">{event.title}</td>
                                <td className="p-4">{new Date(event.eventDate).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <StatusBadge status={event.status} />
                                </td>
                                <td className="p-4 text-center">
                                    <button className="text-indigo-400 hover:text-white transition" title="Ver info completa">
                                        <FaInfoCircle />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {myEvents.length === 0 && (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">No hay eventos en tu historial.</td></tr>
                        )}
                    </tbody>
                </table>
              </div>
          </div>
      )}
    </div>
  );
}

// COMPONENTE TARJETA SIMPLE (Para el Dashboard)
function StatCard({ label, value, color }: any) {
    return (
        <div className={`bg-gray-800 p-6 rounded-lg border-l-4 ${color} shadow-lg`}>
            <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
            <p className="text-gray-400 uppercase text-xs font-bold">{label}</p>
        </div>
    );
}

// COMPONENTE BADGE
function StatusBadge({ status }: { status: string }) {
    if (status === 'APPROVED') return <span className="px-2 py-1 rounded bg-green-900/30 text-green-400 border border-green-800 text-xs font-bold flex w-fit items-center gap-1"><FaCheckCircle /> ACEPTADO</span>;
    if (status === 'REJECTED') return <span className="px-2 py-1 rounded bg-red-900/30 text-red-400 border border-red-800 text-xs font-bold flex w-fit items-center gap-1"><FaTimesCircle /> RECHAZADO</span>;
    return <span className="px-2 py-1 rounded bg-yellow-900/30 text-yellow-400 border border-yellow-800 text-xs font-bold flex w-fit items-center gap-1"><FaClock /> PENDIENTE</span>;
}