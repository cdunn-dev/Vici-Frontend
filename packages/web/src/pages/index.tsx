import { useRouter } from 'next/router';
import Head from 'next/head';

const HomePage = () => {
  const router = useRouter();

  return (
    <div>
      <Head>
        <title>Vici - Performance Training</title>
        <meta name="description" content="Your personalized training companion" />
      </Head>

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          Welcome to Vici
        </h1>
        
        <p style={{ marginBottom: '2rem' }}>
          Your personalized training companion for achieving your fitness goals.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            style={{ 
              background: '#5224EF', 
              color: 'white', 
              padding: '0.5rem 1rem', 
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
            onClick={() => router.push('/training/plans')}
          >
            My Training Plans
          </button>
          
          <button
            style={{ 
              background: 'transparent', 
              color: '#5224EF', 
              padding: '0.5rem 1rem', 
              border: '1px solid #5224EF',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
            onClick={() => router.push('/training/workouts')}
          >
            View Workouts
          </button>
          
          <button
            style={{ 
              background: 'transparent', 
              color: '#5224EF', 
              padding: '0.5rem 1rem', 
              border: '1px solid #5224EF',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
            onClick={() => router.push('/analytics')}
          >
            Analytics
          </button>
        </div>
      </main>
    </div>
  );
};

export default HomePage; 