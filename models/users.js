const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        user_type: {
            type: String,
            enum: ['admin', 'mentor', 'mentee'],
            required: true,
        },
        facebook_id: {
            type: Number,
            required() {
                return !this.google_id;
            },
            unique: true,
            select: true,
        },
        google_id: {
            type: String,
            required() {
                return !this.facebook_id;
            },
            unique: true,
            select: false,
        },
        api_key: {
            type: String,
            select: false,
        },
        contacts: {
            type: [{
                type: Schema.Types.ObjectId,
                ref: 'User',
            }],
            select: false,
        },
        chat: {
            twilioInit: { type: String },
            channels: {
                type: Array,
                required: false,
                select: true,
            },
        },
        /* Profile Data below */
        person: {
            fname: {
                type: String,
                required: true,
            },
            lname: {
                type: String,
                required: true,
            },
            kname: { type: String },
        },
        demo: {
            race: { type: String },
            gender: {
                type: String,
                enum: ['male', 'female', 'nonbinary', 'other'],
            },
            eth: { type: String },
        },
        school: {
            name: { type: String },
            grade: { type: Number },
            gpa: { type: Number },
            sat: { type: Number },
        },
        gen_interest: {
            type: String,
        },
        spec_interests: {
            type: Array,
        },
        sports: {
            type: Array,
        },
        support: {
            type: [
                {
                    type: String,
                    enum: [
                        'college_applications',
                        'scholarships',
                        'financial_aid',
                        'college_search',
                        'career_advice',
                        'exam_preparation',
                    ],
                },
            ],
        },
    },
    {
        // NOTE: The 'collection' field here must match the "Collection" on the backend
        collection: 'Users',
    },
);

module.exports = mongoose.model('User', UserSchema);
