import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { appointmentAPI, carePlanAPI, healthResourceAPI } from '../services/api';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Text,
  Badge,
  Button,
  useToast,
  Spinner,
  Center,
  Divider,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { FiCalendar, FiActivity, FiBook, FiTrendingUp } from 'react-icons/fi';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [carePlans, setCarePlans] = useState([]);
  const [healthResources, setHealthResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const sectionCardBg = useColorModeValue('white', 'gray.800');
  const sectionCardHoverBg = useColorModeValue('gray.50', 'gray.700');
  const mutedText = useColorModeValue('gray.600', 'gray.300');
  const subtleText = useColorModeValue('gray.500', 'gray.400');
  const sectionCardBorder = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [appointmentsRes, carePlansRes, resourcesRes] = await Promise.all([
        appointmentAPI.getAll(),
        carePlanAPI.getAll(),
        healthResourceAPI.getAll({ featured: true })
      ]);

      setAppointments(appointmentsRes.data.filter(apt => 
        new Date(apt.dateTime) >= new Date()
      ).slice(0, 3));
      setCarePlans(carePlansRes.data.filter(cp => cp.status === 'active'));
      setHealthResources(resourcesRes.data);
    } catch (error) {
      toast({
        title: 'Error loading dashboard',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
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
        <Box>
          <Heading size="xl">Welcome back, {user?.profile?.firstName || 'User'}!</Heading>
          <Text color="gray.600" mt={2}>Here's your health overview</Text>
        </Box>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card>
            <CardBody>
              <HStack>
                <Icon as={FiTrendingUp} boxSize={8} color="primary.500" />
                <Box>
                  <Text fontSize="sm" color="gray.600">Health score</Text>
                  <Heading size="md">{user?.riskScore || 0}</Heading>
                </Box>
              </HStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <HStack>
                <Icon as={FiCalendar} boxSize={8} color="blue.500" />
                <Box>
                  <Text fontSize="sm" color="gray.600">Upcoming Appointments</Text>
                  <Heading size="md">{appointments.length}</Heading>
                </Box>
              </HStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <HStack>
                <Icon as={FiActivity} boxSize={8} color="green.500" />
                <Box>
                  <Text fontSize="sm" color="gray.600">Active Care Plans</Text>
                  <Heading size="md">{carePlans.length}</Heading>
                </Box>
              </HStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <HStack>
                <Icon as={FiBook} boxSize={8} color="purple.500" />
                <Box>
                  <Text fontSize="sm" color="gray.600">Resources</Text>
                  <Heading size="md">{healthResources.length}</Heading>
                </Box>
              </HStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Upcoming Appointments</Heading>
              <Button size="sm" variant="outline" onClick={() => navigate('/appointments')}>View All</Button>
            </HStack>
          </CardHeader>
          <Divider />
          <CardBody>
            {appointments.length === 0 ? (
              <Text color={subtleText}>No upcoming appointments</Text>
            ) : (
              <VStack spacing={3} align="stretch">
                {appointments.map((appointment) => (
                  <Box
                    key={appointment._id}
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    bg={sectionCardBg}
                    borderColor={sectionCardBorder}
                    _hover={{ bg: sectionCardHoverBg }}
                  >
                    <HStack justify="space-between">
                      <Box>
                        <Text fontWeight="bold">{appointment.title}</Text>
                        <Text fontSize="sm" color={mutedText}>
                          {appointment.provider?.name} - {appointment.provider?.specialty}
                        </Text>
                        <Text fontSize="sm" color={subtleText}>
                          {format(new Date(appointment.dateTime), 'PPP p')}
                        </Text>
                      </Box>
                      <Badge colorScheme="blue">{appointment.type}</Badge>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>

        {/* Active Care Plans */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Active Care Plans</Heading>
              <Button size="sm" variant="outline" onClick={() => navigate('/care-plans')}>View All</Button>
            </HStack>
          </CardHeader>
          <Divider />
          <CardBody>
            {carePlans.length === 0 ? (
              <Text color={subtleText}>No active care plans</Text>
            ) : (
              <VStack spacing={3} align="stretch">
                {carePlans.map((plan) => (
                  <Box
                    key={plan._id}
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    bg={sectionCardBg}
                    borderColor={sectionCardBorder}
                    _hover={{ bg: sectionCardHoverBg }}
                  >
                    <HStack justify="space-between">
                      <Box>
                        <Text fontWeight="bold">{plan.title}</Text>
                        <Text fontSize="sm" color={mutedText}>{plan.description}</Text>
                      </Box>
                      <Box textAlign="right">
                        <Text fontSize="sm" color={mutedText}>Progress</Text>
                        <Text fontWeight="bold">{plan.progress}%</Text>
                      </Box>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>

        {/* Health Resources */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Health Resources</Heading>
              <Button size="sm" variant="outline" onClick={() => navigate('/resources')}>View All</Button>
            </HStack>
          </CardHeader>
          <Divider />
          <CardBody>
            {healthResources.length === 0 ? (
              <Text color={subtleText}>No resources available</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {healthResources.map((resource) => (
                  <Box
                    key={resource._id}
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    bg={sectionCardBg}
                    borderColor={sectionCardBorder}
                    _hover={{ bg: sectionCardHoverBg }}
                  >
                    <Badge mb={2}>{resource.category}</Badge>
                    <Text fontWeight="bold">{resource.title}</Text>
                    <Text fontSize="sm" color={mutedText} noOfLines={2}>
                      {resource.description}
                    </Text>
                    {resource.duration && (
                      <Text fontSize="xs" color={subtleText} mt={2}>
                        {resource.duration}
                      </Text>
                    )}
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default Dashboard;
