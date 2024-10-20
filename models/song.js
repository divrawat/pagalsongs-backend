var mongoose = require("mongoose");

var songSchema = new mongoose.Schema(
    {
        Name: {
            type: String,
            index: true,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            trim: true,
            required: true,
            index: true,
            unique: true,
        },
        size: {
            type: String,
            trim: true,
        },
        duration: {
            type: String,
            trim: true,
        },
        singer: {
            type: String,
            trim: true,
            index: true,
        },
        music: {
            type: String,
            trim: true,
        },
        lyrics: {
            type: String,
            trim: true,
            index: true,
        },
        label: {
            type: String,
            trim: true,
        },
        Categories: {
            type: String,
            trim: true,
            index: true,
        },
        downloads: {
            type: String,
            trim: true,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } },
    // { versionKey: false }
);

// Export the model
module.exports = mongoose.model('Song', songSchema);
