import mongoose from "mongoose";

export const workSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    tags: {
        type: Array,
        required: true
    },
    picture: {
        type: String,
        required: true
    },
    portfolioId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    link: {
        type: String,
    }
},{
    timestamps: true,
    toObject: {virtuals:true},
    toJSON: {virtuals:true}
});


export const WorkModel = mongoose.models.work || mongoose.model("work",workSchema);

WorkModel.syncIndexes();