import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { getSPFDocument } from '@/lib/models/spf-model';
import DailyHistoryModel from '@/lib/models/daily-history-model';

/**
 * Calculate streak based on last application date
 */
function calculateStreak(
    currentStreak: number,
    lastStreakDate: string | null
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

/**
 * GET: Fetch aggregate SPF data and history
 */
export async function GET() {
    try {
        await connectToDatabase();
        const doc = await getSPFDocument();

        // Fetch last 7 days of history
        const historyDocs = await DailyHistoryModel.find()
            .sort({ date: -1 })
            .limit(7)
            .lean();

        const history = historyDocs.map(h => ({
            date: h.date,
            count: h.count
        })).reverse();

        return NextResponse.json({
            applicationCount: doc.applicationCount,
            lastAppliedAt: doc.lastAppliedAt,
            streak: doc.streak,
            lastStreakDate: doc.lastStreakDate,
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
        await connectToDatabase();
        const doc = await getSPFDocument();

        const now = new Date().toISOString();
        const today = new Date().toISOString().split('T')[0];

        const newStreak = calculateStreak(doc.streak, doc.lastStreakDate);

        doc.applicationCount += 1;
        doc.lastAppliedAt = now;
        doc.streak = newStreak;
        doc.lastStreakDate = today;

        await doc.save();

        // Update daily history
        await DailyHistoryModel.findOneAndUpdate(
            { date: today },
            { $inc: { count: 1 } },
            { upsert: true, new: true }
        );

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
