import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Text,
  Spinner,
  Center
} from '@chakra-ui/react';

const formatValue = (value) => {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : 'None recorded';
  }

  if (value === null || value === undefined || value === '') {
    return 'Not recorded';
  }

  return value;
};

const formatHospitalizations = (hospitalizations = []) => {
  if (!hospitalizations.length) {
    return 'None recorded';
  }

  return hospitalizations
    .map((entry) => entry.reason || entry.hospital || 'Hospitalization noted')
    .join(', ');
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: ''
  });
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const toast = useToast();

  const currentUser = profileData || user;

  useEffect(() => {
    const userId = user?._id;

    if (!userId) {
      setProfileLoading(false);
      return;
    }

    if (profileData?._id === userId) {
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        setProfileData(response.data);
        updateUser(response.data);
      } catch (error) {
        toast({
          title: 'Could not refresh profile',
          description: error.response?.data?.message || 'Showing the last saved profile data',
          status: 'warning',
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [profileData?._id, toast, updateUser, user?._id]);

  useEffect(() => {
    if (currentUser?.profile) {
      setFormData({
        firstName: currentUser.profile.firstName || '',
        lastName: currentUser.profile.lastName || '',
        phone: currentUser.profile.phone || '',
        dateOfBirth: currentUser.profile.dateOfBirth ? new Date(currentUser.profile.dateOfBirth).toISOString().split('T')[0] : '',
        gender: currentUser.profile.gender || ''
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await userAPI.updateProfile({ profile: formData });
      updateUser(response.data);
      setProfileData((prev) => ({ ...(prev || currentUser), ...response.data }));
      
      toast({
        title: 'Profile updated successfully',
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
    }

    setLoading(false);
  };

  if (profileLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="primary.500" />
      </Center>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading>Profile Settings</Heading>

        <Card>
          <CardHeader>
            <Heading size="md">Personal Information</Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <Box as="form" onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <HStack spacing={4} width="full">
                  <FormControl isRequired>
                    <FormLabel>First Name</FormLabel>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Last Name</FormLabel>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel>Phone</FormLabel>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Date of Birth</FormLabel>
                  <Input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Gender</FormLabel>
                  <Input
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="primary"
                  width="full"
                  isLoading={loading}
                  loadingText="Saving..."
                >
                  Save Changes
                </Button>
              </VStack>
            </Box>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Health Summary</Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <VStack align="start" spacing={3}>
              <Text><strong>Email:</strong> {currentUser?.email}</Text>
              <Text><strong>Role:</strong> {currentUser?.role}</Text>
              <Text><strong>Health score:</strong> {currentUser?.riskScore || 0}</Text>
              <Box pt={2}>
                <Heading size="sm" mb={2}>Clinical History</Heading>
                <VStack align="start" spacing={1}>
                  <Text><strong>Conditions:</strong> {formatValue(currentUser?.medicalInfo?.conditions)}</Text>
                  <Text><strong>Allergies:</strong> {formatValue(currentUser?.medicalInfo?.allergies)}</Text>
                  <Text><strong>Medications:</strong> {formatValue(currentUser?.medicalInfo?.medications)}</Text>
                  <Text><strong>Hospitalizations:</strong> {formatHospitalizations(currentUser?.medicalInfo?.hospitalizations)}</Text>
                </VStack>
              </Box>
              <Box pt={2}>
                <Heading size="sm" mb={2}>Lifestyle</Heading>
                <VStack align="start" spacing={1}>
                  <Text><strong>Smoking status:</strong> {formatValue(currentUser?.lifestyle?.smokingStatus)}</Text>
                  <Text><strong>Alcohol consumption:</strong> {formatValue(currentUser?.lifestyle?.alcoholConsumption)}</Text>
                  <Text><strong>Exercise frequency:</strong> {formatValue(currentUser?.lifestyle?.exerciseFrequency)}</Text>
                  <Text><strong>Diet type:</strong> {formatValue(currentUser?.lifestyle?.dietType)}</Text>
                  <Text><strong>Sleep hours:</strong> {formatValue(currentUser?.lifestyle?.sleepHours)}</Text>
                </VStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default Profile;
