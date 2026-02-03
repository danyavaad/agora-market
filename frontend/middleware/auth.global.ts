export default defineNuxtRouteMiddleware((to, from) => {
    // Only run on client-side because we use localStorage for auth
    if (import.meta.server) return;

    const auth = useAuth();
    const toast = useToast();

    // Initialize auth if not done yet (e.g. on first page load)
    if (!auth.isInitialized) {
        auth.initialize();
    }

    // Whitelist of public routes
    const publicRoutes = ['/login', '/register', '/'];

    // Check if the route is public
    const isPublicRoute = publicRoutes.includes(to.path);

    if (!auth.isAuthenticated && !isPublicRoute) {
        // Redirigir a login si no está autenticado y la ruta no es pública
        toast.error('Debes iniciar sesión para acceder a esta página', 'Acceso restringido');
        return navigateTo('/login');
    }
});
