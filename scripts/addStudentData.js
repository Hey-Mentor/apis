const mongoose = require('mongoose');
require('dotenv').config();

const connectionString = process.env.CONNECTION_STRING;
mongoose.connect(connectionString, { useNewUrlParser: true });
const db = mongoose.connection;

const yvonne = {
    user_type: 'mentee',
    facebook_id: '100003094113011',
    google_id: '',
    api_key: '6808e13422c34eceb36498f9a2795abc',
    contacts: [],
    person: {
        fname: 'Yvonne',
        lname: 'Truong',
        kname: 'Yvonne',
    },
    demo: {
        race: 'Asian/Asian American',
        eth: 'Vietnamese',
        gender: 'Female',
    },
    school: {
        name: 'Renton High School',
        grade: 11,
        gpa: 3.7,
        sat: 990,
    },
    gen_interest: 'Arts, Visuals, Music, or Performing',
    spec_interests: ['Arts', 'Books', 'Cars', 'Coffee & tea', 'Computers', 'Cooking', 'Eating', 'Karaoke', 'Movies', 'Music', 'Photography', 'Sleeping', 'Travel'],
    sports: ['Dancing'],
    support: ['Admission Essays', 'Career Prep (Resume, Cover Letter, LinkedIn, Interviews)', 'Choosing Post-Secondary Plans', 'College Selection', 'Financial Aid', 'Finding Scholarships', 'SAT/ACT Advice'],
};

const danielle = {
    user_type: 'mentor',
    facebook_id: '100000408989218',
    google_id: '',
    api_key: '9808e13422c34ecea36498f9a2795abc',
    contacts: [],
    person: {
        fname: 'Danielle',
        lname: 'Malig',
        kname: '',
    },
    demo: {
        race: '',
        eth: '',
        gender: 'Female',
    },
    school: {
        name: '',
        grade: '',
        gpa: '',
        sat: '',
    },
    gen_interest: '',
    spec_interests: [],
    sports: [],
    support: [],
};

db.once('open', () => {
    db.collection('Users').insert(danielle)
        .then(() => mongoose.connection.close());
});
