import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState } from 'react';

interface ExerciseInput {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restTime: number;
  notes: string;
}

interface WorkoutInput {
  name: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  exercises: ExerciseInput[];
}

const CreateWorkoutPage = () => {
  const router = useRouter();
  const [workout, setWorkout] = useState<WorkoutInput>({
    name: '',
    description: '',
    duration: 30,
    difficulty: 'intermediate',
    tags: [],
    exercises: []
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle workout details changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setWorkout(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle adding a tag
  const handleAddTag = () => {
    if (tagInput.trim() && !workout.tags.includes(tagInput.trim())) {
      setWorkout(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tag: string) => {
    setWorkout(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Handle adding an exercise
  const handleAddExercise = () => {
    const newExercise: ExerciseInput = {
      id: `e${Date.now()}`,
      name: '',
      sets: 3,
      reps: 10,
      restTime: 60,
      notes: ''
    };

    setWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));
  };

  // Handle removing an exercise
  const handleRemoveExercise = (id: string) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter(exercise => exercise.id !== id)
    }));
  };

  // Handle exercise input changes
  const handleExerciseChange = (id: string, field: keyof ExerciseInput, value: string | number) => {
    setWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(exercise => 
        exercise.id === id ? { ...exercise, [field]: value } : exercise
      )
    }));
  };

  // Validate the form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!workout.name.trim()) {
      newErrors.name = 'Workout name is required';
    }

    if (!workout.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (workout.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }

    if (workout.exercises.length === 0) {
      newErrors.exercises = 'At least one exercise is required';
    } else {
      workout.exercises.forEach((exercise, index) => {
        if (!exercise.name.trim()) {
          newErrors[`exercise_${index}_name`] = 'Exercise name is required';
        }
        if (exercise.sets <= 0) {
          newErrors[`exercise_${index}_sets`] = 'Sets must be greater than 0';
        }
        if (exercise.reps <= 0) {
          newErrors[`exercise_${index}_reps`] = 'Reps must be greater than 0';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Here you would normally send the data to an API
      console.log('Workout data:', workout);
      
      // Mock successful submission and redirect to the workouts page
      alert('Workout created successfully!');
      router.push('/training/workouts');
    }
  };

  return (
    <div>
      <Head>
        <title>Create Workout | Vici</title>
        <meta name="description" content="Create a new workout" />
      </Head>

      <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
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

        <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Create New Workout</h1>

        <form onSubmit={handleSubmit}>
          {/* Workout Details */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Workout Details</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Workout Name*
              </label>
              <input
                type="text"
                name="name"
                value={workout.name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.name ? '1px solid #E53E3E' : '1px solid #e2e8f0',
                  borderRadius: '0.25rem',
                  fontSize: '1rem'
                }}
              />
              {errors.name && (
                <p style={{ color: '#E53E3E', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.name}</p>
              )}
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Description*
              </label>
              <textarea
                name="description"
                value={workout.description}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: errors.description ? '1px solid #E53E3E' : '1px solid #e2e8f0',
                  borderRadius: '0.25rem',
                  fontSize: '1rem',
                  minHeight: '100px'
                }}
              />
              {errors.description && (
                <p style={{ color: '#E53E3E', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.description}</p>
              )}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Duration (minutes)*
                </label>
                <input
                  type="number"
                  name="duration"
                  value={workout.duration}
                  onChange={handleChange}
                  min="1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.duration ? '1px solid #E53E3E' : '1px solid #e2e8f0',
                    borderRadius: '0.25rem',
                    fontSize: '1rem'
                  }}
                />
                {errors.duration && (
                  <p style={{ color: '#E53E3E', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.duration}</p>
                )}
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Difficulty*
                </label>
                <select
                  name="difficulty"
                  value={workout.difficulty}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.25rem',
                    fontSize: '1rem'
                  }}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Tags
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.25rem',
                    fontSize: '1rem'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  style={{
                    padding: '0.75rem 1rem',
                    background: '#5224EF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {workout.tags.map(tag => (
                  <div
                    key={tag}
                    style={{
                      background: '#EBF4FF',
                      color: '#4A5568',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '1rem',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#718096',
                        cursor: 'pointer',
                        padding: '0',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Exercises */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Exercises</h2>
              <button
                type="button"
                onClick={handleAddExercise}
                style={{
                  background: 'transparent',
                  color: '#5224EF',
                  padding: '0.5rem 1rem',
                  border: '1px solid #5224EF',
                  borderRadius: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                Add Exercise
              </button>
            </div>
            
            {errors.exercises && (
              <p style={{ color: '#E53E3E', fontSize: '0.875rem', marginBottom: '1rem' }}>{errors.exercises}</p>
            )}
            
            {workout.exercises.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem', 
                border: '1px dashed #e2e8f0', 
                borderRadius: '0.5rem',
                color: '#718096'
              }}>
                No exercises added yet. Click "Add Exercise" to get started.
              </div>
            ) : (
              workout.exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>Exercise {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(exercise.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#E53E3E',
                        cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Exercise Name*
                    </label>
                    <input
                      type="text"
                      value={exercise.name}
                      onChange={(e) => handleExerciseChange(exercise.id, 'name', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: errors[`exercise_${index}_name`] ? '1px solid #E53E3E' : '1px solid #e2e8f0',
                        borderRadius: '0.25rem',
                        fontSize: '1rem'
                      }}
                    />
                    {errors[`exercise_${index}_name`] && (
                      <p style={{ color: '#E53E3E', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {errors[`exercise_${index}_name`]}
                      </p>
                    )}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Sets*
                      </label>
                      <input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => handleExerciseChange(exercise.id, 'sets', parseInt(e.target.value))}
                        min="1"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: errors[`exercise_${index}_sets`] ? '1px solid #E53E3E' : '1px solid #e2e8f0',
                          borderRadius: '0.25rem',
                          fontSize: '1rem'
                        }}
                      />
                      {errors[`exercise_${index}_sets`] && (
                        <p style={{ color: '#E53E3E', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                          {errors[`exercise_${index}_sets`]}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Reps*
                      </label>
                      <input
                        type="number"
                        value={exercise.reps}
                        onChange={(e) => handleExerciseChange(exercise.id, 'reps', parseInt(e.target.value))}
                        min="1"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: errors[`exercise_${index}_reps`] ? '1px solid #E53E3E' : '1px solid #e2e8f0',
                          borderRadius: '0.25rem',
                          fontSize: '1rem'
                        }}
                      />
                      {errors[`exercise_${index}_reps`] && (
                        <p style={{ color: '#E53E3E', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                          {errors[`exercise_${index}_reps`]}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Rest Time (seconds)
                      </label>
                      <input
                        type="number"
                        value={exercise.restTime}
                        onChange={(e) => handleExerciseChange(exercise.id, 'restTime', parseInt(e.target.value))}
                        min="0"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '0.25rem',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Notes
                    </label>
                    <textarea
                      value={exercise.notes}
                      onChange={(e) => handleExerciseChange(exercise.id, 'notes', e.target.value)}
                      placeholder="Optional instructions or notes"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.25rem',
                        fontSize: '1rem',
                        minHeight: '80px'
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              style={{
                background: '#5224EF',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              Create Workout
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateWorkoutPage; 