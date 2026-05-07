import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import { calculateRiskScore } from '../utils/riskScoreCalculator';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Progress,
  Button,
  useToast,
  FormControl,
  FormLabel,
  Input,
  Select,
  Checkbox,
  CheckboxGroup,
  Stack,
  Text,
  Card,
  CardHeader,
  CardBody,
  Divider
} from '@chakra-ui/react';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [basicInfo, setBasicInfo] = useState({
    dateOfBirth: '',
    gender: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  const [medicalInfo, setMedicalInfo] = useState({
    conditions: [],
    allergies: [],
    medications: []
  });

  const [lifestyle, setLifestyle] = useState({
    smokingStatus: '',
    alcoholConsumption: '',
    exerciseFrequency: '',
    dietType: '',
    sleepHours: ''
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);

    try {
      // Calculate health score
      const userData = {
        medicalInfo,
        lifestyle
      };
      const riskScore = calculateRiskScore(userData);

      const response = await userAPI.updateProfile({
        profile: basicInfo,
        medicalInfo,
        lifestyle,
        riskScore,
        onboardingCompleted: true
      });

      updateUser(response.data);
      
      toast({
        title: 'Onboarding completed!',
        description: 'Welcome to NextCare',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to complete onboarding',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }

    setLoading(false);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Date of Birth</FormLabel>
              <Input
                type="date"
                value={basicInfo.dateOfBirth}
                onChange={(e) => setBasicInfo({ ...basicInfo, dateOfBirth: e.target.value })}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Gender</FormLabel>
              <Select
                value={basicInfo.gender}
                onChange={(e) => setBasicInfo({ ...basicInfo, gender: e.target.value })}
                placeholder="Select gender"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Phone</FormLabel>
              <Input
                type="tel"
                value={basicInfo.phone}
                onChange={(e) => setBasicInfo({ ...basicInfo, phone: e.target.value })}
                placeholder="(123) 456-7890"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Street Address</FormLabel>
              <Input
                value={basicInfo.address.street}
                onChange={(e) => setBasicInfo({ 
                  ...basicInfo, 
                  address: { ...basicInfo.address, street: e.target.value } 
                })}
              />
            </FormControl>

            <HStack spacing={4} width="full">
              <FormControl>
                <FormLabel>City</FormLabel>
                <Input
                  value={basicInfo.address.city}
                  onChange={(e) => setBasicInfo({ 
                    ...basicInfo, 
                    address: { ...basicInfo.address, city: e.target.value } 
                  })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>State</FormLabel>
                <Input
                  value={basicInfo.address.state}
                  onChange={(e) => setBasicInfo({ 
                    ...basicInfo, 
                    address: { ...basicInfo.address, state: e.target.value } 
                  })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>ZIP Code</FormLabel>
                <Input
                  value={basicInfo.address.zipCode}
                  onChange={(e) => setBasicInfo({ 
                    ...basicInfo, 
                    address: { ...basicInfo.address, zipCode: e.target.value } 
                  })}
                />
              </FormControl>
            </HStack>
          </VStack>
        );

      case 2:
        return (
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Medical Conditions (comma-separated)</FormLabel>
              <Input
                value={medicalInfo.conditions.join(', ')}
                onChange={(e) => setMedicalInfo({ 
                  ...medicalInfo, 
                  conditions: e.target.value.split(',').map(c => c.trim()).filter(c => c) 
                })}
                placeholder="e.g., Diabetes, Hypertension"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Allergies (comma-separated)</FormLabel>
              <Input
                value={medicalInfo.allergies.join(', ')}
                onChange={(e) => setMedicalInfo({ 
                  ...medicalInfo, 
                  allergies: e.target.value.split(',').map(a => a.trim()).filter(a => a) 
                })}
                placeholder="e.g., Penicillin, Peanuts"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Current Medications (comma-separated)</FormLabel>
              <Input
                value={medicalInfo.medications.join(', ')}
                onChange={(e) => setMedicalInfo({ 
                  ...medicalInfo, 
                  medications: e.target.value.split(',').map(m => m.trim()).filter(m => m) 
                })}
                placeholder="e.g., Aspirin, Metformin"
              />
            </FormControl>
          </VStack>
        );

      case 3:
        return (
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Smoking Status</FormLabel>
              <Select
                value={lifestyle.smokingStatus}
                onChange={(e) => setLifestyle({ ...lifestyle, smokingStatus: e.target.value })}
                placeholder="Select status"
              >
                <option value="never">Never smoked</option>
                <option value="former">Former smoker</option>
                <option value="current">Current smoker</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Alcohol Consumption</FormLabel>
              <Select
                value={lifestyle.alcoholConsumption}
                onChange={(e) => setLifestyle({ ...lifestyle, alcoholConsumption: e.target.value })}
                placeholder="Select frequency"
              >
                <option value="none">None</option>
                <option value="occasional">Occasional</option>
                <option value="moderate">Moderate</option>
                <option value="heavy">Heavy</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Exercise Frequency</FormLabel>
              <Select
                value={lifestyle.exerciseFrequency}
                onChange={(e) => setLifestyle({ ...lifestyle, exerciseFrequency: e.target.value })}
                placeholder="Select frequency"
              >
                <option value="none">None</option>
                <option value="1-2_per_week">1-2 times per week</option>
                <option value="3-4_per_week">3-4 times per week</option>
                <option value="5+_per_week">5+ times per week</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Average Sleep Hours</FormLabel>
              <Input
                type="number"
                min="0"
                max="24"
                value={lifestyle.sleepHours}
                onChange={(e) => setLifestyle({ ...lifestyle, sleepHours: e.target.value })}
                placeholder="e.g., 7"
              />
            </FormControl>
          </VStack>
        );

      default:
        return null;
    }
  };

  const stepTitles = ['Basic Information', 'Medical History', 'Lifestyle'];

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading mb={2}>Complete Your Profile</Heading>
          <Text color="gray.600">Step {step} of {totalSteps}: {stepTitles[step - 1]}</Text>
          <Progress value={progress} colorScheme="primary" mt={4} />
        </Box>

        <Card>
          <CardHeader>
            <Heading size="md">{stepTitles[step - 1]}</Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            {renderStep()}
          </CardBody>
        </Card>

        <HStack justify="space-between">
          <Button
            onClick={handleBack}
            isDisabled={step === 1}
            variant="outline"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            colorScheme="primary"
            isLoading={loading}
            loadingText={step === totalSteps ? "Completing..." : "Next"}
          >
            {step === totalSteps ? 'Complete' : 'Next'}
          </Button>
        </HStack>
      </VStack>
    </Container>
  );
};

export default Onboarding;
