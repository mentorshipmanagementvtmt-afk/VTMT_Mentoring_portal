/**
 * Seed Script: Generate 3,000 realistic students across all departments.
 * 
 * Usage: node scripts/seed_students.js
 * 
 * Requires: backend/.env with DATABASE_URL set.
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// --- Models (inline to avoid path issues) ---
const Schema = mongoose.Schema;

const addressSchema = new Schema({ doorNo: String, street: String, townOrVillage: String, taluk: String, state: String }, { _id: false });
const marksSchema = new Schema({ english: { secured: Number, max: Number }, mathematics: { secured: Number, max: Number }, physics: { secured: Number, max: Number }, chemistry: { secured: Number, max: Number }, totalSecured: Number, totalMax: Number, board: String, yearOfPassing: String }, { _id: false });

const studentSchema = new Schema({
  name: { type: String, required: true },
  registerNumber: { type: String, required: true, unique: true },
  vmNumber: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  batch: { type: String, required: true },
  section: { type: String },
  semester: { type: String },
  currentMentor: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  firstYearMentor: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  personal: { dateOfBirth: Date, placeOfBirth: String, motherTongue: String },
  parents: { fatherName: String, fatherQualification: String, fatherOccupation: String, motherName: String, motherQualification: String, motherOccupation: String },
  addresses: { permanent: addressSchema, local: addressSchema },
  contact: { contactNumber: String, landline: String, email: String },
  academics: { tenth: marksSchema, twelfth: marksSchema },
  health: { generalHealth: String, eyeSight: String, bloodGroup: String, otherDeficiency: String, illnessLastThreeYears: String },
  achievements: { past: String, present: String, features: String },
  profileImage: { url: String, publicId: String }
}, { timestamps: true });

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
const User = mongoose.models.User || mongoose.model('User', new Schema({ name: String, email: String, password: String, mtsNumber: String, designation: String, department: String, role: String, profileImage: { url: String, publicId: String } }, { timestamps: true }));

// --- Realistic Data Pools ---
const firstNames = ['Aarav','Vivaan','Aditya','Vihaan','Arjun','Reyansh','Sai','Arnav','Ayaan','Krishna','Ishaan','Shaurya','Atharva','Advik','Pranav','Dhruv','Kabir','Ritvik','Aarush','Darsh','Ananya','Diya','Saanvi','Aanya','Aadhya','Isha','Pari','Anvi','Myra','Sara','Navya','Anika','Kiara','Riya','Meera','Prisha','Shreya','Tanvi','Pooja','Nithya','Rahul','Surya','Karthik','Vikram','Harish','Deepak','Ravi','Sundar','Ganesh','Mohan','Lakshmi','Divya','Kavitha','Swetha','Priya','Sowmya','Dharani','Bhavani','Madhu','Keerthi'];
const lastNames = ['Kumar','Sharma','Singh','Verma','Patel','Reddy','Nair','Iyer','Pillai','Menon','Das','Gupta','Joshi','Rao','Naidu','Choudhary','Mishra','Pandey','Saxena','Agarwal','Murugan','Selvam','Raj','Krishnan','Subramanian','Venkatesh','Ramesh','Sundaram','Balaji','Prakash'];
const departments = ['AI&DS', 'CSE', 'ECE', 'MECH', 'IT', 'EEE', 'CIVIL', 'BME'];
const batches = ['2022-2026', '2023-2027', '2024-2028', '2025-2029'];
const sections = ['A', 'B', 'C'];
const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const boards = ['CBSE', 'State Board', 'ICSE', 'NIOS'];
const places = ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Erode', 'Tirunelveli', 'Vellore', 'Kanchipuram', 'Thanjavur', 'Bangalore', 'Hyderabad', 'Vijayawada', 'Kochi', 'Mangalore'];
const occupations = ['Engineer', 'Teacher', 'Doctor', 'Business', 'Farmer', 'Government Employee', 'Private Employee', 'Retired', 'Self-employed', 'Homemaker'];
const qualifications = ['B.E', 'B.Tech', 'M.Tech', 'MBA', 'B.Sc', 'M.Sc', 'B.Com', 'M.Com', 'Diploma', '12th Pass', '10th Pass', 'PhD'];
const states = ['Tamil Nadu', 'Karnataka', 'Kerala', 'Andhra Pradesh', 'Telangana', 'Maharashtra'];
const streets = ['Main Road', 'Cross Street', 'Layout', 'Nagar', 'Colony', 'Extension', 'Bazaar Street', 'Temple Road', 'Lake View Road', 'Park Street'];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pad(n, width) { return String(n).padStart(width, '0'); }

function generateStudent(index, dept, mentorId) {
  const firstName = rand(firstNames);
  const lastName = rand(lastNames);
  const name = `${firstName} ${lastName}`;
  const batch = rand(batches);
  const batchYear = batch.split('-')[0];
  
  const tenthTotal = randInt(280, 500);
  const twelfthTotal = randInt(280, 600);

  return {
    name,
    registerNumber: `VT${batchYear}${dept.replace('&', '').substring(0, 3).toUpperCase()}${pad(index, 4)}`,
    vmNumber: `VM${pad(randInt(10000, 99999), 5)}${pad(index, 3)}`,
    department: dept,
    batch,
    section: rand(sections),
    semester: rand(semesters),
    currentMentor: mentorId,
    personal: {
      dateOfBirth: new Date(randInt(2000, 2006), randInt(0, 11), randInt(1, 28)),
      placeOfBirth: rand(places),
      motherTongue: rand(['Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Hindi', 'English'])
    },
    parents: {
      fatherName: `${rand(firstNames)} ${lastName}`,
      fatherQualification: rand(qualifications),
      fatherOccupation: rand(occupations),
      motherName: `${rand(firstNames)} ${lastName}`,
      motherQualification: rand(qualifications),
      motherOccupation: rand(occupations)
    },
    addresses: {
      permanent: {
        doorNo: `${randInt(1, 500)}/${rand(['A', 'B', 'C', ''])}`,
        street: `${randInt(1, 20)}th ${rand(streets)}`,
        townOrVillage: rand(places),
        taluk: rand(places),
        state: rand(states)
      },
      local: {
        doorNo: `${randInt(1, 200)}`,
        street: `${rand(streets)}, Near VelTech`,
        townOrVillage: 'Avadi',
        taluk: 'Ambattur',
        state: 'Tamil Nadu'
      }
    },
    contact: {
      contactNumber: `${rand(['9', '8', '7'])}${pad(randInt(100000000, 999999999), 9)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randInt(1, 999)}@veltech.edu.in`
    },
    academics: {
      tenth: {
        english: { secured: randInt(60, 100), max: 100 },
        mathematics: { secured: randInt(50, 100), max: 100 },
        physics: { secured: randInt(55, 100), max: 100 },
        chemistry: { secured: randInt(50, 100), max: 100 },
        totalSecured: tenthTotal,
        totalMax: 500,
        board: rand(boards),
        yearOfPassing: String(randInt(2018, 2023))
      },
      twelfth: {
        english: { secured: randInt(50, 100), max: 100 },
        mathematics: { secured: randInt(40, 100), max: 200 },
        physics: { secured: randInt(40, 100), max: 100 },
        chemistry: { secured: randInt(40, 100), max: 100 },
        totalSecured: twelfthTotal,
        totalMax: 600,
        board: rand(boards),
        yearOfPassing: String(randInt(2020, 2025))
      }
    },
    health: {
      generalHealth: rand(['Good', 'Excellent', 'Average']),
      eyeSight: rand(['Normal', 'Short-sighted', 'Uses spectacles']),
      bloodGroup: rand(bloodGroups),
      otherDeficiency: 'None',
      illnessLastThreeYears: rand(['None', 'Fever', 'Dengue', 'COVID-19', 'None', 'None'])
    },
    achievements: {
      past: rand(['School topper in Mathematics', 'District level chess player', 'State level kabaddi player', 'Science exhibition winner', 'NCC Cadet', 'NSS volunteer', 'None']),
      present: rand(['College coding club member', 'Hackathon participant', 'Paper presenter', 'Sports team captain', 'Cultural committee member', 'None']),
      features: rand(['Quick learner', 'Team player', 'Good communicator', 'Strong analytical skills', 'Creative thinker', 'Leadership qualities'])
    }
  };
}

async function seed() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(process.env.DATABASE_URL, { family: 4, serverSelectionTimeoutMS: 10000 });
  console.log('✅ Connected!\n');

  // Fetch all mentors grouped by department
  const mentors = await User.find({ role: 'mentor' }).select('_id department');
  if (mentors.length === 0) {
    console.error('❌ No mentors found in the database! Please create mentors first.');
    process.exit(1);
  }

  const mentorsByDept = {};
  mentors.forEach(m => {
    if (!mentorsByDept[m.department]) mentorsByDept[m.department] = [];
    mentorsByDept[m.department].push(m._id);
  });

  const availableDepts = Object.keys(mentorsByDept);
  console.log(`📋 Found ${mentors.length} mentors across ${availableDepts.length} departments: ${availableDepts.join(', ')}`);

  const TOTAL_STUDENTS = 3000;
  const studentsPerDept = Math.floor(TOTAL_STUDENTS / availableDepts.length);
  const remainder = TOTAL_STUDENTS % availableDepts.length;

  const allStudents = [];
  let globalIndex = 0;

  for (let d = 0; d < availableDepts.length; d++) {
    const dept = availableDepts[d];
    const deptMentors = mentorsByDept[dept];
    const count = studentsPerDept + (d < remainder ? 1 : 0);

    for (let i = 0; i < count; i++) {
      const mentorId = deptMentors[i % deptMentors.length]; // Round-robin assignment
      allStudents.push(generateStudent(globalIndex++, dept, mentorId));
    }
  }

  console.log(`\n🚀 Inserting ${allStudents.length} students in batches of 500...\n`);

  const BATCH_SIZE = 500;
  let inserted = 0;
  for (let i = 0; i < allStudents.length; i += BATCH_SIZE) {
    const batch = allStudents.slice(i, i + BATCH_SIZE);
    try {
      await Student.insertMany(batch, { ordered: false });
      inserted += batch.length;
      console.log(`  ✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: Inserted ${batch.length} students (Total: ${inserted}/${allStudents.length})`);
    } catch (err) {
      // Handle duplicate key errors gracefully
      if (err.code === 11000 || err.writeErrors) {
        const successCount = err.insertedDocs ? err.insertedDocs.length : batch.length - (err.writeErrors?.length || 0);
        inserted += successCount;
        console.log(`  ⚠️  Batch ${Math.floor(i / BATCH_SIZE) + 1}: Inserted ${successCount}/${batch.length} (${err.writeErrors?.length || 0} duplicates skipped)`);
      } else {
        console.error(`  ❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, err.message);
      }
    }
  }

  // Final summary
  const totalInDb = await Student.countDocuments();
  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ SEED COMPLETE!`);
  console.log(`   Students inserted this run: ~${inserted}`);
  console.log(`   Total students in database: ${totalInDb}`);
  console.log(`${'='.repeat(50)}\n`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed script failed:', err.message);
  process.exit(1);
});
