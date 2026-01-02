"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type EmbedData = {
  title: string;
  description: string;
  color: string;
  author: {
    name: string;
    icon_url: string;
  };
  footer: {
    text: string;
    icon_url: string;
  };
  thumbnail: string;
  image: string;
  fields: Array<{
    name: string;
    value: string;
    inline:  boolean;
  }>;
  timestamp: boolean;
};

type Template = {
  id: string;
  name: string;
  description: string;
  data: EmbedData;
  createdAt: string;
};

const DEFAULT_EMBED:  EmbedData = {
  title: "",
  description: "",
  color: "#5865F2",
  author:  {
    name: "",
    icon_url: "",
  },
  footer: {
    text: "",
    icon_url: "",
  },
  thumbnail: "",
  image: "",
  fields: [],
  timestamp: false,
};

const PRESET_TEMPLATES: Template[] = [
  {
    id: "announcement",
    name: "📢 Anuncio",
    description: "Plantilla para anuncios importantes",
    createdAt: new Date().toISOString(),
    data: {
      ... DEFAULT_EMBED,
      title: "📢 Anuncio Importante",
      description: "Descripción del anuncio.. .",
      color: "#FFA500",
      footer: { text: "Equipo de Administración", icon_url: "" },
      timestamp: true,
    },
  },
  {
    id:  "event",
    name: "🎉 Evento",
    description: "Plantilla para eventos",
    createdAt: new Date().toISOString(),
    data: {
      ...DEFAULT_EMBED,
      title: "🎉 Nuevo Evento",
      description: "¡No te pierdas este increíble evento!",
      color: "#5865F2",
      fields: [
        { name: "📅 Fecha", value: "TBD", inline: true },
        { name: "🕒 Hora", value: "TBD", inline: true },
        { name: "📍 Lugar", value: "TBD", inline: true },
      ],
      timestamp: true,
    },
  },
  {
    id: "rules",
    name: "📜 Reglas",
    description: "Plantilla para normativas",
    createdAt:  new Date().toISOString(),
    data: {
      ... DEFAULT_EMBED,
      title: "📜 Normas del Servidor",
      description: "Lee atentamente las siguientes reglas:",
      color: "#ED4245",
      fields: [
        { name: "1️⃣ Respeto", value: "Trata a todos con respeto", inline:  false },
        { name: "2️⃣ No Spam", value: "Evita el spam en los canales", inline: false },
        { name: "3️⃣ Contenido Apropiado", value:  "Mantén el contenido apropiado", inline: false },
      ],
      footer: { text: "El incumplimiento resultará en sanciones", icon_url: "" },
    },
  },
  {
    id: "welcome",
    name: "👋 Bienvenida",
    description: "Mensaje de bienvenida",
    createdAt: new Date().toISOString(),
    data: {
      ...DEFAULT_EMBED,
      title: "👋 ¡Bienvenido al Servidor!",
      description:  "Nos alegra tenerte aquí. Lee las reglas y diviértete.",
      color: "#57F287",
      thumbnail: "",
      fields: [
        { name: "📖 Reglas", value: "Lee las reglas en #reglas", inline: true },
        { name: "🎮 Roles", value: "Consigue roles en #roles", inline: true },
      ],
      timestamp: true,
    },
  },
];

export default function EmbedsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [embed, setEmbed] = useState<EmbedData>(DEFAULT_EMBED);
  const [channelId, setChannelId] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Gestión de plantillas
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [activeTab, setActiveTab] = useState<"preset" | "custom">("preset");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    // Cargar plantillas guardadas del localStorage
    const saved = localStorage.getItem("embed_templates");
    if (saved) {
      try {
        setTemplates(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading templates:", e);
      }
    }
  }, []);

  const updateEmbed = (field: string, value: any) => {
    setEmbed((prev) => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent: "author" | "footer", field: string, value: string) => {
    setEmbed((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]:  value },
    }));
  };

  const addField = () => {
    setEmbed((prev) => ({
      ...prev,
      fields: [...prev. fields, { name: "", value:  "", inline: false }],
    }));
  };

  const updateField = (index: number, field: string, value: any) => {
    setEmbed((prev) => ({
      ...prev,
      fields: prev.fields.map((f, i) => (i === index ? { ...f, [field]: value } : f)),
    }));
  };

  const removeField = (index: number) => {
    setEmbed((prev) => ({
      ...prev,
      fields: prev.fields. filter((_, i) => i !== index),
    }));
  };

  const loadTemplate = (template: Template) => {
    setEmbed(template.data);
    setShowTemplates(false);
    setResult({ success: true, message: `Plantilla "${template.name}" cargada` });
    setTimeout(() => setResult(null), 3000);
  };

  const saveTemplate = () => {
    if (!templateName. trim()) {
      alert("Por favor, ingresa un nombre para la plantilla");
      return;
    }

    const newTemplate: Template = {
      id: Date.now().toString(),
      name: templateName,
      description: templateDescription,
      data: embed,
      createdAt: new Date().toISOString(),
    };

    const updated = [...templates, newTemplate];
    setTemplates(updated);
    localStorage.setItem("embed_templates", JSON.stringify(updated));

    setTemplateName("");
    setTemplateDescription("");
    setShowSaveModal(false);
    setResult({ success: true, message: "Plantilla guardada exitosamente" });
    setTimeout(() => setResult(null), 3000);
  };

  const deleteTemplate = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta plantilla?")) {
      const updated = templates.filter((t) => t.id !== id);
      setTemplates(updated);
      localStorage.setItem("embed_templates", JSON.stringify(updated));
      setResult({ success: true, message: "Plantilla eliminada" });
      setTimeout(() => setResult(null), 3000);
    }
  };

  const exportTemplate = (template: Template) => {
    const dataStr = JSON.stringify(template, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${template.name. replace(/[^a-z0-9]/gi, "_")}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const importTemplate = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e:  any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event:  any) => {
        try {
          const imported = JSON.parse(event.target.result);
          const updated = [...templates, imported];
          setTemplates(updated);
          localStorage.setItem("embed_templates", JSON.stringify(updated));
          setResult({ success: true, message: "Plantilla importada exitosamente" });
          setTimeout(() => setResult(null), 3000);
        } catch (error) {
          alert("Error al importar la plantilla.  Verifica el archivo.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const resetEmbed = () => {
    if (confirm("¿Estás seguro de resetear el embed?")) {
      setEmbed(DEFAULT_EMBED);
      setContent("");
      setResult({ success: true, message: "Embed reseteado" });
      setTimeout(() => setResult(null), 3000);
    }
  };

  const sendEmbed = async () => {
    if (!channelId.trim()) {
      setResult({ success: false, message:  "Por favor, ingresa un ID de canal" });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const res = await fetch("/api/discord/send-embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId,
          content:  content || undefined,
          embed: {
            title: embed.title || undefined,
            description: embed. description || undefined,
            color:  parseInt(embed.color. replace("#", ""), 16),
            author: 
              embed.author. name || embed.author.icon_url
                ? {
                    name: embed.author.name || undefined,
                    icon_url:  embed.author.icon_url || undefined,
                  }
                : undefined,
            footer: 
              embed.footer.text || embed.footer.icon_url
                ? {
                    text: embed.footer.text || undefined,
                    icon_url: embed. footer.icon_url || undefined,
                  }
                : undefined,
            thumbnail: embed.thumbnail ?  { url: embed.thumbnail } : undefined,
            image: embed.image ? { url: embed.image } : undefined,
            fields: embed.fields. filter((f) => f.name && f.value),
            timestamp: embed. timestamp ?  new Date().toISOString() : undefined,
          },
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResult({ success: true, message: "✅ Embed enviado exitosamente" });
      } else {
        setResult({ success: false, message: `❌ Error: ${data.error}` });
      }
    } catch (error) {
      setResult({ success: false, message:  "❌ Error al enviar el embed" });
    } finally {
      setSending(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-3xl">✨</span>
              Editor de Embeds
            </h1>
            <p className="text-gray-400 text-sm mt-1">Crea embeds profesionales para Discord</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowTemplates(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              📋 Plantillas
            </button>
            <button
              onClick={() => setShowSaveModal(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              💾 Guardar
            </button>
            <button
              onClick={resetEmbed}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              🔄 Reset
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg: grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-6">
          {/* Información básica */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>📝</span> Información Básica
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Título</label>
                <input
                  type="text"
                  value={embed.title}
                  onChange={(e) => updateEmbed("title", e.target.value)}
                  placeholder="Título del embed"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  maxLength={256}
                />
                <div className="text-xs text-gray-400 mt-1">{embed.title.length}/256</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea
                  value={embed.description}
                  onChange={(e) => updateEmbed("description", e.target.value)}
                  placeholder="Descripción del embed..."
                  rows={4}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  maxLength={4096}
                />
                <div className="text-xs text-gray-400 mt-1">{embed.description.length}/4096</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={embed.color}
                    onChange={(e) => updateEmbed("color", e. target.value)}
                    className="h-12 w-20 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={embed. color}
                    onChange={(e) => updateEmbed("color", e.target.value)}
                    placeholder="#5865F2"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Author */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>👤</span> Autor
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                value={embed.author.name}
                onChange={(e) => updateNestedField("author", "name", e.target.value)}
                placeholder="Nombre del autor"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                maxLength={256}
              />
              <input
                type="text"
                value={embed. author.icon_url}
                onChange={(e) => updateNestedField("author", "icon_url", e.target.value)}
                placeholder="URL del icono del autor"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Imágenes */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🖼️</span> Imágenes
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Thumbnail (Pequeña)</label>
                <input
                  type="text"
                  value={embed.thumbnail}
                  onChange={(e) => updateEmbed("thumbnail", e.target.value)}
                  placeholder="https://ejemplo.com/imagen.png"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Imagen Principal (Grande)</label>
                <input
                  type="text"
                  value={embed.image}
                  onChange={(e) => updateEmbed("image", e.target.value)}
                  placeholder="https://ejemplo.com/imagen.png"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span>📊</span> Campos ({embed.fields.length}/25)
              </h2>
              <button
                onClick={addField}
                disabled={embed.fields.length >= 25}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
              >
                + Añadir Campo
              </button>
            </div>

            <div className="space-y-4">
              {embed.fields. map((field, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-400">Campo {index + 1}</span>
                    <button
                      onClick={() => removeField(index)}
                      className="text-red-400 hover:text-red-300 font-semibold"
                    >
                      ✕ Eliminar
                    </button>
                  </div>
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(index, "name", e.target. value)}
                    placeholder="Nombre del campo"
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:ring-2 focus: ring-blue-500 focus: outline-none"
                    maxLength={256}
                  />
                  <textarea
                    value={field.value}
                    onChange={(e) => updateField(index, "value", e.target.value)}
                    placeholder="Valor del campo"
                    rows={2}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                    maxLength={1024}
                  />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.inline}
                      onChange={(e) => updateField(index, "inline", e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">En línea (inline)</span>
                  </label>
                </div>
              ))}

              {embed.fields.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No hay campos.  Haz clic en "Añadir Campo" para agregar uno.
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>📌</span> Footer
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                value={embed.footer.text}
                onChange={(e) => updateNestedField("footer", "text", e.target.value)}
                placeholder="Texto del footer"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus: ring-blue-500 focus: outline-none"
                maxLength={2048}
              />
              <input
                type="text"
                value={embed.footer.icon_url}
                onChange={(e) => updateNestedField("footer", "icon_url", e. target.value)}
                placeholder="URL del icono del footer"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus: ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={embed.timestamp}
                  onChange={(e) => updateEmbed("timestamp", e.target. checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">Mostrar timestamp (fecha y hora)</span>
              </label>
            </div>
          </div>

          {/* Enviar */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🚀</span> Enviar a Discord
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">ID del Canal</label>
                <input
                  type="text"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target. value)}
                  placeholder="123456789012345678"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Haz clic derecho en el canal → Copiar ID
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Mensaje (Opcional)
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target. value)}
                  placeholder="Texto que acompaña al embed..."
                  rows={2}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  maxLength={2000}
                />
              </div>

              <button
                onClick={sendEmbed}
                disabled={sending || ! channelId}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Enviando...
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    Enviar Embed
                  </>
                )}
              </button>

              {result && (
                <div
                  className={`p-4 rounded-lg ${
                    result.success
                      ? "bg-green-900 border border-green-700"
                      : "bg-red-900 border border-red-700"
                  }`}
                >
                  {result.message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>👁️</span> Vista Previa
            </h2>

            <div className="bg-gray-750 rounded-lg p-4">
              {/* Content message */}
              {content && (
                <div className="mb-3 text-gray-200">
                  {content}
                </div>
              )}

              {/* Embed */}
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  borderLeft: `4px solid ${embed.color}`,
                  backgroundColor: "#2f3136",
                }}
              >
                <div className="p-4 space-y-2">
                  {/* Author */}
                  {(embed.author.name || embed. author.icon_url) && (
                    <div className="flex items-center gap-2 mb-2">
                      {embed.author.icon_url && (
                        <img
                          src={embed.author.icon_url}
                          alt="Author"
                          className="w-6 h-6 rounded-full"
                          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                        />
                      )}
                      {embed.author.name && (
                        <span className="font-semibold text-sm">{embed.author.name}</span>
                      )}
                    </div>
                  )}

                  {/* Title */}
                  {embed.title && (
                    <div className="font-bold text-lg text-blue-400">{embed.title}</div>
                  )}

                  {/* Description */}
                  {embed.description && (
                    <div className="text-sm text-gray-300 whitespace-pre-wrap">
                      {embed.description}
                    </div>
                  )}

                  {/* Fields */}
                  {embed. fields.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 mt-3">
                      {embed.fields.map((field, index) => (
                        <div
                          key={index}
                          className={field.inline ? "inline-block w-1/3 pr-2" : ""}
                        >
                          <div className="font-semibold text-sm">{field.name || "Campo"}</div>
                          <div className="text-sm text-gray-300">
                            {field.value || "Valor"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Thumbnail */}
                  {embed.thumbnail && (
                    <div className="float-right ml-4 mb-2">
                      <img
                        src={embed.thumbnail}
                        alt="Thumbnail"
                        className="rounded max-w-[80px] max-h-[80px]"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                      />
                    </div>
                  )}

                  {/* Image */}
                  {embed.image && (
                    <img
                      src={embed.image}
                      alt="Embed"
                      className="rounded mt-3 max-w-full"
                      onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                    />
                  )}

                  {/* Footer */}
                  {(embed.footer.text || embed. footer.icon_url || embed.timestamp) && (
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                      {embed.footer.icon_url && (
                        <img
                          src={embed.footer.icon_url}
                          alt="Footer"
                          className="w-5 h-5 rounded-full"
                          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                        />
                      )}
                      <span>
                        {embed.footer. text}
                        {embed.footer. text && embed.timestamp && " • "}
                        {embed.timestamp && new Date().toLocaleString("es-ES")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Plantillas */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800 z-10">
              <h2 className="text-2xl font-bold">📋 Plantillas</h2>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab("preset")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    activeTab === "preset"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  🎨 Predefinidas ({PRESET_TEMPLATES.length})
                </button>
                <button
                  onClick={() => setActiveTab("custom")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    activeTab === "custom"
                      ?  "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  💾 Mis Plantillas ({templates.length})
                </button>
                <button
                  onClick={importTemplate}
                  className="ml-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
                >
                  📥 Importar
                </button>
              </div>

              {/* Preset Templates */}
              {activeTab === "preset" && (
                <div className="grid grid-cols-1 md: grid-cols-2 gap-4">
                  {PRESET_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors cursor-pointer"
                      onClick={() => loadTemplate(template)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg">{template.name}</h3>
                        <span
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: template.data.color }}
                        />
                      </div>
                      <p className="text-sm text-gray-300 mb-3">{template.description}</p>
                      <div className="text-xs text-gray-400">
                        {template.data. fields.length} campos •{" "}
                        {template.data.timestamp ?  "Con timestamp" : "Sin timestamp"}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom Templates */}
              {activeTab === "custom" && (
                <>
                  {templates.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <div className="text-6xl mb-4">📋</div>
                      <p className="text-lg">No tienes plantillas guardadas</p>
                      <p className="text-sm mt-2">Crea un embed y guárdalo como plantilla</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-lg">{template.name}</h3>
                            <span
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor:  template.data.color }}
                            />
                          </div>
                          {template.description && (
                            <p className="text-sm text-gray-300 mb-3">{template.description}</p>
                          )}
                          <div className="text-xs text-gray-400 mb-3">
                            Creado:  {new Date(template.createdAt).toLocaleDateString("es-ES")}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => loadTemplate(template)}
                              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold"
                            >
                              Cargar
                            </button>
                            <button
                              onClick={() => exportTemplate(template)}
                              className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-semibold"
                            >
                              📥
                            </button>
                            <button
                              onClick={() => deleteTemplate(template.id)}
                              className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-semibold"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Guardar Plantilla */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold">💾 Guardar Plantilla</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre *</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Mi plantilla"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Descripción (Opcional)</label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e. target.value)}
                  placeholder="Descripción de la plantilla..."
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  maxLength={200}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={saveTemplate}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
                >
                  Guardar
                </button>
                <button
                  onClick={() => {
                    setShowSaveModal(false);
                    setTemplateName("");
                    setTemplateDescription("");
                  }}
                  className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}