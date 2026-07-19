import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    fullName: {
        type: String,
        required: true,
        minLength: [2,"Full name must be more than 2 characters."],
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    picture: {
        type: new mongoose.Schema({
            pictureType: String,
            pictureData: String
        }),
        default: {
            pictureType: "",
            pictureData: ""
        }
    },
    thumbnail: String,
    theme: String,
    about: String,
    roles: [{
        label: {
            type: String
        },
        color: {
            type: String
        }
    }],

    resume: {
        type: String
    },
    links: [{
        platform: {
            type: String
        },
        url: {
            type: String
        }
    }],
    works: [{
        type: mongoose.Types.ObjectId,
        ref: "work"
    }],
},{
    timestamps: true,
    toObject: {virtuals:true},
    toJSON: {virtuals:true}
});


export const PortfolioModel = mongoose.models.portfolio || mongoose.model("portfolio",portfolioSchema);

PortfolioModel.syncIndexes();