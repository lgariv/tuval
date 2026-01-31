import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminPB } from '@/lib/pocketbase';

export const dynamic = 'force-dynamic';

/**
 * GET: Fetch and optionally increment site view count
 * Prevents multiple increments within a short period using a cookie.
 */
export async function GET() {
    try {
        const cookieStore = await cookies();
        const hasViewed = cookieStore.get('tuval_view_counted');
        const adminPb = await getAdminPB();

        // Find or create the site stats record
        let record;
        const statsList = await adminPb.collection('site_stats').getList(1, 1);
        if (statsList.items.length === 0) {
            record = await adminPb.collection('site_stats').create({ viewCount: 0 });
        } else {
            record = statsList.items[0];
        }

        // Only increment if the cookie is not present
        if (!hasViewed) {
            record = await adminPb.collection('site_stats').update(record.id, {
                'viewCount+': 1,
            });

            // Set cookie to prevent re-counting (expires in 1 hour)
            cookieStore.set('tuval_view_counted', 'true', {
                maxAge: 3600, // 1 hour
                path: '/',
                httpOnly: true,
                sameSite: 'lax'
            });
        }

        return NextResponse.json({
            viewCount: record.viewCount,
        });
    } catch (error: any) {
        console.error('API Error (GET /api/stats):', error);
        return NextResponse.json({
            error: 'Failed to fetch site stats'
        }, { status: 500 });
    }
}
