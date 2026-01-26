import PocketBase from 'pocketbase';

// Use environment variable or default to local
const url = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

export const pb = new PocketBase(url);

// Disable auto-cancellation globally for smoother React usage
pb.autoCancellation(false);
