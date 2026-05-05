import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { appointmentAPI, doctorAPI } from '../services/api';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  useToast,
  useColorModeValue,
  Spinner,
  Center,
  Text,
  Badge,
  Card,
  CardBody,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Divider,
  Avatar
} from '@chakra-ui/react';
import { format, isValid } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    type: 'checkup',
    providerName: '',
    providerSpecialty: '',
    providerFacility: '',
    date: '',
    time: '',
    duration: 30,
    location: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.800');
  const selectedBg = useColorModeValue('primary.50', 'gray.700');
  const borderBase = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await doctorAPI.getAll({ active: true });
      setDoctors(response.data);
    } catch (error) {
      toast({
        title: 'Error loading doctors',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };


  const fetchAppointments = async () => {
    try {
      const response = await appointmentAPI.getAll();
      setAppointments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast({
        title: 'Error loading appointments',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'blue';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  const isUpcomingAppointment = (appointment) => {
    return appointment.status === 'scheduled' && new Date(appointment.dateTime) >= new Date();
  };

  const upcomingAppointments = appointments.filter(isUpcomingAppointment);
  const pastAppointments = appointments.filter((appointment) => !isUpcomingAppointment(appointment));

  const formatAppointmentDateTime = (value) => {
    const date = new Date(value);
    if (!isValid(date)) {
      return 'Date/time unavailable';
    }
    return format(date, 'PPP p');
  };

  const formatAppointmentLocation = (location) => {
    if (!location) {
      return 'Location unavailable';
    }

    if (typeof location === 'string') {
      return location;
    }

    return location.address || location.type || 'Location unavailable';
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDoctorChange = (name) => {
    const selected = doctors.find(d => d.name === name);
    if (!selected) {
      setFormData({
        ...formData,
        providerName: '',
        providerSpecialty: '',
        providerFacility: ''
      });
      return;
    }
    setFormData({
      ...formData,
      providerName: selected.name,
      providerSpecialty: selected.specialty,
      providerFacility: selected.facility
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!formData.date || !formData.time) {
        throw new Error('Please select a date and time');
      }
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      const payload = {
        title: formData.title,
        type: formData.type,
        provider: {
          name: formData.providerName,
          specialty: formData.providerSpecialty,
          facility: formData.providerFacility
        },
        dateTime,
        duration: Number(formData.duration),
        location: {
          type: 'clinic',
          address: formData.location
        },
        notes: formData.notes
      };

      await appointmentAPI.create(payload);
      await fetchAppointments();
      setFormData({
        title: '',
        type: 'checkup',
        providerName: '',
        providerSpecialty: '',
        providerFacility: '',
        date: '',
        time: '',
        duration: 30,
        location: '',
        notes: ''
      });

      toast({
        title: 'Appointment booked',
        description: 'Your appointment has been scheduled successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Booking failed',
        description: error.response?.data?.message || error.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await appointmentAPI.update(appointmentId, { status: 'cancelled' });
      await fetchAppointments();

      toast({
        title: 'Appointment cancelled',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Cancellation failed',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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
            <Heading size="xl">My Appointments</Heading>
            <Text color="gray.600" mt={2}>View and manage your healthcare appointments</Text>
          </Box>
          <Button colorScheme="primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </HStack>

        <Card>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Book an Appointment</Heading>
              <Text color="gray.600">
                Choose a doctor and preferred time. We will confirm your appointment.
              </Text>
              <Divider />

              <Box as="form" onSubmit={handleSubmit}>
                <VStack spacing={4} align="stretch">
                  <HStack spacing={4} align="flex-start">
                    <FormControl isRequired>
                      <FormLabel>Appointment Title</FormLabel>
                      <Input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., Follow-up consultation"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Type</FormLabel>
                      <Select name="type" value={formData.type} onChange={handleChange}>
                        <option value="checkup">Checkup</option>
                        <option value="follow-up">Follow-up</option>
                        <option value="therapy">Therapy</option>
                        <option value="consultation">Consultation</option>
                        <option value="test">Test</option>
                        <option value="other">Other</option>
                      </Select>
                    </FormControl>
                  </HStack>

                  <FormControl isRequired>
                    <FormLabel>Choose a Doctor</FormLabel>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {doctors.map((doc) => {
                        const isSelected = formData.providerName === doc.name;
                        return (
                          <Box
                            key={doc._id}
                            p={4}
                            borderWidth={1}
                            borderRadius="lg"
                            cursor="pointer"
                            transition="all 0.2s"
                            borderColor={isSelected ? 'primary.500' : borderBase}
                            bg={isSelected ? selectedBg : cardBg}
                            _hover={{ borderColor: 'primary.400', shadow: 'md' }}
                            onClick={() => handleDoctorChange(doc.name)}
                          >
                            <HStack spacing={4}>
                              <Avatar name={doc.name} src={doc.imageUrl} size="lg" />
                              <Box>
                                <Text fontWeight="bold">{doc.name}</Text>
                                <Text fontSize="sm" color="gray.600">
                                  {doc.specialty}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {doc.facility}
                                </Text>
                              </Box>
                            </HStack>
                          </Box>
                        );
                      })}
                    </SimpleGrid>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Facility</FormLabel>
                    <Input
                      name="providerFacility"
                      value={formData.providerFacility}
                      onChange={handleChange}
                      placeholder="Facility name"
                    />
                  </FormControl>

                  <HStack spacing={4} align="flex-start">
                    <FormControl isRequired>
                      <FormLabel>Date</FormLabel>
                      <Input name="date" type="date" value={formData.date} onChange={handleChange} />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Time</FormLabel>
                      <Input name="time" type="time" value={formData.time} onChange={handleChange} />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Duration (min)</FormLabel>
                      <Input
                        name="duration"
                        type="number"
                        min="15"
                        max="180"
                        value={formData.duration}
                        onChange={handleChange}
                      />
                    </FormControl>
                  </HStack>

                  <FormControl>
                    <FormLabel>Location</FormLabel>
                    <Input
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Building / room / address"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Notes</FormLabel>
                    <Textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Any concerns or details for the doctor"
                    />
                  </FormControl>

                  <Button type="submit" isLoading={saving} loadingText="Booking...">
                    Book Appointment
                  </Button>
                </VStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {appointments.length === 0 ? (
          <Card>
            <CardBody>
              <Center py={10}>
                <VStack spacing={4}>
                  <Text fontSize="lg" color="gray.500">No appointments scheduled</Text>
                  <Text fontSize="sm" color="gray.400">
                    Contact your healthcare provider to schedule an appointment
                  </Text>
                </VStack>
              </Center>
            </CardBody>
          </Card>
        ) : (
          <VStack spacing={6} align="stretch">
            <Box>
              <HStack justify="space-between" mb={3}>
                <Heading size="md">Upcoming Appointments</Heading>
                <Badge colorScheme="blue">{upcomingAppointments.length}</Badge>
              </HStack>
              {upcomingAppointments.length === 0 ? (
                <Text color="gray.500">No upcoming appointments</Text>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {upcomingAppointments.map((appointment) => (
                    <Card key={appointment._id} _hover={{ shadow: 'lg' }} transition="all 0.2s">
                      <CardBody>
                        <VStack align="stretch" spacing={3}>
                          <HStack justify="space-between">
                            <Heading size="md">{appointment.title}</Heading>
                            <Badge colorScheme={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                          </HStack>

                    {appointment.provider && (
                      <Box>
                        <Text fontWeight="semibold" fontSize="sm" color="gray.600">
                          Provider
                        </Text>
                        <Text>
                          {appointment.provider.name} - {appointment.provider.specialty}
                        </Text>
                      </Box>
                    )}

                    <Box>
                      <Text fontWeight="semibold" fontSize="sm" color="gray.600">
                        Date & Time
                      </Text>
                      <Text>{formatAppointmentDateTime(appointment.dateTime)}</Text>
                    </Box>

                    {appointment.location && (
                      <Box>
                        <Text fontWeight="semibold" fontSize="sm" color="gray.600">
                          Location
                        </Text>
                        <Text>{formatAppointmentLocation(appointment.location)}</Text>
                      </Box>
                    )}

                    {appointment.type && (
                      <Box>
                        <Badge colorScheme="purple">{appointment.type}</Badge>
                      </Box>
                    )}

                          {appointment.notes && (
                            <Box>
                              <Text fontWeight="semibold" fontSize="sm" color="gray.600">
                                Notes
                              </Text>
                              <Text fontSize="sm">{appointment.notes}</Text>
                            </Box>
                          )}

                          <Button
                            colorScheme="red"
                            variant="outline"
                            onClick={() => handleCancelAppointment(appointment._id)}
                          >
                            Cancel
                          </Button>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </Box>

            <Box>
              <HStack justify="space-between" mb={3}>
                <Heading size="md">Past Appointments</Heading>
                <Badge colorScheme="gray">{pastAppointments.length}</Badge>
              </HStack>
              {pastAppointments.length === 0 ? (
                <Text color="gray.500">No past appointments</Text>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {pastAppointments.map((appointment) => (
                    <Card key={appointment._id} _hover={{ shadow: 'lg' }} transition="all 0.2s">
                      <CardBody>
                        <VStack align="stretch" spacing={3}>
                          <HStack justify="space-between">
                            <Heading size="md">{appointment.title}</Heading>
                            <Badge colorScheme={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                          </HStack>

                          {appointment.provider && (
                            <Box>
                              <Text fontWeight="semibold" fontSize="sm" color="gray.600">
                                Provider
                              </Text>
                              <Text>
                                {appointment.provider.name} - {appointment.provider.specialty}
                              </Text>
                            </Box>
                          )}

                          <Box>
                            <Text fontWeight="semibold" fontSize="sm" color="gray.600">
                              Date & Time
                            </Text>
                            <Text>{formatAppointmentDateTime(appointment.dateTime)}</Text>
                          </Box>

                          {appointment.location && (
                            <Box>
                              <Text fontWeight="semibold" fontSize="sm" color="gray.600">
                                Location
                              </Text>
                              <Text>{formatAppointmentLocation(appointment.location)}</Text>
                            </Box>
                          )}

                          {appointment.type && (
                            <Box>
                              <Badge colorScheme="purple">{appointment.type}</Badge>
                            </Box>
                          )}

                          {appointment.notes && (
                            <Box>
                              <Text fontWeight="semibold" fontSize="sm" color="gray.600">
                                Notes
                              </Text>
                              <Text fontSize="sm">{appointment.notes}</Text>
                            </Box>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </Box>
          </VStack>
        )}
      </VStack>
    </Container>
  );
};

export default Appointments;
