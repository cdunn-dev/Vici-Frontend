import { NextPage } from 'next';
import Head from 'next/head';
import { Container, Typography, Box, Card, CardContent } from '@mui/material';
import { Layout } from '@/components/layout/Layout';
import { FiTarget, FiActivity, FiTrendingUp } from 'react-icons/fi';

const features = [
  {
    title: 'Personalized Plans',
    description: 'AI-powered training plans tailored to your goals and fitness level',
    icon: FiTarget,
  },
  {
    title: 'Progress Tracking',
    description: 'Track your workouts and monitor your progress over time',
    icon: FiActivity,
  },
  {
    title: 'Performance Analytics',
    description: 'In-depth analytics to help you optimize your training',
    icon: FiTrendingUp,
  },
];

const Home: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>Vici - Personalized Training Plans</title>
        <meta name="description" content="AI-powered personalized training plans for athletes" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Container maxWidth="lg">
          <Box className="py-20">
            <Typography
              variant="h1"
              component="h1"
              className="text-center mb-6 text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl md:text-6xl"
            >
              Welcome to{' '}
              <span className="text-primary-600 dark:text-primary-500">
                Vici
              </span>
            </Typography>
            
            <Typography
              variant="h2"
              component="p"
              className="text-center mb-12 text-xl text-gray-600 dark:text-gray-300 sm:text-2xl"
            >
              Personalized training plans powered by AI
            </Typography>

            <Box className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Box className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900 mb-4">
                      <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </Box>
                    <Typography
                      variant="h5"
                      component="h3"
                      className="mb-2 font-semibold text-gray-900 dark:text-white"
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      className="text-gray-600 dark:text-gray-300"
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </Container>
      </main>
    </Layout>
  );
};

export default Home; 