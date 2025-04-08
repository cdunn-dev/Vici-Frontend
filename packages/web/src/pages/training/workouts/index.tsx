import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState } from 'react';

interface Workout {
  id: string;
  name: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

const mockWorkouts: Workout[] = [
  {
    id: '1',
    name: 'Full Body Strength',
    description: 'A complete workout targeting all major muscle groups',
    duration: 45,
    difficulty: 'intermediate',
    tags: ['strength', 'full-body']
  },
  {
    id: '2',
    name: 'HIIT Cardio',
    description: 'High intensity interval training to boost your metabolism',
    duration: 30,
    difficulty: 'advanced',
    tags: ['cardio', 'hiit']
  },
  {
    id: '3',
    name: 'Beginner Mobility',
    description: 'Simple stretches and movements to improve flexibility',
    duration: 20,
    difficulty: 'beginner',
    tags: ['mobility', 'stretching']
  },
  {
    id: '4',
    name: 'Core Power',
    description: 'Focus on abdominal and lower back strength',
    duration: 25,
    difficulty: 'intermediate',
    tags: ['core', 'strength']
  },
  {
    id: '5',
    name: 'Leg Day',
    description: 'Full lower body workout for strength and endurance',
    duration: 40,
    difficulty: 'advanced',
    tags: ['legs', 'strength']
  }
];

const WorkoutsPage = () => {
  const router = useRouter();
  const [filter, setFilter] = useState<string>('');

  const filteredWorkouts = mockWorkouts.filter(workout => 
    workout.name.toLowerCase().includes(filter.toLowerCase()) ||
    workout.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase())) ||
    workout.difficulty.includes(filter.toLowerCase())
  );

  return (
    <div>
      <Head>
        <title>Workouts | Vici</title>
        <meta name="description" content="Browse and manage your workouts" />
      </Head>

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.75rem' }}>My Workouts</h1>
          <button
            style={{
              background: '#5224EF',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
            onClick={() => router.push('/training/workouts/new')}
          >
            Create Workout
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Search workouts..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e2e8f0',
              borderRadius: '0.25rem',
              fontSize: '1rem'
            }}
          />
        </div>

        <div>
          {filteredWorkouts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <p>No workouts found. Try a different search or create a new workout.</p>
            </div>
          ) : (
            filteredWorkouts.map(workout => (
              <div 
                key={workout.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1rem',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onClick={() => router.push(`/training/workouts/${workout.id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{workout.name}</h3>
                    <p style={{ color: '#718096', marginBottom: '0.75rem' }}>{workout.description}</p>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {workout.tags.map(tag => (
                        <span 
                          key={tag} 
                          style={{
                            background: '#EBF4FF',
                            color: '#4A5568',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '1rem',
                            fontSize: '0.75rem'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ 
                      background: workout.difficulty === 'beginner' ? '#C6F6D5' : 
                                 workout.difficulty === 'intermediate' ? '#FEEBC8' : '#FED7D7',
                      color: workout.difficulty === 'beginner' ? '#276749' : 
                            workout.difficulty === 'intermediate' ? '#744210' : '#822727',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      marginBottom: '0.5rem'
                    }}>
                      {workout.difficulty.charAt(0).toUpperCase() + workout.difficulty.slice(1)}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: '#718096' }}>
                      {workout.duration} minutes
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default WorkoutsPage; 