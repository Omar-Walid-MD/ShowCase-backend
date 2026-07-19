import mongoose from "mongoose";

export const providerEnum = {system:"system",google:"google"}

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        minLength: [2,"Full name must be more than 2 characters."],
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: function() {
            return this.provider === providerEnum.system;
        }
    },
    password: {
        type: String,
        required: function() {
            return this.provider === providerEnum.system;
        }
    },
    provider: {
        type: String,
        enum: Object.values(providerEnum),
        default: providerEnum.system
    },
    confirmEmail: Date,
    picture: new mongoose.Schema({
        pictureType: String,
        pictureData: String
    })
},{
    timestamps: true,
    toObject: {virtuals:true},
    toJSON: {virtuals:true}
});


export const UserModel = mongoose.models.user || mongoose.model("user",userSchema);

UserModel.syncIndexes();