import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAdminPB, pb } from '@/lib/pocketbase';

export const dynamic = 'force-dynamic';

/**
 * Calculate streak based on last application date
 */
function calculateStreak(
    currentStreak: number,
    lastStreakDate: string
): number {
    if (!lastStreakDate) return 1;

    const last = new Date(lastStreakDate);
    const now = new Date();

    last.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diffMs = now.getTime() - last.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return currentStreak;
    if (diffDays === 1) return currentStreak + 1;
    return 1;
}

/**
 * Helper to fetch the singleton SPF record
 */
async function getSPFDataRecord(client = pb) {
    try {
        return await client.collection('spf_data').getFirstListItem('', {
            sort: 'created',
        });
    } catch (e: unknown) {
        const is404 = typeof e === 'object' && e !== null && 'status' in e && (e as { status: number }).status === 404;
        if (is404) return null;
        throw e;
    }
}

/**
 * GET: Fetch aggregate SPF data
 */
export async function GET() {
    try {
        const adminPb = await getAdminPB();
        const doc = await getSPFDataRecord(adminPb);

        const historyDocs = await adminPb.collection('daily_history').getList(1, 7, {
            sort: '-date',
        });

        const history = historyDocs.items.map((h) => ({
            date: h.date,
            count: h.count,
        })).reverse();

        return NextResponse.json({
            applicationCount: doc?.applicationCount || 0,
            lastAppliedAt: doc?.lastAppliedAt || null,
            streak: doc?.streak || 0,
            lastStreakDate: doc?.lastStreakDate || null,
            history,
        });
    } catch (error) {
        console.error('API Error (GET /api/spf):', error);
        return NextResponse.json({ error: 'Failed to fetch SPF data' }, { status: 500 });
    }
}

/**
 * POST: Apply SPF (increment)
 */
export async function POST() {
    try {
        // 1. CLERK AUTH CHECK: Ensure only logged in users can write
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. ADMIN DB PROXY: Get authenticated admin client
        const adminPb = await getAdminPB();

        let doc = await getSPFDataRecord(adminPb);

        const now = new Date().toISOString();
        const today = new Date().toISOString().split('T')[0];

        if (!doc) {
            // First time initialization (Requires admin)
            doc = await adminPb.collection('spf_data').create({
                applicationCount: 1,
                streak: 1,
                lastAppliedAt: now,
                lastStreakDate: today,
            });
        } else {
            // Normal update (Requires admin)
            const currentStreak = doc.streak || 0;
            const lastDate = doc.lastStreakDate || '';
            const newStreak = calculateStreak(currentStreak, lastDate);

            doc = await adminPb.collection('spf_data').update(doc.id, {
                applicationCount: (doc.applicationCount || 0) + 1,
                lastAppliedAt: now,
                streak: newStreak,
                lastStreakDate: today,
            });
        }

        // Update daily history
        try {
            const todayHistory = await adminPb.collection('daily_history').getFirstListItem(`date="${today}"`);
            await adminPb.collection('daily_history').update(todayHistory.id, {
                count: todayHistory.count + 1,
            });
        } catch (e: unknown) {
            const is404 = typeof e === 'object' && e !== null && 'status' in e && (e as { status: number }).status === 404;
            if (is404) {
                await adminPb.collection('daily_history').create({
                    date: today,
                    count: 1,
                });
            }
        }

        if (!doc) {
            throw new Error('Failed to create or update SPF data');
        }

        return NextResponse.json({
            applicationCount: doc.applicationCount,
            lastAppliedAt: doc.lastAppliedAt,
            streak: doc.streak,
            lastStreakDate: doc.lastStreakDate,
        });
    } catch (error) {
        console.error('API Error (POST /api/spf):', error);
        return NextResponse.json({ error: 'Failed to apply SPF' }, { status: 500 });
    }
}
