import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Flex, 
  Header, 
  Sidebar, 
  Footer, 
  Container 
} from '@vici/shared/components';
import { useAuth } from '@vici/shared/hooks/auth';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Training Plans', path: '/training/plans' },
    { label: 'Workouts', path: '/training/workouts' },
    { label: 'Analytics', path: '/analytics' },
    { label: 'Profile', path: '/profile' },
    { label: 'Settings', path: '/settings' },
  ];

  return (
    <Flex direction="column" minHeight="100vh">
      <Header 
        username={user?.name} 
        onLogout={handleLogout} 
        profileImage={user?.profilePicture}
      />
      
      <Flex flex={1}>
        <Sidebar 
          items={navItems} 
          activePath={router.pathname} 
          onNavigate={(path) => router.push(path)}
        />
        
        <Box as="main" flex={1} bg="gray.50" overflowY="auto">
          <Container maxW="1200px" py={8}>
            {children}
          </Container>
        </Box>
      </Flex>
      
      <Footer 
        copyright={`© ${new Date().getFullYear()} Vici. All rights reserved.`}
      />
    </Flex>
  );
}; 