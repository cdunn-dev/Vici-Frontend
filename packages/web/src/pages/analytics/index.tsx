import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState } from 'react';

// Mock data for analytics
const mockWorkoutData = [
  { month: 'Jan', workouts: 12 },
  { month: 'Feb', workouts: 15 },
  { month: 'Mar', workouts: 22 },
  { month: 'Apr', workouts: 18 },
  { month: 'May', workouts: 24 },
  { month: 'Jun', workouts: 28 },
  { month: 'Jul', workouts: 26 },
  { month: 'Aug', workouts: 30 },
  { month: 'Sep', workouts: 32 },
  { month: 'Oct', workouts: 35 },
  { month: 'Nov', workouts: 29 },
  { month: 'Dec', workouts: 25 }
];

const mockCategoryData = [
  { category: 'Strength', workouts: 42 },
  { category: 'Cardio', workouts: 28 },
  { category: 'Flexibility', workouts: 15 },
  { category: 'HIIT', workouts: 22 },
  { category: 'Recovery', workouts: 8 }
];

// Mock stats
const mockStats = {
  totalWorkouts: 115,
  totalTime: 5250, // minutes
  avgWorkoutDuration: 45.6, // minutes
  streakDays: 12,
  favoriteCategory: 'Strength',
  mostFrequentExercise: 'Squats'
};

interface TimeRange {
  label: string;
  value: string;
}

const AnalyticsPage = () => {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<string>('year');
  
  const timeRanges: TimeRange[] = [
    { label: 'Last Week', value: 'week' },
    { label: 'Last Month', value: 'month' },
    { label: 'Last 3 Months', value: 'quarter' },
    { label: 'Last 6 Months', value: 'half_year' },
    { label: 'Last Year', value: 'year' },
    { label: 'All Time', value: 'all' }
  ];

  // Helper function to format minutes as hours and minutes
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Calculate max value for workout chart
  const maxWorkouts = Math.max(...mockWorkoutData.map(item => item.workouts));

  return (
    <div>
      <Head>
        <title>Analytics | Vici</title>
        <meta name="description" content="Track your training progress and performance" />
      </Head>

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem' }}>Analytics Dashboard</h1>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #e2e8f0',
              borderRadius: '0.25rem',
              fontSize: '0.875rem'
            }}
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ color: '#718096', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Workouts</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{mockStats.totalWorkouts}</div>
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ color: '#718096', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Time</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{formatTime(mockStats.totalTime)}</div>
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ color: '#718096', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Avg. Workout</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{mockStats.avgWorkoutDuration} min</div>
          </div>
          
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ color: '#718096', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Current Streak</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{mockStats.streakDays} days</div>
          </div>
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          {/* Workout Frequency Chart */}
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Workout Frequency</h2>
            
            <div style={{ height: '250px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              {mockWorkoutData.map(item => (
                <div key={item.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ 
                    height: `${(item.workouts / maxWorkouts) * 200}px`,
                    width: '100%',
                    background: '#5224EF',
                    borderRadius: '4px 4px 0 0',
                    position: 'relative'
                  }}>
                    <div style={{ 
                      position: 'absolute',
                      top: '-24px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {item.workouts}
                    </div>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#718096' }}>{item.month}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Workout Categories */}
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Workout Categories</h2>
            
            <div>
              {mockCategoryData.map(item => (
                <div key={item.category} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>{item.category}</span>
                    <span>{item.workouts} workouts</span>
                  </div>
                  <div style={{ 
                    height: '8px', 
                    width: '100%', 
                    background: '#E2E8F0',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${(item.workouts / mockCategoryData.reduce((sum, cat) => sum + cat.workouts, 0)) * 100}%`,
                      background: '#5224EF',
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Performance Insights</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '1rem' }}>Strengths</h3>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '500' }}>Consistency:</span> You've maintained a {mockStats.streakDays}-day workout streak!
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '500' }}>Favorite category:</span> You excel at {mockStats.favoriteCategory} training
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '500' }}>Most frequent:</span> {mockStats.mostFrequentExercise} appear in most of your workouts
                </li>
              </ul>
            </div>
            
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '1rem' }}>Improvement Areas</h3>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '500' }}>Recovery:</span> Only 8 recovery workouts in your history
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '500' }}>Flexibility:</span> Consider adding more flexibility workouts
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '500' }}>Workout variety:</span> Try adding more exercise variations
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button
            style={{
              background: 'transparent',
              color: '#5224EF',
              padding: '0.75rem 1.5rem',
              border: '1px solid #5224EF',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
            onClick={() => router.push('/training/workouts')}
          >
            View All Workouts
          </button>
          
          <button
            style={{
              background: '#5224EF',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
            onClick={() => router.push('/training/plans')}
          >
            Update Training Plan
          </button>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage; 