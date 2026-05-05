import Appointment from '../models/Appointment.js';

const buildProviderNameCandidates = (user) => {
  const candidates = [];

  if (user?.profile?.firstName && user?.profile?.lastName) {
    const fullName = `${user.profile.firstName} ${user.profile.lastName}`.trim();
    candidates.push(fullName);
    candidates.push(`Dr. ${fullName}`);
  }

  if (user?.profile?.firstName) {
    candidates.push(`Dr. ${user.profile.firstName}`);
  }

  return [...new Set(candidates.filter(Boolean))];
};

// @desc    Get all appointments for a user
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req, res) => {
  try {
    if (req.user.role === 'doctor' || req.user.role === 'healthcare_provider') {
      const providerCandidates = buildProviderNameCandidates(req.user);
      const query = {
        $or: [
          { userId: req.user.id },
          ...(req.user.doctorId ? [{ doctorId: req.user.doctorId }] : []),
          ...(providerCandidates.length > 0 ? [{ 'provider.name': { $in: providerCandidates } }] : [])
        ]
      };

      const appointments = await Appointment.find(query)
        .sort({ dateTime: 1 });
      return res.json(appointments);
    }

    const appointments = await Appointment.find({ userId: req.user.id })
      .sort({ dateTime: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all appointments for admin
// @route   GET /api/appointments/admin/all
// @access  Private/Admin
export const getAllAppointmentsAdmin = async (req, res) => {
  try {
    // Only admins can access this
    if (req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized. Admin access required.' });
    }

    const appointments = await Appointment.find()
      .populate('userId', 'email profile')
      .sort({ dateTime: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Make sure user owns appointment
    if (appointment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
export const createAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.create({
      userId: req.user.id,
      ...req.body
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Make sure user owns appointment
    if (appointment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Make sure user owns appointment
    if (appointment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await appointment.deleteOne();
    res.json({ message: 'Appointment removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
