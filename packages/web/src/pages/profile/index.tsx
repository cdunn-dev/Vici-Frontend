import { useRouter } from 'next/router';
import Head from 'next/head';

const ProfilePage = () => {
  const router = useRouter();
  
  // Mock user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'Fitness enthusiast and software developer from San Francisco.',
    dateOfBirth: '1990-01-15',
    gender: 'Male',
    location: 'San Francisco, CA',
    fitnessLevel: 'Intermediate',
    goals: ['Build Muscle', 'Improve Endurance'],
    joinDate: '2023-02-15',
    workoutsCompleted: 87,
    streak: 12
  };

  return (
    <div>
      <Head>
        <title>My Profile | Vici</title>
        <meta name="description" content="View and manage your profile" />
      </Head>

      <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem' }}>My Profile</h1>
          
          <button
            onClick={() => router.push('/profile/edit')}
            style={{
              background: '#5224EF',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Edit Profile
          </button>
        </div>

        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
          {/* Profile Card */}
          <div style={{ 
            width: '250px',
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            overflow: 'hidden',
            flexShrink: 0
          }}>
            <div style={{ 
              width: '100%', 
              height: '250px', 
              background: '#E2E8F0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#4A5568',
              fontSize: '3rem',
              fontWeight: 'bold'
            }}>
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{user.name}</h2>
              <p style={{ color: '#718096', fontSize: '0.875rem', marginBottom: '1rem' }}>{user.location}</p>
              
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold' }}>{user.workoutsCompleted}</div>
                  <div style={{ fontSize: '0.75rem', color: '#718096' }}>Workouts</div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold' }}>{user.streak}</div>
                  <div style={{ fontSize: '0.75rem', color: '#718096' }}>Day Streak</div>
                </div>
              </div>
              
              <p style={{ fontSize: '0.875rem', color: '#718096' }}>
                Member since {new Date(user.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          
          {/* Profile Details */}
          <div style={{ flex: 1 }}>
            <div style={{ 
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>About Me</h2>
              <p style={{ marginBottom: '1.5rem' }}>{user.bio}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#718096', marginBottom: '0.25rem' }}>Email</h3>
                  <p>{user.email}</p>
                </div>
                
                <div>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#718096', marginBottom: '0.25rem' }}>Date of Birth</h3>
                  <p>{new Date(user.dateOfBirth).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#718096', marginBottom: '0.25rem' }}>Gender</h3>
                  <p>{user.gender}</p>
                </div>
                
                <div>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#718096', marginBottom: '0.25rem' }}>Fitness Level</h3>
                  <p>{user.fitnessLevel}</p>
                </div>
              </div>
            </div>
            
            <div style={{ 
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              padding: '1.5rem'
            }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Fitness Goals</h2>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {user.goals.map(goal => (
                  <div
                    key={goal}
                    style={{
                      background: '#EBF4FF',
                      color: '#4A5568',
                      padding: '0.5rem 1rem',
                      borderRadius: '2rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    {goal}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ 
          border: '1px solid #e2e8f0',
          borderRadius: '0.5rem',
          padding: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recent Activity</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ 
              padding: '1rem',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.25rem' }}>Completed Full Body Strength workout</h3>
                <p style={{ fontSize: '0.875rem', color: '#718096' }}>2 days ago</p>
              </div>
              
              <button
                onClick={() => router.push('/training/workouts/1')}
                style={{
                  background: 'transparent',
                  color: '#5224EF',
                  padding: '0.5rem 1rem',
                  border: '1px solid #5224EF',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                View Workout
              </button>
            </div>
            
            <div style={{ 
              padding: '1rem',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.25rem' }}>Completed HIIT Cardio workout</h3>
                <p style={{ fontSize: '0.875rem', color: '#718096' }}>4 days ago</p>
              </div>
              
              <button
                onClick={() => router.push('/training/workouts/2')}
                style={{
                  background: 'transparent',
                  color: '#5224EF',
                  padding: '0.5rem 1rem',
                  border: '1px solid #5224EF',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                View Workout
              </button>
            </div>
            
            <div style={{ 
              padding: '1rem',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.25rem' }}>Created a new training plan</h3>
                <p style={{ fontSize: '0.875rem', color: '#718096' }}>1 week ago</p>
              </div>
              
              <button
                onClick={() => router.push('/training/plans')}
                style={{
                  background: 'transparent',
                  color: '#5224EF',
                  padding: '0.5rem 1rem',
                  border: '1px solid #5224EF',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                View Plans
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage; 