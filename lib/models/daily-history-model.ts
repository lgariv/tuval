import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDailyHistory extends Document {
    date: string; // YYYY-MM-DD
    count: number;
}

const DailyHistorySchema: Schema = new Schema(
    {
        date: { type: String, required: true, unique: true },
        count: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

// Prevent overwriting the model if it's already compiled
const DailyHistoryModel: Model<IDailyHistory> =
    mongoose.models.DailyHistory ||
    mongoose.model<IDailyHistory>('DailyHistory', DailyHistorySchema);

export default DailyHistoryModel;
