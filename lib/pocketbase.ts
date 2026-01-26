import PocketBase from 'pocketbase';

/**
 * Public PocketBase client for the frontend (Real-time SSE).
 */
const publicUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
export const pb = new PocketBase(publicUrl);
pb.autoCancellation(false);

/**
 * Internal PocketBase client for server-side API routes (Faster/Reliable).
 */
const internalUrl = process.env.POCKETBASE_INTERNAL_URL || publicUrl;
const pbServer = new PocketBase(internalUrl);
pbServer.autoCancellation(false);

/**
 * Securely get an authenticated Admin instance of PocketBase on the server.
 * Uses cached auth to minimize re-login overhead.
 */
export async function getAdminPB() {
    const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
    const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        throw new Error('Missing POCKETBASE_ADMIN credentials in .env');
    }

    // If already authenticated and token is valid, return cached client
    if (pbServer.authStore.isValid && pbServer.authStore.isAdmin) {
        return pbServer;
    }

    // Perform login
    await pbServer.admins.authWithPassword(adminEmail, adminPassword);

    return pbServer;
}
