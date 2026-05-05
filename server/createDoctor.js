import dotenv from 'dotenv';
import connectDB from './config/database.js';
import User from './models/User.js';
import Doctor from './models/Doctor.js';

dotenv.config();

const createDoctor = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const doctorEmail = 'anna@nextcare.com';
    const doctorPassword = 'Doctor@123';
    const doctorName = 'Dr. Anna Martinez';

    const doctorRecord = await Doctor.findOne({ name: doctorName });
    if (!doctorRecord) {
      console.log(`❌ Doctor record not found: ${doctorName}`);
      process.exit(1);
    }

    const existingDoctor = await User.findOne({ email: doctorEmail });
    if (existingDoctor) {
      existingDoctor.role = 'doctor';
      existingDoctor.doctorId = doctorRecord._id;
      if (!existingDoctor.profile) {
        existingDoctor.profile = {};
      }
      existingDoctor.profile.firstName = 'Anna';
      existingDoctor.profile.lastName = 'Martinez';
      existingDoctor.onboardingCompleted = true;
      await existingDoctor.save();

      console.log('✓ Doctor already existed and was linked to the doctor record');
      console.log(`Email: ${doctorEmail}`);
      console.log(`Linked doctor record: ${doctorRecord.name}`);
      process.exit(0);
    }

    await User.create({
      email: doctorEmail,
      password: doctorPassword,
      role: 'doctor',
      doctorId: doctorRecord._id,
      profile: {
        firstName: 'Anna',
        lastName: 'Martinez'
      },
      onboardingCompleted: true
    });

    console.log('\n✅ Doctor account created successfully!');
    console.log('\nDoctor Credentials:');
    console.log(`Email: ${doctorEmail}`);
    console.log(`Password: ${doctorPassword}`);
    console.log(`Linked doctor record: ${doctorRecord.name}`);
    console.log('\n⚠️  Please change this password after first login for security!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating doctor:', error.message);
    process.exit(1);
  }
};

createDoctor();
