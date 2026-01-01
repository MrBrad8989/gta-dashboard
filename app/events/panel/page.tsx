"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { requestEvent } from "@/app/actions/eventActions"; // La acción nueva
import { FaHome, FaPlusCircle, FaList, FaBroadcastTower, FaCar, FaCubes, FaQuestionCircle, FaDiscord, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function UserEventPanel() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, create, list
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myEvents, setMyEvents] = useState<any[]>([]);

  // Estados del Formulario (Para la vista previa)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    needsCars: "false",
    needsRadio: "false",
    needsMapping: "false"
  });
  const [previewImage, setPreviewImage] = useState<string>("");

  // Cargar eventos (Simulado fetch a una API interna o action - aquí haremos fetch simple)
  // Nota: Para hacerlo 100% server-side en la carga inicial, deberíamos pasar props, 
  // pero como es un panel interactivo tipo SPA, usaremos un useEffect o un Server Component padre.
  // Para simplificar y mantener el estilo SPA del HTML, haremos fetch aquí.
  useEffect(() => {
     fetch('/api/my-events').then(res => res.json()).then(data => setMyEvents(data));
  }, [activeTab]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  const handleSubmit = async (formDataPayload: FormData) => {
    setIsSubmitting(true);
    try {
        await requestEvent(formDataPayload);
        alert("¡Evento solicitado con éxito!");
        setActiveTab("list");
        setFormData({ title: "", description: "", date: "", needsCars: "false", needsRadio: "false", needsMapping: "false" });
        setPreviewImage("");
    } catch (error) {
        alert("Error al enviar evento");
    } finally {
        setIsSubmitting(false);
    }
  };

  // Cálculos de Stats
  const stats = {
      total: myEvents.length,
      pending: myEvents.filter(e => e.status === 'PENDING').length,
      approved: myEvents.filter(e => e.status === 'APPROVED').length,
      rejected: myEvents.filter(e => e.status === 'REJECTED').length
  };

  if (!session) return <div className="p-8">Cargando sesión...</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 md:p-8 flex gap-8">
       
       {/* SIDEBAR (Estilo del HTML original integrado en el diseño) */}
       <div className="w-64 hidden md:block space-y-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow mb-4 border-l-4 border-indigo-500">
              <h3 className="font-bold text-lg">Panel de Eventos</h3>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                      <img src={session.user.image || "/default-avatar.png"} alt="Avatar" />
                  </div>
                  <span>{session.user.name}</span>
              </div>
          </div>
          
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`w-full text-left p-4 rounded-xl flex items-center gap-3 transition ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
             <FaHome /> Inicio
          </button>
          <button 
            onClick={() => setActiveTab("create")}
            className={`w-full text-left p-4 rounded-xl flex items-center gap-3 transition ${activeTab === 'create' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
             <FaPlusCircle /> Solicitar Evento
          </button>
          <button 
            onClick={() => setActiveTab("list")}
            className={`w-full text-left p-4 rounded-xl flex items-center gap-3 transition ${activeTab === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
             <FaList /> Historial
          </button>
       </div>

       {/* MAIN CONTENT */}
       <div className="flex-1">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
              <div className="space-y-6">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard title="Total Eventos" count={stats.total} color="border-l-blue-500" />
                    <StatCard title="Pendientes" count={stats.pending} color="border-l-yellow-500" />
                    <StatCard title="Aceptados" count={stats.approved} color="border-l-green-500" />
                    <StatCard title="Rechazados" count={stats.rejected} color="border-l-red-500" />
                 </div>

                 <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-4 rounded-lg text-yellow-800 dark:text-yellow-200 text-sm flex gap-3 items-center">
                    <FaClock className="text-xl" />
                    <strong>Nota:</strong> Los eventos deben solicitarse con al menos 24 horas de antelación para garantizar disponibilidad del Staff.
                 </div>

                 <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow text-center space-y-4">
                    <h2 className="text-2xl font-bold flex items-center justify-center gap-2"><FaBroadcastTower /> Gestión Rápida</h2>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => setActiveTab('create')} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"><FaPlusCircle /> Crear Nuevo</button>
                        <button onClick={() => setActiveTab('list')} className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"><FaList /> Ver Lista</button>
                    </div>
                 </div>
              </div>
          )}

          {/* CREATE EVENT TAB */}
          {activeTab === 'create' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-fadeIn">
                 {/* FORMULARIO */}
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2"><FaPlusCircle className="text-indigo-500"/> Nuevo Evento</h2>
                    </div>

                    <div className="bg-[#5865F2] text-white p-4 rounded-lg mb-6 flex items-center gap-3 text-sm">
                        <FaDiscord className="text-2xl" />
                        <div>
                            <strong>¡IMPORTANTE!</strong><br />Debes estar presente en Discord. Se usará tu usuario para contactarte.
                        </div>
                    </div>

                    <form action={handleSubmit} className="space-y-4">
                        {/* ID Discord (Opcional si ya lo tenemos en session, pero el HTML lo pedía) */}
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">ID Usuario Discord</label>
                            <input type="text" name="userId" defaultValue={session.user.discordId || ""} className="w-full p-2 rounded bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600" required />
                            <details className="text-xs text-gray-500 mt-1 cursor-pointer">
                                <summary className="flex items-center gap-1"><FaQuestionCircle /> ¿Cómo obtengo mi ID?</summary>
                                <p className="pl-4 mt-1">Ajustes Discord {'>'} Avanzado {'>'} Modo Desarrollador. Clic derecho en tu nombre {'>'} Copiar ID.</p>
                            </details>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">Título del Evento</label>
                            <input type="text" name="title" onChange={handleInputChange} className="w-full p-2 rounded bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600" required />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">Flyer (Imagen)</label>
                            <input type="file" name="flyer" accept="image/*" onChange={handleFileChange} className="w-full text-xs" required />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">Descripción</label>
                            <textarea name="description" rows={4} onChange={handleInputChange} className="w-full p-2 rounded bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600" required></textarea>
                            <p className="text-[10px] text-gray-400 text-right mt-1">Soporta Markdown básico</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">Fecha y Hora</label>
                            <input type="datetime-local" name="date" onChange={handleInputChange} className="w-full p-2 rounded bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600" required />
                        </div>

                        <hr className="border-gray-200 dark:border-gray-700 my-4" />
                        
                        <h3 className="text-yellow-600 font-bold mb-2">Soporte Técnico</h3>

                        {/* COCHES */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-bold flex items-center gap-2"><FaCar /> ¿Coches?</label>
                                <select name="needsCars" onChange={handleInputChange} className="p-1 rounded bg-gray-100 dark:bg-gray-900 border text-sm">
                                    <option value="false">No</option>
                                    <option value="true">Sí</option>
                                </select>
                            </div>
                            {formData.needsCars === "true" && (
                                <textarea name="carsDesc" placeholder="Ej: Sultan Classic negro..." className="w-full p-2 text-sm rounded bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 animate-fadeIn"></textarea>
                            )}
                        </div>

                        {/* RADIO */}
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold flex items-center gap-2"><FaBroadcastTower /> ¿Emisora?</label>
                            <select name="needsRadio" onChange={handleInputChange} className="p-1 rounded bg-gray-100 dark:bg-gray-900 border text-sm">
                                <option value="false">No</option>
                                <option value="true">Sí</option>
                            </select>
                        </div>

                        {/* MAPEO */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-bold flex items-center gap-2"><FaCubes /> ¿Mapeo?</label>
                                <select name="needsMapping" onChange={handleInputChange} className="p-1 rounded bg-gray-100 dark:bg-gray-900 border text-sm">
                                    <option value="false">No</option>
                                    <option value="true">Sí</option>
                                </select>
                            </div>
                            {formData.needsMapping === "true" && (
                                <div className="space-y-2 animate-fadeIn">
                                    <textarea name="mappingDesc" placeholder="Descripción del mapeo..." className="w-full p-2 text-sm rounded bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600"></textarea>
                                    <input type="file" name="mappingFiles" multiple accept="image/*" className="w-full text-xs" />
                                </div>
                            )}
                        </div>

                        <button disabled={isSubmitting} type="submit" className="w-full bg-[#5865f2] hover:bg-indigo-600 text-white font-bold py-3 rounded-lg shadow transition mt-4 disabled:opacity-50">
                            {isSubmitting ? "ENVIANDO..." : "ENVIAR SOLICITUD"}
                        </button>
                    </form>
                 </div>

                 {/* VISTA PREVIA (Estilo Discord exacto del HTML) */}
                 <div className="hidden xl:block">
                    <h3 className="text-gray-400 mb-2 text-sm uppercase font-bold">Vista Previa (Anuncio)</h3>
                    <div className="bg-[#36393f] p-4 rounded-lg shadow-lg border border-[#2f3136] max-w-md mx-auto">
                        <div className="flex gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">BOT</div>
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-white font-bold text-sm">GTAWEvent</span>
                                    <span className="bg-[#5865F2] text-white text-[10px] px-1 rounded">BOT</span>
                                    <span className="text-[#72767d] text-xs">Hoy a las 12:00</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* EMBED */}
                        <div className="bg-[#2f3136] border-l-4 border-[#5865f2] p-4 rounded-r grid gap-2">
                            <div className="text-white font-bold text-base">{formData.title || "Título del Evento"}</div>
                            <div className="text-[#dcddde] text-sm whitespace-pre-wrap">{formData.description || "La descripción aparecerá aquí..."}</div>
                            
                            <div className="grid gap-1 mt-2">
                                <div className="flex gap-2 text-sm">
                                    <span className="text-[#b9bbbe] font-bold">🕒 Fecha:</span>
                                    <span className="text-[#dcddde]">{formData.date ? new Date(formData.date).toLocaleString() : "--/--/----"}</span>
                                </div>
                            </div>

                            {previewImage && (
                                <img src={previewImage} alt="Preview" className="w-full rounded mt-2 object-cover max-h-60" />
                            )}

                            <div className="text-[#72767d] text-xs mt-1 border-t border-[#40444b] pt-1">
                                Evento solicitado al Equipo de Eventos del PM.
                            </div>
                        </div>
                    </div>
                 </div>
              </div>
          )}

          {/* LIST TAB */}
          {activeTab === 'list' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold flex items-center gap-2">
                      <FaList /> Historial de Eventos
                  </div>
                  <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 uppercase text-xs">
                          <tr>
                              <th className="p-4">Título</th>
                              <th className="p-4">Fecha Evento</th>
                              <th className="p-4">Estado</th>
                              <th className="p-4">ID Ticket</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {myEvents.map(event => (
                              <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                  <td className="p-4 font-bold text-gray-800 dark:text-white">{event.title}</td>
                                  <td className="p-4 text-gray-500">{new Date(event.eventDate).toLocaleDateString()}</td>
                                  <td className="p-4">
                                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                                          event.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                          event.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                          'bg-yellow-100 text-yellow-700'
                                      }`}>
                                          {event.status}
                                      </span>
                                  </td>
                                  <td className="p-4 font-mono text-indigo-500">#{event.id}</td>
                              </tr>
                          ))}
                          {myEvents.length === 0 && (
                              <tr><td colSpan={4} className="p-8 text-center text-gray-400">No hay eventos</td></tr>
                          )}
                      </tbody>
                  </table>
              </div>
          )}

       </div>
    </div>
  );
}

// Componente auxiliar para Tarjetas
function StatCard({ title, count, color }: any) {
    return (
        <div className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow border-l-4 ${color}`}>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{count}</h3>
            <p className="text-gray-500 text-sm uppercase">{title}</p>
        </div>
    );
}