import { NextResponse } from 'next/server';
import { pb } from '@/lib/pocketbase';

export const dynamic = 'force-dynamic';

/**
 * Calculate streak based on last application date
 */
function calculateStreak(
    currentStreak: number,
    lastStreakDate: string
): number {
    if (!lastStreakDate) {
        return 1;
    }

    const last = new Date(lastStreakDate);
    const now = new Date();

    last.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diffMs = now.getTime() - last.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return currentStreak;
    } else if (diffDays === 1) {
        return currentStreak + 1;
    } else {
        return 1;
    }
}

async function getOrCreateSPFData() {
    try {
        // Try to get the first record
        return await pb.collection('spf_data').getFirstListItem('');
    } catch (e: unknown) {
        if (typeof e === 'object' && e !== null && 'status' in e && (e as { status: number }).status === 404) {
            // Create if it doesn't exist
            return await pb.collection('spf_data').create({
                applicationCount: 0,
                streak: 0,
                lastAppliedAt: '',
                lastStreakDate: '',
            });
        }
        throw e;
    }
}

/**
 * GET: Fetch aggregate SPF data and history
 */
export async function GET() {
    try {
        const doc = await getOrCreateSPFData();

        // Fetch last 7 days of history
        const historyDocs = await pb.collection('daily_history').getList(1, 7, {
            sort: '-date',
        });

        const history = historyDocs.items.map((h) => ({
            date: h.date,
            count: h.count,
        })).reverse();

        return NextResponse.json({
            applicationCount: doc.applicationCount,
            lastAppliedAt: doc.lastAppliedAt || null,
            streak: doc.streak,
            lastStreakDate: doc.lastStreakDate || null,
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
        const doc = await getOrCreateSPFData();

        const now = new Date().toISOString();
        const today = new Date().toISOString().split('T')[0];

        // Use current values from the doc
        const currentStreak = doc.streak || 0;
        const lastStreakDate = doc.lastStreakDate || '';

        const newStreak = calculateStreak(currentStreak, lastStreakDate);

        // Update main stats
        const updatedDoc = await pb.collection('spf_data').update(doc.id, {
            applicationCount: (doc.applicationCount || 0) + 1,
            lastAppliedAt: now,
            streak: newStreak,
            lastStreakDate: today,
        });

        // Update daily history
        try {
            // Try to find today's history
            const todayHistory = await pb.collection('daily_history').getFirstListItem(`date="${today}"`);
            await pb.collection('daily_history').update(todayHistory.id, {
                count: todayHistory.count + 1,
            });
        } catch (e: unknown) {
            if (typeof e === 'object' && e !== null && 'status' in e && (e as { status: number }).status === 404) {
                // Create new history for today
                await pb.collection('daily_history').create({
                    date: today,
                    count: 1,
                });
            } else {
                throw e;
            }
        }

        return NextResponse.json({
            applicationCount: updatedDoc.applicationCount,
            lastAppliedAt: updatedDoc.lastAppliedAt,
            streak: updatedDoc.streak,
            lastStreakDate: updatedDoc.lastStreakDate,
        });
    } catch (error) {
        console.error('API Error (POST /api/spf):', error);
        return NextResponse.json({ error: 'Failed to apply SPF' }, { status: 500 });
    }
}
