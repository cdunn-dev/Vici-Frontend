import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  dateOfBirth: string;
  gender: string;
  location: string;
  fitnessLevel: string;
  goals: string[];
}

const ProfileEditPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'Fitness enthusiast and software developer from San Francisco.',
    dateOfBirth: '1990-01-15',
    gender: 'Male',
    location: 'San Francisco, CA',
    fitnessLevel: 'intermediate',
    goals: ['Build Muscle', 'Improve Endurance']
  });
  const [goal, setGoal] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddGoal = () => {
    if (goal.trim() && !profile.goals.includes(goal.trim())) {
      setProfile(prev => ({
        ...prev,
        goals: [...prev.goals, goal.trim()]
      }));
      setGoal('');
    }
  };

  const handleRemoveGoal = (goalToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g !== goalToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!profile.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!profile.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        router.push('/profile');
      }, 1000);
    }
  };

  return (
    <div>
      <Head>
        <title>Edit Profile | Vici</title>
        <meta name="description" content="Edit your profile information" />
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
            onClick={() => router.push('/profile')}
          >
            ← Back to Profile
          </button>
        </div>

        <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Edit Profile</h1>

        <form onSubmit={handleSubmit}>
          <div style={{ 
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Basic Information</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
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
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Email*
                </label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.email ? '1px solid #E53E3E' : '1px solid #e2e8f0',
                    borderRadius: '0.25rem',
                    fontSize: '1rem'
                  }}
                />
                {errors.email && (
                  <p style={{ color: '#E53E3E', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.email}</p>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Bio
              </label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.25rem',
                  fontSize: '1rem',
                  minHeight: '100px'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={profile.dateOfBirth}
                  onChange={handleChange}
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Gender
                </label>
                <select
                  name="gender"
                  value={profile.gender}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.25rem',
                    fontSize: '1rem'
                  }}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="PreferNotToSay">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ 
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Fitness Information</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Location
              </label>
              <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.25rem',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Fitness Level
              </label>
              <select
                name="fitnessLevel"
                value={profile.fitnessLevel}
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
                <option value="expert">Expert</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Fitness Goals
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Add a fitness goal"
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
                      handleAddGoal();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddGoal}
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
                {profile.goals.map(g => (
                  <div
                    key={g}
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
                    {g}
                    <button
                      type="button"
                      onClick={() => handleRemoveGoal(g)}
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

          <div style={{ 
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Profile Picture</h2>
              <p style={{ color: '#718096', fontSize: '0.875rem' }}>
                Upload a profile picture to personalize your account
              </p>
            </div>
            
            <button
              type="button"
              style={{
                background: 'transparent',
                color: '#5224EF',
                padding: '0.5rem 1rem',
                border: '1px solid #5224EF',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              Change Picture
            </button>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => router.push('/profile')}
              style={{
                background: 'transparent',
                color: '#4A5568',
                padding: '0.75rem 1.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: '#5224EF',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ProfileEditPage; 