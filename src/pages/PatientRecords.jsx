import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  Spinner,
  Text,
  Textarea,
  VStack,
  useToast,
  Center,
  SimpleGrid,
  Badge
} from '@chakra-ui/react';

const parseList = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const PatientRecords = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({
    conditions: '',
    allergies: '',
    medications: '',
    hospitalizations: '',
    smokingStatus: '',
    alcoholConsumption: '',
    exerciseFrequency: '',
    dietType: '',
    sleepHours: '',
    riskScore: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const selected = patients.find((patient) => patient._id === selectedPatientId);
    if (!selected) {
      return;
    }

    setFormData({
      conditions: (selected.medicalInfo?.conditions || []).join(', '),
      allergies: (selected.medicalInfo?.allergies || []).join(', '),
      medications: (selected.medicalInfo?.medications || []).join(', '),
      hospitalizations: (selected.medicalInfo?.hospitalizations || []).map((entry) => entry.reason || entry.hospital || '').filter(Boolean).join(', '),
      smokingStatus: selected.lifestyle?.smokingStatus || '',
      alcoholConsumption: selected.lifestyle?.alcoholConsumption || '',
      exerciseFrequency: selected.lifestyle?.exerciseFrequency || '',
      dietType: selected.lifestyle?.dietType || '',
      sleepHours: selected.lifestyle?.sleepHours?.toString() || '',
      riskScore: selected.riskScore?.toString() || ''
    });
  }, [patients, selectedPatientId]);

  const fetchPatients = async () => {
    try {
      const response = await userAPI.getPatients();
      setPatients(response.data);
      if (response.data.length > 0) {
        setSelectedPatientId(response.data[0]._id);
      }
    } catch (error) {
      toast({
        title: 'Error loading patients',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await userAPI.updateClinicalDetails(selectedPatientId, {
        medicalInfo: {
          conditions: parseList(formData.conditions),
          allergies: parseList(formData.allergies),
          medications: parseList(formData.medications),
          hospitalizations: parseList(formData.hospitalizations).map((entry) => ({ reason: entry }))
        },
        lifestyle: {
          smokingStatus: formData.smokingStatus,
          alcoholConsumption: formData.alcoholConsumption,
          exerciseFrequency: formData.exerciseFrequency,
          dietType: formData.dietType,
          sleepHours: formData.sleepHours ? Number(formData.sleepHours) : undefined
        },
        riskScore: formData.riskScore ? Number(formData.riskScore) : 0
      });

      toast({
        title: 'Health record updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="primary.500" />
      </Center>
    );
  }

  const selectedPatient = patients.find((patient) => patient._id === selectedPatientId);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="xl">Patient Health Records</Heading>
          <Text color="gray.600" mt={2}>
            Review and update patient clinical information
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Card>
            <CardBody>
              <Text fontSize="sm" color="gray.500">Signed in as</Text>
              <Heading size="md">{user?.role}</Heading>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Text fontSize="sm" color="gray.500">Patients loaded</Text>
              <Heading size="md">{patients.length}</Heading>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Text fontSize="sm" color="gray.500">Selected patient</Text>
              <Heading size="md">{selectedPatient ? `${selectedPatient.profile?.firstName || ''} ${selectedPatient.profile?.lastName || ''}`.trim() : 'None'}</Heading>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Card>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <FormControl>
                <FormLabel>Select Patient</FormLabel>
                <Select value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)}>
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.profile?.firstName} {patient.profile?.lastName} - {patient.email}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {selectedPatient && (
                <HStack spacing={2} flexWrap="wrap">
                  <Badge colorScheme="blue">{selectedPatient.role}</Badge>
                  <Badge colorScheme="purple">Health score {selectedPatient.riskScore || 0}</Badge>
                  <Badge colorScheme={selectedPatient.onboardingCompleted ? 'green' : 'yellow'}>
                    {selectedPatient.onboardingCompleted ? 'Onboarding complete' : 'Onboarding pending'}
                  </Badge>
                </HStack>
              )}
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Box as="form" onSubmit={handleSubmit}>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Conditions</FormLabel>
                  <Textarea name="conditions" value={formData.conditions} onChange={handleChange} placeholder="Comma-separated conditions" />
                </FormControl>
                <FormControl>
                  <FormLabel>Allergies</FormLabel>
                  <Textarea name="allergies" value={formData.allergies} onChange={handleChange} placeholder="Comma-separated allergies" />
                </FormControl>
                <FormControl>
                  <FormLabel>Medications</FormLabel>
                  <Textarea name="medications" value={formData.medications} onChange={handleChange} placeholder="Comma-separated medications" />
                </FormControl>
                <FormControl>
                  <FormLabel>Hospitalizations / Notes</FormLabel>
                  <Textarea name="hospitalizations" value={formData.hospitalizations} onChange={handleChange} placeholder="Comma-separated notes" />
                </FormControl>

                <HStack spacing={4} align="flex-start">
                  <FormControl>
                    <FormLabel>Smoking Status</FormLabel>
                    <Input name="smokingStatus" value={formData.smokingStatus} onChange={handleChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Alcohol Consumption</FormLabel>
                    <Input name="alcoholConsumption" value={formData.alcoholConsumption} onChange={handleChange} />
                  </FormControl>
                </HStack>

                <HStack spacing={4} align="flex-start">
                  <FormControl>
                    <FormLabel>Exercise Frequency</FormLabel>
                    <Input name="exerciseFrequency" value={formData.exerciseFrequency} onChange={handleChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Diet Type</FormLabel>
                    <Input name="dietType" value={formData.dietType} onChange={handleChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Sleep Hours</FormLabel>
                    <Input name="sleepHours" type="number" value={formData.sleepHours} onChange={handleChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Health score</FormLabel>
                    <Input name="riskScore" type="number" value={formData.riskScore} onChange={handleChange} />
                  </FormControl>
                </HStack>

                <Button type="submit" colorScheme="primary" isLoading={saving} loadingText="Saving..." isDisabled={!selectedPatientId}>
                  Save
                </Button>
              </VStack>
            </Box>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default PatientRecords;
