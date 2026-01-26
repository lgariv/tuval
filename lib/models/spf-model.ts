import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISPFData extends Document {
    applicationCount: number;
    lastAppliedAt: string | null;
    streak: number;
    lastStreakDate: string | null;
}

const SPFSchema: Schema = new Schema(
    {
        applicationCount: { type: Number, default: 0 },
        lastAppliedAt: { type: String, default: null },
        streak: { type: Number, default: 0 },
        lastStreakDate: { type: String, default: null },
    },
    {
        timestamps: true,
    }
);

// Prevent overwriting the model if it's already compiled
const SPFModel: Model<ISPFData> =
    mongoose.models.SPFData || mongoose.model<ISPFData>('SPFData', SPFSchema);

/**
 * Get or create the singleton SPF document
 */
export async function getSPFDocument(): Promise<ISPFData> {
    let doc = await SPFModel.findOne();
    if (!doc) {
        doc = await SPFModel.create({
            applicationCount: 0,
            lastAppliedAt: null,
            streak: 0,
            lastStreakDate: null,
        });
    }
    return doc;
}

export default SPFModel;
