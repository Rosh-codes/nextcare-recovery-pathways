import { useState, useEffect } from 'react';
import { userAPI, appointmentAPI, healthResourceAPI } from '../services/api';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  Spinner,
  Center,
  Badge,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Text,
  Divider
} from '@chakra-ui/react';
import { FiTrash2, FiEdit2 } from 'react-icons/fi';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [resources, setResources] = useState([]);
  const [resourceForm, setResourceForm] = useState({
    title: '',
    category: 'article',
    content: '',
    description: '',
    featured: false
  });
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, appointmentsRes, resourcesRes] = await Promise.all([
        userAPI.getAllUsers(),
        appointmentAPI.getAllAdmin(),
        healthResourceAPI.getAll()
      ]);
      setUsers(usersRes.data);
      setAppointments(appointmentsRes.data);
      setResources(resourcesRes.data);
    } catch (error) {
      toast({
        title: 'Error loading data',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResourceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setResourceForm({
      ...resourceForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const resetResourceForm = () => {
    setResourceForm({
      title: '',
      category: 'article',
      content: '',
      description: '',
      featured: false
    });
    setEditingResourceId(null);
  };

  const handleSaveResource = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        title: resourceForm.title,
        category: resourceForm.category,
        content: resourceForm.content,
        description: resourceForm.description,
        featured: resourceForm.featured
      };

      if (editingResourceId) {
        const response = await healthResourceAPI.update(editingResourceId, payload);
        setResources(resources.map((resource) => (resource._id === editingResourceId ? response.data : resource)));
      } else {
        const response = await healthResourceAPI.create(payload);
        setResources([response.data, ...resources]);
      }

      resetResourceForm();

      toast({
        title: 'Resource saved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error saving resource',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEditResource = (resource) => {
    setEditingResourceId(resource._id);
    setResourceForm({
      title: resource.title || '',
      category: resource.category || 'article',
      content: resource.content || '',
      description: resource.description || '',
      featured: !!resource.featured
    });
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) {
      return;
    }

    try {
      await healthResourceAPI.delete(resourceId);
      setResources(resources.filter((resource) => resource._id !== resourceId));

      toast({
        title: 'Resource deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error deleting resource',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await userAPI.deleteUser(userId);
      setUsers(users.filter(user => user._id !== userId));
      
      toast({
        title: 'User deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error deleting user',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      await appointmentAPI.delete(appointmentId);
      setAppointments(appointments.filter(apt => apt._id !== appointmentId));
      
      toast({
        title: 'Appointment deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error deleting appointment',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString();
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
        <Heading>Admin Dashboard</Heading>

        <Tabs variant="enclosed">
          <TabList flexWrap="wrap">
            <Tab>Users ({users.length})</Tab>
            <Tab>Appointments ({appointments.length})</Tab>
            <Tab>Resources ({resources.length})</Tab>
            <Tab>Reports</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Email</Th>
                      <Th>Role</Th>
                      <Th>Risk Score</Th>
                      <Th>Onboarding</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {users.map((user) => (
                      <Tr key={user._id}>
                        <Td>{user.profile?.firstName} {user.profile?.lastName}</Td>
                        <Td>{user.email}</Td>
                        <Td>
                          <Badge colorScheme={user.role === 'admin' ? 'purple' : user.role === 'doctor' ? 'green' : 'blue'}>
                            {user.role}
                          </Badge>
                        </Td>
                        <Td>{user.riskScore || 0}</Td>
                        <Td>
                          <Badge colorScheme={user.onboardingCompleted ? 'green' : 'yellow'}>
                            {user.onboardingCompleted ? 'Completed' : 'Pending'}
                          </Badge>
                        </Td>
                        <Td>
                          <IconButton
                            icon={<FiTrash2 />}
                            colorScheme="red"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user._id)}
                            aria-label="Delete user"
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            <TabPanel>
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Patient</Th>
                      <Th>Email</Th>
                      <Th>Title</Th>
                      <Th>Type</Th>
                      <Th>Date & Time</Th>
                      <Th>Status</Th>
                      <Th>Provider</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {appointments.map((apt) => (
                      <Tr key={apt._id}>
                        <Td>{apt.userId?.profile?.firstName} {apt.userId?.profile?.lastName}</Td>
                        <Td fontSize="sm">{apt.userId?.email}</Td>
                        <Td>{apt.title}</Td>
                        <Td><Badge colorScheme="cyan" fontSize="xs">{apt.type}</Badge></Td>
                        <Td fontSize="sm">{formatDateTime(apt.dateTime)}</Td>
                        <Td>
                          <Badge colorScheme={apt.status === 'scheduled' ? 'blue' : apt.status === 'completed' ? 'green' : apt.status === 'cancelled' ? 'red' : 'yellow'}>
                            {apt.status}
                          </Badge>
                        </Td>
                        <Td fontSize="sm">{apt.provider?.name || 'N/A'}</Td>
                        <Td>
                          <IconButton
                            icon={<FiTrash2 />}
                            colorScheme="red"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAppointment(apt._id)}
                            aria-label="Delete appointment"
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            <TabPanel>
              <VStack align="stretch" spacing={6}>
                <Card>
                  <CardBody>
                    <Box as="form" onSubmit={handleSaveResource}>
                      <VStack align="stretch" spacing={4}>
                        <Heading size="md">{editingResourceId ? 'Edit Resource' : 'Create Resource'}</Heading>
                        <FormControl isRequired>
                          <FormLabel>Title</FormLabel>
                          <Input name="title" value={resourceForm.title} onChange={handleResourceChange} />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel>Category</FormLabel>
                          <Select name="category" value={resourceForm.category} onChange={handleResourceChange}>
                            <option value="article">Article</option>
                            <option value="video">Video</option>
                            <option value="exercise">Exercise</option>
                            <option value="guide">Guide</option>
                            <option value="tool">Tool</option>
                            <option value="support-group">Support Group</option>
                            <option value="other">Other</option>
                          </Select>
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel>Content</FormLabel>
                          <Textarea name="content" value={resourceForm.content} onChange={handleResourceChange} />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Description</FormLabel>
                          <Textarea name="description" value={resourceForm.description} onChange={handleResourceChange} />
                        </FormControl>
                        <HStack>
                          <Button type="submit" colorScheme="primary">Save</Button>
                          {editingResourceId && <Button variant="outline" onClick={resetResourceForm}>Cancel Edit</Button>}
                        </HStack>
                      </VStack>
                    </Box>
                  </CardBody>
                </Card>

                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Title</Th>
                        <Th>Category</Th>
                        <Th>Description</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {resources.map((resource) => (
                        <Tr key={resource._id}>
                          <Td>{resource.title}</Td>
                          <Td><Badge>{resource.category}</Badge></Td>
                          <Td>{resource.description || resource.content?.slice(0, 60) || 'N/A'}</Td>
                          <Td>
                            <HStack spacing={2}>
                              <IconButton
                                icon={<FiEdit2 />}
                                size="sm"
                                variant="ghost"
                                aria-label="Edit resource"
                                onClick={() => handleEditResource(resource)}
                              />
                              <IconButton
                                icon={<FiTrash2 />}
                                colorScheme="red"
                                variant="ghost"
                                size="sm"
                                aria-label="Delete resource"
                                onClick={() => handleDeleteResource(resource._id)}
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack spacing={6} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                  <Card><CardBody><Text color="gray.500">Users</Text><Heading size="md">{users.length}</Heading></CardBody></Card>
                  <Card><CardBody><Text color="gray.500">Patients</Text><Heading size="md">{users.filter((user) => user.role === 'patient').length}</Heading></CardBody></Card>
                  <Card><CardBody><Text color="gray.500">Appointments</Text><Heading size="md">{appointments.length}</Heading></CardBody></Card>
                  <Card><CardBody><Text color="gray.500">Resources</Text><Heading size="md">{resources.length}</Heading></CardBody></Card>
                </SimpleGrid>

                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>Platform Usage Statistics</Heading>
                    <VStack align="stretch" spacing={2}>
                      <Text>Scheduled appointments: {appointments.filter((appointment) => appointment.status === 'scheduled').length}</Text>
                      <Text>Cancelled appointments: {appointments.filter((appointment) => appointment.status === 'cancelled').length}</Text>
                      <Text>Completed appointments: {appointments.filter((appointment) => appointment.status === 'completed').length}</Text>
                      <Text>Health resources published: {resources.length}</Text>
                    </VStack>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>Recent Activity Logs</Heading>
                    <VStack align="stretch" spacing={3}>
                      {appointments.slice(0, 5).map((appointment) => (
                        <Box key={appointment._id} p={3} borderWidth="1px" borderRadius="md">
                          <Text fontWeight="semibold">Appointment: {appointment.title}</Text>
                          <Text fontSize="sm" color="gray.600">{formatDateTime(appointment.dateTime)} - {appointment.status}</Text>
                        </Box>
                      ))}
                      {users.slice(0, 5).map((user) => (
                        <Box key={user._id} p={3} borderWidth="1px" borderRadius="md">
                          <Text fontWeight="semibold">User: {user.email}</Text>
                          <Text fontSize="sm" color="gray.600">Role {user.role}, joined {formatDateTime(user.createdAt)}</Text>
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};

export default Admin;
