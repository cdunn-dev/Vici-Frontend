import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState } from 'react';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restTime: number;
  notes?: string;
}

interface Workout {
  id: string;
  name: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  exercises: Exercise[];
}

// Mock data for workout details
const mockWorkouts: Record<string, Workout> = {
  '1': {
    id: '1',
    name: 'Full Body Strength',
    description: 'A complete workout targeting all major muscle groups',
    duration: 45,
    difficulty: 'intermediate',
    tags: ['strength', 'full-body'],
    exercises: [
      { id: 'e1', name: 'Squats', sets: 3, reps: 12, restTime: 60 },
      { id: 'e2', name: 'Push-ups', sets: 3, reps: 10, restTime: 45 },
      { id: 'e3', name: 'Deadlifts', sets: 3, reps: 8, restTime: 90, notes: 'Focus on form' },
      { id: 'e4', name: 'Shoulder Press', sets: 3, reps: 10, restTime: 60 },
      { id: 'e5', name: 'Lunges', sets: 3, reps: 12, restTime: 45 },
      { id: 'e6', name: 'Pull-ups', sets: 3, reps: 8, restTime: 60, notes: 'Use assistance if needed' }
    ]
  },
  '2': {
    id: '2',
    name: 'HIIT Cardio',
    description: 'High intensity interval training to boost your metabolism',
    duration: 30,
    difficulty: 'advanced',
    tags: ['cardio', 'hiit'],
    exercises: [
      { id: 'e1', name: 'Burpees', sets: 4, reps: 15, restTime: 30 },
      { id: 'e2', name: 'Mountain Climbers', sets: 4, reps: 20, restTime: 30 },
      { id: 'e3', name: 'Jumping Jacks', sets: 4, reps: 30, restTime: 30 },
      { id: 'e4', name: 'High Knees', sets: 4, reps: 20, restTime: 30 },
      { id: 'e5', name: 'Jump Squats', sets: 4, reps: 15, restTime: 30 }
    ]
  },
  '3': {
    id: '3',
    name: 'Beginner Mobility',
    description: 'Simple stretches and movements to improve flexibility',
    duration: 20,
    difficulty: 'beginner',
    tags: ['mobility', 'stretching'],
    exercises: [
      { id: 'e1', name: 'Cat-Cow Stretch', sets: 2, reps: 10, restTime: 30 },
      { id: 'e2', name: 'Hip Opener', sets: 2, reps: 8, restTime: 30, notes: 'Hold for 5 seconds' },
      { id: 'e3', name: 'Shoulder Rolls', sets: 2, reps: 12, restTime: 30 },
      { id: 'e4', name: 'Ankle Rotations', sets: 2, reps: 10, restTime: 30 },
      { id: 'e5', name: 'Side Bends', sets: 2, reps: 8, restTime: 30 }
    ]
  },
  '4': {
    id: '4',
    name: 'Core Power',
    description: 'Focus on abdominal and lower back strength',
    duration: 25,
    difficulty: 'intermediate',
    tags: ['core', 'strength'],
    exercises: [
      { id: 'e1', name: 'Planks', sets: 3, reps: 1, restTime: 45, notes: 'Hold for 30 seconds' },
      { id: 'e2', name: 'Crunches', sets: 3, reps: 15, restTime: 45 },
      { id: 'e3', name: 'Russian Twists', sets: 3, reps: 12, restTime: 45 },
      { id: 'e4', name: 'Leg Raises', sets: 3, reps: 10, restTime: 45 },
      { id: 'e5', name: 'Superman', sets: 3, reps: 10, restTime: 45, notes: 'Focus on back engagement' }
    ]
  },
  '5': {
    id: '5',
    name: 'Leg Day',
    description: 'Full lower body workout for strength and endurance',
    duration: 40,
    difficulty: 'advanced',
    tags: ['legs', 'strength'],
    exercises: [
      { id: 'e1', name: 'Barbell Squats', sets: 4, reps: 8, restTime: 90, notes: 'Use challenging weight' },
      { id: 'e2', name: 'Romanian Deadlifts', sets: 4, reps: 10, restTime: 90 },
      { id: 'e3', name: 'Leg Press', sets: 3, reps: 12, restTime: 60 },
      { id: 'e4', name: 'Walking Lunges', sets: 3, reps: 10, restTime: 60, notes: '10 per leg' },
      { id: 'e5', name: 'Calf Raises', sets: 3, reps: 15, restTime: 45 }
    ]
  }
};

const WorkoutDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [startedWorkout, setStartedWorkout] = useState(false);

  // Get workout data from mock data
  const workout = id && typeof id === 'string' ? mockWorkouts[id] : null;

  if (!workout && id) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h1>Workout Not Found</h1>
        <p>The workout you are looking for does not exist.</p>
        <button
          style={{
            background: '#5224EF',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
          onClick={() => router.push('/training/workouts')}
        >
          Back to Workouts
        </button>
      </div>
    );
  }

  if (!workout) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>{workout.name} | Vici</title>
        <meta name="description" content={workout.description} />
      </Head>

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1rem' }}>
          <button
            style={{
              background: 'transparent',
              color: '#5224EF',
              padding: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.875rem'
            }}
            onClick={() => router.push('/training/workouts')}
          >
            ← Back to workouts
          </button>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{workout.name}</h1>
            <p style={{ color: '#718096', marginBottom: '1rem' }}>{workout.description}</p>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontWeight: 'bold' }}>Duration:</span>
                <span>{workout.duration} minutes</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontWeight: 'bold' }}>Difficulty:</span>
                <span style={{ 
                  background: workout.difficulty === 'beginner' ? '#C6F6D5' : 
                             workout.difficulty === 'intermediate' ? '#FEEBC8' : '#FED7D7',
                  color: workout.difficulty === 'beginner' ? '#276749' : 
                         workout.difficulty === 'intermediate' ? '#744210' : '#822727',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem'
                }}>
                  {workout.difficulty.charAt(0).toUpperCase() + workout.difficulty.slice(1)}
                </span>
              </div>
            </div>
            
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
          
          <div>
            <button
              style={{
                background: startedWorkout ? '#E53E3E' : '#5224EF',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              onClick={() => setStartedWorkout(!startedWorkout)}
            >
              {startedWorkout ? 'End Workout' : 'Start Workout'}
            </button>
          </div>
        </div>
        
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Exercises</h2>
          
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', overflow: 'hidden' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 100px 100px 100px',
              padding: '1rem',
              background: '#F7FAFC',
              fontWeight: 'bold',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div>Exercise</div>
              <div>Sets</div>
              <div>Reps</div>
              <div>Rest</div>
            </div>
            
            {workout.exercises.map((exercise, index) => (
              <div 
                key={exercise.id}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 100px 100px 100px',
                  padding: '1rem',
                  borderBottom: index < workout.exercises.length - 1 ? '1px solid #e2e8f0' : 'none',
                  background: startedWorkout && index === 0 ? '#EBF8FF' : 'white'
                }}
              >
                <div>
                  <div style={{ fontWeight: '500' }}>{exercise.name}</div>
                  {exercise.notes && (
                    <div style={{ fontSize: '0.875rem', color: '#718096', marginTop: '0.25rem' }}>
                      {exercise.notes}
                    </div>
                  )}
                </div>
                <div>{exercise.sets}</div>
                <div>{exercise.reps}</div>
                <div>{exercise.restTime}s</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkoutDetailPage; 