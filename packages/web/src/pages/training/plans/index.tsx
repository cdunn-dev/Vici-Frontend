import { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Button,
  Card,
  Container, 
  Flex, 
  Grid,
  GridItem,
  Heading, 
  Icon,
  Text,
  VStack,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@vici/shared/components';
import { FiPlus, FiMoreVertical } from 'react-icons/fi';
import { useTrainingPlans } from '@vici/shared/hooks/training';
import { formatDate } from '@vici/shared/utils/date';
import { MainLayout } from '../../../layouts/MainLayout';

const TrainingPlansPage = () => {
  const router = useRouter();
  const { data: plans, isLoading, error } = useTrainingPlans();
  
  const handleCreatePlan = () => {
    router.push('/training/plans/new');
  };

  const handleViewPlan = (planId: string) => {
    router.push(`/training/plans/${planId}`);
  };

  // Function to render badge based on status
  const renderStatusBadge = (status: string) => {
    let color;
    switch (status) {
      case 'Active':
        color = 'green';
        break;
      case 'Completed':
        color = 'blue';
        break;
      case 'Cancelled':
        color = 'red';
        break;
      default:
        color = 'gray';
    }
    
    return <Badge colorScheme={color}>{status}</Badge>;
  };

  return (
    <MainLayout>
      <Container maxW="1200px" py={8}>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading as="h1" size="lg">
              Training Plans
            </Heading>
            <Text color="gray.600">
              Manage your training plans and goals
            </Text>
          </Box>
          <Button 
            leftIcon={<Icon as={FiPlus} />} 
            onClick={handleCreatePlan}
            variant="primary"
          >
            Create Plan
          </Button>
        </Flex>

        {isLoading ? (
          <Box p={6} textAlign="center">
            <Text>Loading training plans...</Text>
          </Box>
        ) : error ? (
          <Box p={6} textAlign="center" color="red.500">
            <Text>Error loading training plans. Please try again.</Text>
          </Box>
        ) : plans?.length === 0 ? (
          <Card p={8} textAlign="center">
            <VStack spacing={4}>
              <Text fontSize="lg">You don't have any training plans yet.</Text>
              <Button
                variant="primary"
                leftIcon={<Icon as={FiPlus} />}
                onClick={handleCreatePlan}
              >
                Create Your First Plan
              </Button>
            </VStack>
          </Card>
        ) : (
          <Grid 
            templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} 
            gap={6}
          >
            {plans?.map((plan) => (
              <GridItem key={plan.id}>
                <Card p={0} overflow="hidden" cursor="pointer" h="100%">
                  <Box 
                    p={5} 
                    onClick={() => handleViewPlan(plan.id)}
                    h="100%"
                  >
                    <Flex justify="space-between" align="start" mb={3}>
                      <Heading as="h3" size="md" noOfLines={1}>
                        {plan.goal.name || 'Unnamed Plan'}
                      </Heading>
                      <Menu>
                        <MenuButton
                          as={Box}
                          onClick={(e) => e.stopPropagation()}
                          cursor="pointer"
                        >
                          <Icon as={FiMoreVertical} />
                        </MenuButton>
                        <MenuList onClick={(e) => e.stopPropagation()}>
                          <MenuItem onClick={() => handleViewPlan(plan.id)}>
                            View Details
                          </MenuItem>
                          <MenuItem onClick={() => router.push(`/training/plans/${plan.id}/edit`)}>
                            Edit Plan
                          </MenuItem>
                          <MenuItem color="red.500">
                            Delete Plan
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Flex>

                    <Text fontSize="sm" color="gray.600" mb={3}>
                      Created: {formatDate(plan.createdAt)}
                    </Text>

                    <Flex gap={2} mb={3} wrap="wrap">
                      {renderStatusBadge(plan.status)}
                      <Badge colorScheme="purple">
                        {plan.goal.type}
                      </Badge>
                    </Flex>

                    <Text noOfLines={2} mb={4}>
                      {plan.goal.description || 'No description provided'}
                    </Text>

                    <Flex justify="space-between" align="center" mt="auto">
                      <Text fontSize="sm" fontWeight="medium">
                        {plan._count?.workouts || 0} Workouts
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {plan.settings?.duration || '-'} weeks
                      </Text>
                    </Flex>
                  </Box>
                </Card>
              </GridItem>
            ))}
          </Grid>
        )}
      </Container>
    </MainLayout>
  );
};

export default TrainingPlansPage; 