"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { requestEvent } from "@/app/actions/eventActions";
import {
  FaHome,
  FaPlusCircle,
  FaList,
  FaBroadcastTower,
  FaCar,
  FaCubes,
  FaDiscord,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaCloudUploadAlt,
  FaFileImage,
  FaFolderOpen,
  FaImage,
} from "react-icons/fa";
import UserAvatar from "@/components/UserAvatar";

export default function UserEventPanel() {
  const { data: session } = useSession();

  // ESTADOS
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myEvents, setMyEvents] = useState<any[]>([]);

  // ESTADO FORMULARIO
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    needsCars: "false",
    needsRadio: "false",
    needsMapping: "false",
  });
  const [flyerPreview, setFlyerPreview] = useState<string>("");
  const [flyerName, setFlyerName] = useState<string>("");
  const [mappingFilesName, setMappingFilesName] = useState<string>("");

  // CLASES DE ESTILO COMUNES (Para que todos los inputs se vean igual de bien)
  const inputClass =
    "w-full p-3 rounded-lg border outline-none transition-all duration-200 " +
    "bg-white dark:bg-black/20 " + // Fondo: Blanco en día, Oscuro hundido en noche
    "border-gray-300 dark:border-gray-600 " + // Borde visible
    "text-gray-900 dark:text-white " + // Texto muy legible
    "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 " + // Foco
    "placeholder-gray-400 dark:placeholder-gray-500";

  const selectClass =
    "p-2 rounded-lg border outline-none cursor-pointer transition-all " +
    "bg-white dark:bg-black/20 " +
    "border-gray-300 dark:border-gray-600 " +
    "text-gray-900 dark:text-white text-sm font-bold";

  useEffect(() => {
    fetch("/api/my-events")
      .then((res) => res.json())
      .then((data) => setMyEvents(data));
  }, [activeTab]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setFlyerPreview(URL.createObjectURL(file));
      setFlyerName(file.name);
    }
  };

  const handleMappingFiles = (e: any) => {
    const files = e.target.files;
    if (files.length > 0) {
      setMappingFilesName(`${files.length} archivos seleccionados`);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await requestEvent(formData);
      alert("Evento enviado correctamente.");
      setActiveTab("list");
      // Reset
      setForm({
        title: "",
        description: "",
        date: "",
        needsCars: "false",
        needsRadio: "false",
        needsMapping: "false",
      });
      setFlyerPreview("");
      setFlyerName("");
      setMappingFilesName("");
    } catch (error) {
      alert("Hubo un error al enviar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session)
    return (
      <div className="p-10 text-center dark:text-white">Cargando sesión...</div>
    );

  const stats = {
    total: myEvents.length,
    pending: myEvents.filter((e) => e.status === "PENDING").length,
    approved: myEvents.filter((e) => e.status === "APPROVED").length,
    rejected: myEvents.filter((e) => e.status === "REJECTED").length,
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#111827] text-gray-800 dark:text-gray-200 p-4 md:p-8 font-sans transition-colors duration-300">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-300 dark:border-gray-700 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FaBroadcastTower className="text-pink-600 dark:text-pink-500" />{" "}
            Panel de Eventos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestión de solicitudes y estado
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
          <span className="text-sm font-bold">{session.user.name}</span>
          <UserAvatar
            discordId={session.user.discordId}
            avatar={session.user.image || null}
            name={session.user.name}
            size="md"
            className="border border-gray-200 dark:border-gray-600"
          />{" "}
        </div>
      </header>

      {/* NAVEGACIÓN (TABS) */}
      <div className="flex flex-wrap gap-4 mb-8">
        <TabButton
          active={activeTab === "dashboard"}
          onClick={() => setActiveTab("dashboard")}
          icon={<FaHome />}
        >
          Inicio
        </TabButton>
        <TabButton
          active={activeTab === "create"}
          onClick={() => setActiveTab("create")}
          icon={<FaPlusCircle />}
        >
          Solicitar Evento
        </TabButton>
        <TabButton
          active={activeTab === "list"}
          onClick={() => setActiveTab("list")}
          icon={<FaList />}
        >
          Historial
        </TabButton>
      </div>

      {/* --- VISTA DASHBOARD --- */}
      {activeTab === "dashboard" && (
        <div className="animate-fadeIn space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              label="Total Eventos"
              value={stats.total}
              color="border-l-indigo-500"
            />
            <StatCard
              label="Pendientes"
              value={stats.pending}
              color="border-l-yellow-500"
            />
            <StatCard
              label="Aceptados"
              value={stats.approved}
              color="border-l-green-500"
            />
            <StatCard
              label="Rechazados"
              value={stats.rejected}
              color="border-l-red-500"
            />
          </div>

          <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 p-4 rounded-lg text-yellow-800 dark:text-yellow-200 flex items-center gap-3 shadow-sm">
            <FaClock className="text-xl" />
            <strong>Nota:</strong> Los eventos deben solicitarse con al menos 7
            días de antelación.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActionCard
              onClick={() => setActiveTab("create")}
              icon={<FaPlusCircle />}
              title="Crear Nueva Solicitud"
            />
            <ActionCard
              onClick={() => setActiveTab("list")}
              icon={<FaList />}
              title="Ver Mi Historial"
            />
          </div>
        </div>
      )}

      {/* --- VISTA CREAR (Formulario) --- */}
      {activeTab === "create" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-fadeIn">
          {/* FORMULARIO */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="mb-6 bg-[#5865F2] p-4 rounded-lg flex items-center gap-3 text-white shadow">
              <FaDiscord className="text-3xl" />
              <div className="text-sm leading-tight">
                <strong>¡IMPORTANTE!</strong>
                <br />
                Debes estar en Discord. Se usará tu usuario para contactarte.
              </div>
            </div>

            <form action={handleSubmit} className="space-y-6">
              {/* ID Discord */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">
                  ID Usuario Discord
                </label>
                <input
                  type="text"
                  name="userId"
                  defaultValue={session.user.discordId || ""}
                  className={inputClass}
                  placeholder="Ej: 351278352..."
                  required
                />
              </div>

              {/* Título */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">
                  Título del Evento
                </label>
                <input
                  type="text"
                  name="title"
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Ej: Fiesta en la Playa"
                  required
                />
              </div>

              {/* INPUT DE ARCHIVO PERSONALIZADO (FLYER) */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">
                  Flyer del Evento
                </label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-gray-700 transition group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaFileImage className="w-8 h-8 mb-2 text-gray-400 group-hover:text-indigo-500 transition" />
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-bold">
                      {flyerName ? (
                        <span className="text-indigo-500">{flyerName}</span>
                      ) : (
                        "Click para subir imagen"
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG (Recomendado 1920x1080)
                    </p>
                  </div>
                  <input
                    type="file"
                    name="flyer"
                    accept="image/*"
                    onChange={handleFile}
                    className="hidden"
                    required
                  />
                </label>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  rows={4}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Describe el evento..."
                  required
                ></textarea>
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">
                  Fecha y Hora
                </label>
                <input
                  type="datetime-local"
                  name="date"
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <hr className="border-gray-200 dark:border-gray-700 my-6" />
              <h3 className="text-orange-500 dark:text-[#f0ad4e] font-bold mb-4 uppercase text-sm tracking-wider">
                Soporte Técnico
              </h3>

              {/* SECCIÓN COCHES */}
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-bold flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                    <FaCar /> ¿Coches?
                  </label>
                  <select
                    name="needsCars"
                    onChange={handleChange}
                    className={selectClass}
                  >
                    <option value="false">No</option>
                    <option value="true">Sí</option>
                  </select>
                </div>
                {form.needsCars === "true" && (
                  <textarea
                    name="carsDesc"
                    placeholder="Modelo, color y tuning..."
                    className={inputClass}
                    rows={2}
                  ></textarea>
                )}
              </div>

              {/* SECCIÓN RADIO */}
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <label className="font-bold flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                    <FaBroadcastTower /> ¿Emisora?
                  </label>
                  <select
                    name="needsRadio"
                    onChange={handleChange}
                    className={selectClass}
                  >
                    <option value="false">No</option>
                    <option value="true">Sí</option>
                  </select>
                </div>
              </div>

              {/* SECCIÓN MAPEO */}
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-bold flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                    <FaCubes /> ¿Mapeo?
                  </label>
                  <select
                    name="needsMapping"
                    onChange={handleChange}
                    className={selectClass}
                  >
                    <option value="false">No</option>
                    <option value="true">Sí</option>
                  </select>
                </div>
                {form.needsMapping === "true" && (
                  <div className="space-y-3 mt-2">
                    <textarea
                      name="mappingDesc"
                      placeholder="Descripción del mapeo..."
                      className={inputClass}
                      rows={2}
                    ></textarea>

                    {/* INPUT ARCHIVO MAPEO PERSONALIZADO */}
                    <label className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-white dark:bg-black/20 hover:bg-gray-50 dark:hover:bg-gray-700 transition group">
                      <FaFolderOpen className="text-gray-400 group-hover:text-indigo-500" />
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-300 flex-1">
                        {mappingFilesName ||
                          "Seleccionar archivos de referencia..."}
                      </span>
                      <input
                        type="file"
                        name="mappingFiles"
                        multiple
                        onChange={handleMappingFiles}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 rounded-xl shadow-lg mt-4 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
              >
                {isSubmitting ? "ENVIANDO SOLICITUD..." : "ENVIAR A REVISIÓN"}
              </button>
            </form>
          </div>

          {/* PREVIEW (Derecha) */}
          <div className="hidden xl:block sticky top-8 h-fit">
            <h3 className="text-gray-500 dark:text-gray-400 font-bold mb-3 uppercase text-xs tracking-wider">
              Vista Previa (Anuncios)
            </h3>
            <div className="bg-[#36393f] p-4 rounded-lg shadow-xl border border-[#2f3136] max-w-md mx-auto">
              <div className="flex gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                  BOT
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-white font-bold text-sm">
                      GTAWEvent
                    </span>
                    <span className="bg-[#5865F2] text-white text-[10px] px-1 rounded h-fit">
                      BOT
                    </span>
                    <span className="text-[#72767d] text-xs">
                      Hoy a las 12:00
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#2f3136] border-l-4 border-[#5865F2] p-4 rounded-r grid gap-2">
                <div className="text-white font-bold text-base">
                  {form.title || "Título del Evento"}
                </div>
                <div className="text-[#dcddde] text-sm whitespace-pre-wrap">
                  {form.description || "La descripción aparecerá aquí..."}
                </div>

                <div className="grid gap-1 mt-2">
                  <div className="text-sm">
                    <span className="text-[#b9bbbe] font-bold inline-block w-6">
                      🕒
                    </span>
                    <span className="text-[#dcddde]">
                      {form.date
                        ? new Date(form.date).toLocaleString()
                        : "--/--/---- --:--"}
                    </span>
                  </div>
                </div>

                <div className="mt-2 w-full bg-[#202225] rounded h-48 flex items-center justify-center overflow-hidden border border-[#202225]">
                  {flyerPreview ? (
                    <img
                      src={flyerPreview}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <FaImage className="text-4xl text-[#40444b] mx-auto mb-2" />
                      <span className="text-[#72767d] text-xs">
                        Imagen del evento
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-[#72767d] text-xs mt-1">
                  Evento solicitado al Equipo de Eventos.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- VISTA LISTA --- */}
      {activeTab === "list" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden animate-fadeIn">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 font-bold flex items-center gap-2 text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-800">
            <FaList /> Historial de Eventos
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 uppercase text-xs font-bold">
                <tr>
                  <th className="p-4">Título</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-center">Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {myEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition bg-white dark:bg-gray-800"
                  >
                    <td className="p-4 font-bold text-gray-800 dark:text-white">
                      {event.title}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {new Date(event.eventDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={event.status} />
                    </td>
                    <td className="p-4 text-center text-gray-400 hover:text-indigo-500 cursor-pointer">
                      <FaInfoCircle />
                    </td>
                  </tr>
                ))}
                {myEvents.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No hay eventos en tu historial.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

function TabButton({ active, onClick, icon, children }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-sm ${
        active
          ? "bg-indigo-600 text-white shadow-md transform scale-105"
          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
      }`}
    >
      {icon} {children}
    </button>
  );
}

function StatCard({ label, value, color }: any) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 p-6 rounded-xl border-l-4 ${color} shadow-md border border-gray-100 dark:border-gray-700`}
    >
      <h3 className="text-3xl font-black text-gray-800 dark:text-white mb-1">
        {value}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 uppercase text-xs font-bold tracking-wider">
        {label}
      </p>
    </div>
  );
}

function ActionCard({ onClick, icon, title }: any) {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition flex flex-col items-center justify-center gap-4 group shadow-sm hover:shadow-lg"
    >
      <div className="text-5xl text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition transform group-hover:scale-110">
        {icon}
      </div>
      <span className="font-bold text-xl text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
        {title}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED")
    return (
      <span className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 text-xs font-bold flex w-fit items-center gap-1">
        <FaCheckCircle /> ACEPTADO
      </span>
    );
  if (status === "REJECTED")
    return (
      <span className="px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold flex w-fit items-center gap-1">
        <FaTimesCircle /> RECHAZADO
      </span>
    );
  return (
    <span className="px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 text-xs font-bold flex w-fit items-center gap-1">
      <FaClock /> PENDIENTE
    </span>
  );
}
