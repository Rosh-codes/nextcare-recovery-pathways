import User from '../models/User.js';

const canManageClinicalData = (role) => role === 'admin' || role === 'doctor' || role === 'healthcare_provider';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const hasClinicalFields =
      req.body.medicalInfo !== undefined ||
      req.body.lifestyle !== undefined ||
      req.body.riskScore !== undefined;

    if (!isAdmin && hasClinicalFields) {
      return res.status(403).json({
        message: 'Only admin can update medical history, lifestyle, or risk score'
      });
    }

    // Update fields
    if (req.body.profile) user.profile = { ...user.profile, ...req.body.profile };
    if (isAdmin && req.body.medicalInfo) user.medicalInfo = { ...user.medicalInfo, ...req.body.medicalInfo };
    if (isAdmin && req.body.lifestyle) user.lifestyle = { ...user.lifestyle, ...req.body.lifestyle };
    if (req.body.preferredLanguage) user.preferredLanguage = req.body.preferredLanguage;
    if (isAdmin && req.body.riskScore !== undefined) user.riskScore = req.body.riskScore;
    if (req.body.onboardingCompleted !== undefined) user.onboardingCompleted = req.body.onboardingCompleted;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      email: updatedUser.email,
      role: updatedUser.role,
      profile: updatedUser.profile,
      medicalInfo: updatedUser.medicalInfo,
      lifestyle: updatedUser.lifestyle,
      riskScore: updatedUser.riskScore,
      onboardingCompleted: updatedUser.onboardingCompleted,
      preferredLanguage: updatedUser.preferredLanguage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all patient users for clinical workflows
// @route   GET /api/users/patients
// @access  Private/Doctor/Admin
export const getPatients = async (req, res) => {
  try {
    if (!canManageClinicalData(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const patients = await User.find({ role: 'patient' }).select('-password');
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin update user clinical details
// @route   PUT /api/users/:id/clinical
// @access  Private/Admin
export const updateUserClinicalDetails = async (req, res) => {
  try {
    if (!canManageClinicalData(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.medicalInfo) user.medicalInfo = { ...user.medicalInfo, ...req.body.medicalInfo };
    if (req.body.lifestyle) user.lifestyle = { ...user.lifestyle, ...req.body.lifestyle };
    if (req.body.riskScore !== undefined) user.riskScore = req.body.riskScore;
    if (req.body.onboardingCompleted !== undefined) user.onboardingCompleted = req.body.onboardingCompleted;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      email: updatedUser.email,
      role: updatedUser.role,
      profile: updatedUser.profile,
      medicalInfo: updatedUser.medicalInfo,
      lifestyle: updatedUser.lifestyle,
      riskScore: updatedUser.riskScore,
      onboardingCompleted: updatedUser.onboardingCompleted,
      preferredLanguage: updatedUser.preferredLanguage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin update patient profile details
// @route   PUT /api/users/:id/profile
// @access  Private/Admin
export const updatePatientProfileDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.profile) user.profile = { ...user.profile, ...req.body.profile };
    if (req.body.preferredLanguage) user.preferredLanguage = req.body.preferredLanguage;
    if (req.body.onboardingCompleted !== undefined) user.onboardingCompleted = req.body.onboardingCompleted;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      email: updatedUser.email,
      role: updatedUser.role,
      profile: updatedUser.profile,
      medicalInfo: updatedUser.medicalInfo,
      lifestyle: updatedUser.lifestyle,
      riskScore: updatedUser.riskScore,
      onboardingCompleted: updatedUser.onboardingCompleted,
      preferredLanguage: updatedUser.preferredLanguage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin clear user clinical details
// @route   DELETE /api/users/:id/clinical
// @access  Private/Admin
export const clearUserClinicalDetails = async (req, res) => {
  try {
    if (!canManageClinicalData(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.medicalInfo = {
      conditions: [],
      allergies: [],
      medications: [],
      hospitalizations: []
    };

    user.lifestyle = {
      smokingStatus: '',
      alcoholConsumption: '',
      exerciseFrequency: '',
      dietType: '',
      sleepHours: undefined
    };

    user.riskScore = 0;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      email: updatedUser.email,
      role: updatedUser.role,
      profile: updatedUser.profile,
      medicalInfo: updatedUser.medicalInfo,
      lifestyle: updatedUser.lifestyle,
      riskScore: updatedUser.riskScore,
      onboardingCompleted: updatedUser.onboardingCompleted,
      preferredLanguage: updatedUser.preferredLanguage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
