import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { carePlanAPI, userAPI } from '../services/api';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  useToast,
  Spinner,
  Center,
  Text,
  Badge,
  Card,
  CardBody,
  Progress,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const CarePlans = () => {
  const { user } = useAuth();
  const [carePlans, setCarePlans] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctorForm, setDoctorForm] = useState({
    patientId: '',
    title: '',
    goalText: '',
    recommendedActions: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const canManagePlans = user?.role === 'doctor' || user?.role === 'healthcare_provider' || user?.role === 'admin';

  useEffect(() => {
    fetchCarePlans();
    if (canManagePlans) {
      fetchPatients();
    }
  }, [canManagePlans]);

  const fetchCarePlans = async () => {
    try {
      const response = await carePlanAPI.getAll();
      setCarePlans(response.data);
    } catch (error) {
      toast({
        title: 'Error loading care plans',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await userAPI.getPatients();
      setPatients(response.data);
      if (response.data.length > 0) {
        setDoctorForm((prev) => ({ ...prev, patientId: response.data[0]._id }));
      }
    } catch (error) {
      toast({
        title: 'Error loading patients',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDoctorFormChange = (e) => {
    setDoctorForm({ ...doctorForm, [e.target.name]: e.target.value });
  };

  const handleCreateCarePlan = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await carePlanAPI.create({
        patientId: doctorForm.patientId,
        title: doctorForm.title,
        goalText: doctorForm.goalText,
        recommendedActions: doctorForm.recommendedActions,
      });

      toast({
        title: 'Care plan created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setDoctorForm((prev) => ({
        ...prev,
        title: '',
        goalText: '',
        recommendedActions: ''
      }));
    } catch (error) {
      toast({
        title: 'Error creating care plan',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'completed':
        return 'blue';
      case 'on-hold':
        return 'orange';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="primary.500" />
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Box>
            <Heading size="xl">My Care Plans</Heading>
            <Text color="gray.600" mt={2}>Track your personalized recovery plans</Text>
          </Box>
          <Button colorScheme="primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </HStack>

        {canManagePlans && (
          <Card>
            <CardBody>
              <Box as="form" onSubmit={handleCreateCarePlan}>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">Create Care Plan</Heading>
                  <FormControl isRequired>
                    <FormLabel>Patient</FormLabel>
                    <Select name="patientId" value={doctorForm.patientId} onChange={handleDoctorFormChange}>
                      {patients.map((patient) => (
                        <option key={patient._id} value={patient._id}>
                          {patient.profile?.firstName} {patient.profile?.lastName} - {patient.email}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Plan Title</FormLabel>
                    <Input name="title" value={doctorForm.title} onChange={handleDoctorFormChange} placeholder="Recovery plan" />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Goals</FormLabel>
                    <Textarea name="goalText" value={doctorForm.goalText} onChange={handleDoctorFormChange} placeholder="One goal per line" />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Recommended Actions</FormLabel>
                    <Textarea name="recommendedActions" value={doctorForm.recommendedActions} onChange={handleDoctorFormChange} placeholder="One recommended action per line" />
                  </FormControl>
                  <Button type="submit" colorScheme="primary" isLoading={saving} loadingText="Saving..." isDisabled={!patients.length}>
                    Save
                  </Button>
                </VStack>
              </Box>
            </CardBody>
          </Card>
        )}

        {carePlans.length === 0 ? (
          <Card>
            <CardBody>
              <Center py={10}>
                <VStack spacing={4}>
                  <Text fontSize="lg" color="gray.500">No care plans yet</Text>
                  <Text fontSize="sm" color="gray.400">
                    Your healthcare provider will create a personalized care plan for you
                  </Text>
                </VStack>
              </Center>
            </CardBody>
          </Card>
        ) : (
          <SimpleGrid columns={{ base: 1 }} spacing={6}>
            {carePlans.map((plan) => (
              <Card key={plan._id} _hover={{ shadow: 'lg' }} transition="all 0.2s">
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between" align="start">
                      <Box flex={1}>
                        <Heading size="md">{plan.title}</Heading>
                        <Text color="gray.600" mt={2}>{plan.description}</Text>
                      </Box>
                      <Badge colorScheme={getStatusColor(plan.status)} fontSize="sm">
                        {plan.status}
                      </Badge>
                    </HStack>

                    <Box>
                      <HStack justify="space-between" mb={2}>
                        <Text fontWeight="semibold" fontSize="sm">Progress</Text>
                        <Text fontWeight="bold">{plan.progress || 0}%</Text>
                      </HStack>
                      <Progress
                        value={plan.progress || 0}
                        colorScheme="green"
                        borderRadius="full"
                        size="sm"
                      />
                    </Box>

                    {plan.goals && plan.goals.length > 0 && (
                      <Box>
                        <Text fontWeight="semibold" fontSize="sm" mb={2} color="gray.600">
                          Goals
                        </Text>
                        <VStack align="stretch" spacing={2}>
                          {plan.goals.map((goal, index) => (
                            <HStack key={index} spacing={3}>
                              <Box
                                w={2}
                                h={2}
                                borderRadius="full"
                                bg={goal.completed ? 'green.500' : 'gray.300'}
                              />
                              <Text
                                fontSize="sm"
                                textDecoration={goal.completed ? 'line-through' : 'none'}
                                color={goal.completed ? 'gray.500' : 'gray.700'}
                              >
                                {goal.description || goal.title}
                              </Text>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                    )}

                    {plan.tasks && plan.tasks.length > 0 && (
                      <Box>
                        <Text fontWeight="semibold" fontSize="sm" mb={2} color="gray.600">
                          Recommended Actions
                        </Text>
                        <HStack spacing={2} flexWrap="wrap">
                          {plan.tasks.map((activity, index) => (
                            <Badge key={index} colorScheme="blue" variant="subtle">
                              {activity.title || activity.description || activity}
                            </Badge>
                          ))}
                        </HStack>
                      </Box>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  );
};

export default CarePlans;
