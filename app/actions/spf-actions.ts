'use server';

import connectToDatabase from '@/lib/db';
import { getSPFDocument } from '@/lib/models/spf-model';
import { revalidatePath } from 'next/cache';

export interface SPFData {
    applicationCount: number;
    lastAppliedAt: string | null;
    streak: number;
    lastStreakDate: string | null;
}

/**
 * Get SPF data from the database
 */
export async function getSPFServerData(): Promise<SPFData> {
    await connectToDatabase();
    const doc = await getSPFDocument();

    return {
        applicationCount: doc.applicationCount,
        lastAppliedAt: doc.lastAppliedAt,
        streak: doc.streak,
        lastStreakDate: doc.lastStreakDate,
    };
}

/**
 * Calculate streak based on last application date
 * Copied logic from original local storage implementation
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
 * Apply SPF and update data in database
 */
export async function applySPFServer(): Promise<SPFData> {
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

    // Revalidate any paths that might show this data if using server components
    revalidatePath('/');

    return {
        applicationCount: doc.applicationCount,
        lastAppliedAt: doc.lastAppliedAt,
        streak: doc.streak,
        lastStreakDate: doc.lastStreakDate,
    };
}
