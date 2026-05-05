import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['patient', 'admin', 'doctor', 'healthcare_provider'],
    default: 'patient'
  },
  profile: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    emergencyContact: {
      type: {
        name: String,
        relationship: String,
        phone: String
      },
      default: undefined,
      required: false
    }
  },
  medicalInfo: {
    conditions: [String],
    allergies: [String],
    medications: [String],
    hospitalizations: [{
      date: Date,
      reason: String,
      hospital: String,
      duration: Number
    }]
  },
  lifestyle: {
    smokingStatus: String,
    alcoholConsumption: String,
    exerciseFrequency: String,
    dietType: String,
    sleepHours: Number
  },
  riskScore: {
    type: Number,
    default: 0
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  preferredLanguage: {
    type: String,
    default: 'en'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
