import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { FaArrowLeft, FaHistory, FaCheckCircle, FaTimesCircle, FaClock, FaInfoCircle } from "react-icons/fa";

export default async function EventHistoryPage() {
  // @ts-ignore
  const session = await getServerSession(authOptions);
  if (!session) return <div>Inicia sesión</div>;

  const myEvents = await prisma.event.findMany({
    where: { creatorId: parseInt(session.user.id) },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
       <div className="mb-8 flex justify-between items-center">
            <div>
                <Link href="/events" className="text-gray-500 hover:text-gray-800 dark:hover:text-white flex items-center gap-2 text-sm font-bold mb-2">
                    <FaArrowLeft /> Volver a la Galería
                </Link>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                    <FaHistory /> Mi Historial de Eventos
                </h1>
            </div>
            <Link href="/events/request" className="bg-pink-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-pink-700">
                + Nuevo Evento
            </Link>
       </div>

       <div className="space-y-4">
          {myEvents.length === 0 ? (
              <p className="text-gray-500">No has enviado ninguna solicitud de evento.</p>
          ) : (
              myEvents.map(event => (
                  <div key={event.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-6">
                      {/* Imagen pequeña */}
                      <img src={event.flyerUrl} className="w-24 h-32 object-cover rounded-lg bg-gray-100" />
                      
                      <div className="flex-1">
                          <div className="flex justify-between items-start">
                              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{event.title}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
                                  event.status === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' :
                                  event.status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' :
                                  'bg-yellow-100 text-yellow-700 border-yellow-200'
                              }`}>
                                  {event.status === 'APPROVED' && <FaCheckCircle />}
                                  {event.status === 'REJECTED' && <FaTimesCircle />}
                                  {event.status === 'PENDING' && <FaClock />}
                                  {event.status}
                              </span>
                          </div>
                          
                          <p className="text-gray-500 text-sm mt-1 mb-3">Enviado el: {new Date(event.createdAt).toLocaleDateString()}</p>
                          
                          {/* MOSTRAR MOTIVO SI FUE RECHAZADO */}
                          {event.status === 'REJECTED' && event.rejectionReason && (
                              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800 text-sm text-red-800 dark:text-red-300">
                                  <span className="font-bold flex items-center gap-2 mb-1"><FaInfoCircle /> Motivo del rechazo:</span>
                                  {event.rejectionReason}
                              </div>
                          )}

                          {/* MOSTRAR SOLICITUDES ESPECIALES */}
                          {event.specialRequests && (
                              <div className="mt-3 text-xs text-gray-500 bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                                  <strong>Tus peticiones:</strong> {event.specialRequests}
                              </div>
                          )}
                      </div>
                  </div>
              ))
          )}
       </div>
    </div>
  );
}