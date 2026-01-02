import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// ✅ Exportar como "proxy" en lugar de "middleware"
export async function proxy(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process. env. NEXTAUTH_SECRET 
  });

  // Rutas protegidas
  const protectedPaths = ['/admin', '/dashboard', '/events/create', '/embeds'];
  const isProtectedPath = protectedPaths.some(path => 
    request. nextUrl.pathname.startsWith(path)
  );

  // Redirigir si no está autenticado
  if (isProtectedPath && !token) {
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }

  // Verificar permisos de admin
  if (request.nextUrl.pathname. startsWith('/admin')) {
    const userRole = token?.role as string;
    if (!['FOUNDER', 'ADMIN']. includes(userRole || '')) {
      const url = new URL('/', request. url);
      return NextResponse. redirect(url);
    }
  }

  return NextResponse. next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/events/create',
    '/embeds',
  ],
};