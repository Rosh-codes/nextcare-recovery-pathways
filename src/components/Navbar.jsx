import { useMemo } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Flex,
  HStack,
  Button,
  Image,
  Text,
  Spacer,
  useColorMode,
  useColorModeValue,
  IconButton
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();
  const isAuthPage = useMemo(
    () => location.pathname === '/login' || location.pathname === '/register',
    [location.pathname]
  );

  if (isAuthPage) return null;

  return (
    <Box
      bg={useColorModeValue('white', 'gray.900')}
      borderBottom="1px solid"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      px={6}
      py={3}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Flex align="center">
        <HStack spacing={3} as={RouterLink} to="/dashboard">
          <Box
            bg={useColorModeValue('gray.100', 'gray.800')}
            p={2}
            borderRadius="lg"
            boxShadow="sm"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
          >
            <Image
              src="/logo.png"
              alt="NextCare"
              boxSize="28px"
              objectFit="contain"
            />
          </Box>
          <Text
            fontWeight="bold"
            fontSize="lg"
            color={useColorModeValue('gray.800', 'gray.100')}
          >
            NextCare
          </Text>
        </HStack>

        <HStack spacing={2} ml={8} display={{ base: 'none', md: 'flex' }}>
          <Button as={RouterLink} to="/dashboard" variant="ghost" size="sm">
            Dashboard
          </Button>
          <Button as={RouterLink} to="/appointments" variant="ghost" size="sm">
            Appointments
          </Button>
          <Button as={RouterLink} to="/care-plans" variant="ghost" size="sm">
            Care Plans
          </Button>
          <Button as={RouterLink} to="/resources" variant="ghost" size="sm">
            Resources
          </Button>
          {(user?.role === 'doctor' || user?.role === 'healthcare_provider' || isAdmin) && (
            <Button as={RouterLink} to="/patient-records" variant="ghost" size="sm">
              Patient Records
            </Button>
          )}
          <Button as={RouterLink} to="/profile" variant="ghost" size="sm">
            Profile
          </Button>
          {isAdmin && (
            <Button as={RouterLink} to="/admin" variant="ghost" size="sm">
              Admin
            </Button>
          )}
        </HStack>

        <Spacer />

        <HStack spacing={2}>
          <IconButton
            aria-label="Toggle theme"
            size="sm"
            variant="ghost"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
          />
          {user && (
            <HStack spacing={3}>
              <Button as={RouterLink} to="/appointments" size="sm">
                Book Appointment
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                Sign Out
              </Button>
            </HStack>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
