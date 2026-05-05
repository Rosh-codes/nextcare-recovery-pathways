import CarePlan from '../models/CarePlan.js';

// @desc    Get all care plans for a user
// @route   GET /api/care-plans
// @access  Private
export const getCarePlans = async (req, res) => {
  try {
    const carePlans = await CarePlan.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(carePlans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single care plan
// @route   GET /api/care-plans/:id
// @access  Private
export const getCarePlan = async (req, res) => {
  try {
    const carePlan = await CarePlan.findById(req.params.id);

    if (!carePlan) {
      return res.status(404).json({ message: 'Care plan not found' });
    }

    if (carePlan.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(carePlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new care plan
// @route   POST /api/care-plans
// @access  Private
export const createCarePlan = async (req, res) => {
  try {
    const goalItems = typeof req.body.goalText === 'string'
      ? req.body.goalText.split('\n').map((goal) => goal.trim()).filter(Boolean)
      : [];

    const actionItems = typeof req.body.recommendedActions === 'string'
      ? req.body.recommendedActions.split('\n').map((action) => action.trim()).filter(Boolean)
      : [];

    const carePlan = await CarePlan.create({
      userId: req.body.patientId || req.body.userId || req.user.id,
      title: req.body.title,
      description: req.body.description || req.body.goalText || '',
      goals: req.body.goals?.length ? req.body.goals : goalItems.map((goal) => ({ description: goal })),
      tasks: req.body.tasks?.length ? req.body.tasks : actionItems.map((action) => ({ title: action, description: action })),
      assignedBy: {
        name: req.user.email,
        role: req.user.role,
        date: new Date()
      },
      startDate: req.body.startDate || new Date(),
      endDate: req.body.endDate,
      status: req.body.status || 'active',
      progress: req.body.progress ?? 0,
      medications: req.body.medications || []
    });

    res.status(201).json(carePlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update care plan
// @route   PUT /api/care-plans/:id
// @access  Private
export const updateCarePlan = async (req, res) => {
  try {
    const carePlan = await CarePlan.findById(req.params.id);

    if (!carePlan) {
      return res.status(404).json({ message: 'Care plan not found' });
    }

    if (carePlan.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedCarePlan = await CarePlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedCarePlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete care plan
// @route   DELETE /api/care-plans/:id
// @access  Private
export const deleteCarePlan = async (req, res) => {
  try {
    const carePlan = await CarePlan.findById(req.params.id);

    if (!carePlan) {
      return res.status(404).json({ message: 'Care plan not found' });
    }

    if (carePlan.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await carePlan.deleteOne();
    res.json({ message: 'Care plan removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
