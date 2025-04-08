import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState } from 'react';

type SettingsTab = 'profile' | 'account' | 'notifications' | 'appearance' | 'privacy';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [settings, setSettings] = useState({
    profile: {
      name: 'John Doe',
      bio: 'Fitness enthusiast and software developer',
      location: 'San Francisco, CA',
      website: 'https://johndoe.com'
    },
    account: {
      email: 'john.doe@example.com',
      language: 'english',
      timezone: 'America/Los_Angeles'
    },
    notifications: {
      email: true,
      push: true,
      workout: true,
      achievements: true,
      friendActivity: false,
      marketingEmails: false
    },
    appearance: {
      theme: 'light',
      density: 'comfortable',
      animations: true
    },
    privacy: {
      profileVisibility: 'public',
      activityVisibility: 'friends',
      showWorkoutDetails: true,
      allowDataCollection: true
    }
  });

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
  };

  const handleInputChange = (
    section: keyof typeof settings,
    field: string,
    value: string | boolean
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    // Here you would send the data to an API
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  return (
    <div>
      <Head>
        <title>Settings | Vici</title>
        <meta name="description" content="Manage your account settings" />
      </Head>

      <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>Settings</h1>
        
        <div style={{ display: 'flex', gap: '2rem' }}>
          {/* Sidebar */}
          <div style={{ width: '250px', flexShrink: 0 }}>
            <div style={{ 
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              overflow: 'hidden'
            }}>
              <button
                style={{
                  width: '100%',
                  padding: '1rem',
                  textAlign: 'left',
                  background: activeTab === 'profile' ? '#EBF4FF' : 'white',
                  color: activeTab === 'profile' ? '#5224EF' : '#4A5568',
                  fontWeight: activeTab === 'profile' ? 'bold' : 'normal',
                  border: 'none',
                  borderBottom: '1px solid #e2e8f0',
                  cursor: 'pointer'
                }}
                onClick={() => handleTabChange('profile')}
              >
                Profile
              </button>
              
              <button
                style={{
                  width: '100%',
                  padding: '1rem',
                  textAlign: 'left',
                  background: activeTab === 'account' ? '#EBF4FF' : 'white',
                  color: activeTab === 'account' ? '#5224EF' : '#4A5568',
                  fontWeight: activeTab === 'account' ? 'bold' : 'normal',
                  border: 'none',
                  borderBottom: '1px solid #e2e8f0',
                  cursor: 'pointer'
                }}
                onClick={() => handleTabChange('account')}
              >
                Account
              </button>
              
              <button
                style={{
                  width: '100%',
                  padding: '1rem',
                  textAlign: 'left',
                  background: activeTab === 'notifications' ? '#EBF4FF' : 'white',
                  color: activeTab === 'notifications' ? '#5224EF' : '#4A5568',
                  fontWeight: activeTab === 'notifications' ? 'bold' : 'normal',
                  border: 'none',
                  borderBottom: '1px solid #e2e8f0',
                  cursor: 'pointer'
                }}
                onClick={() => handleTabChange('notifications')}
              >
                Notifications
              </button>
              
              <button
                style={{
                  width: '100%',
                  padding: '1rem',
                  textAlign: 'left',
                  background: activeTab === 'appearance' ? '#EBF4FF' : 'white',
                  color: activeTab === 'appearance' ? '#5224EF' : '#4A5568',
                  fontWeight: activeTab === 'appearance' ? 'bold' : 'normal',
                  border: 'none',
                  borderBottom: '1px solid #e2e8f0',
                  cursor: 'pointer'
                }}
                onClick={() => handleTabChange('appearance')}
              >
                Appearance
              </button>
              
              <button
                style={{
                  width: '100%',
                  padding: '1rem',
                  textAlign: 'left',
                  background: activeTab === 'privacy' ? '#EBF4FF' : 'white',
                  color: activeTab === 'privacy' ? '#5224EF' : '#4A5568',
                  fontWeight: activeTab === 'privacy' ? 'bold' : 'normal',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onClick={() => handleTabChange('privacy')}
              >
                Privacy
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div style={{ flex: 1 }}>
            <div style={{ 
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              marginBottom: '1rem'
            }}>
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <div>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Profile Settings</h2>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Name
                    </label>
                    <input
                      type="text"
                      value={settings.profile.name}
                      onChange={(e) => handleInputChange('profile', 'name', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.25rem',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Bio
                    </label>
                    <textarea
                      value={settings.profile.bio}
                      onChange={(e) => handleInputChange('profile', 'bio', e.target.value)}
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
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Location
                    </label>
                    <input
                      type="text"
                      value={settings.profile.location}
                      onChange={(e) => handleInputChange('profile', 'location', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.25rem',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Website
                    </label>
                    <input
                      type="text"
                      value={settings.profile.website}
                      onChange={(e) => handleInputChange('profile', 'website', e.target.value)}
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
              )}
              
              {/* Account Settings */}
              {activeTab === 'account' && (
                <div>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Account Settings</h2>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={settings.account.email}
                      onChange={(e) => handleInputChange('account', 'email', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.25rem',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Language
                    </label>
                    <select
                      value={settings.account.language}
                      onChange={(e) => handleInputChange('account', 'language', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.25rem',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="english">English</option>
                      <option value="spanish">Spanish</option>
                      <option value="french">French</option>
                      <option value="german">German</option>
                      <option value="chinese">Chinese</option>
                      <option value="japanese">Japanese</option>
                    </select>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Timezone
                    </label>
                    <select
                      value={settings.account.timezone}
                      onChange={(e) => handleInputChange('account', 'timezone', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.25rem',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                      <option value="America/Denver">Mountain Time (US & Canada)</option>
                      <option value="America/Chicago">Central Time (US & Canada)</option>
                      <option value="America/New_York">Eastern Time (US & Canada)</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>
                  
                  <div style={{ marginTop: '2rem' }}>
                    <button
                      style={{
                        background: '#E53E3E',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer'
                      }}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
              
              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Notification Settings</h2>
                  
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={settings.notifications.email}
                        onChange={(e) => handleInputChange('notifications', 'email', e.target.checked)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      Email Notifications
                    </label>
                  </div>
                  
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={settings.notifications.push}
                        onChange={(e) => handleInputChange('notifications', 'push', e.target.checked)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      Push Notifications
                    </label>
                  </div>
                  
                  <h3 style={{ fontSize: '1rem', marginTop: '1.5rem', marginBottom: '0.75rem', fontWeight: '500' }}>
                    Notification Types
                  </h3>
                  
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={settings.notifications.workout}
                        onChange={(e) => handleInputChange('notifications', 'workout', e.target.checked)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      Workout Reminders
                    </label>
                  </div>
                  
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={settings.notifications.achievements}
                        onChange={(e) => handleInputChange('notifications', 'achievements', e.target.checked)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      Achievements & Progress
                    </label>
                  </div>
                  
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={settings.notifications.friendActivity}
                        onChange={(e) => handleInputChange('notifications', 'friendActivity', e.target.checked)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      Friend Activity
                    </label>
                  </div>
                  
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={settings.notifications.marketingEmails}
                        onChange={(e) => handleInputChange('notifications', 'marketingEmails', e.target.checked)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      Marketing Emails
                    </label>
                  </div>
                </div>
              )}
              
              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Appearance Settings</h2>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Theme
                    </label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="radio"
                          name="theme"
                          value="light"
                          checked={settings.appearance.theme === 'light'}
                          onChange={() => handleInputChange('appearance', 'theme', 'light')}
                          style={{ marginRight: '0.5rem' }}
                        />
                        Light
                      </label>
                      
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="radio"
                          name="theme"
                          value="dark"
                          checked={settings.appearance.theme === 'dark'}
                          onChange={() => handleInputChange('appearance', 'theme', 'dark')}
                          style={{ marginRight: '0.5rem' }}
                        />
                        Dark
                      </label>
                      
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="radio"
                          name="theme"
                          value="system"
                          checked={settings.appearance.theme === 'system'}
                          onChange={() => handleInputChange('appearance', 'theme', 'system')}
                          style={{ marginRight: '0.5rem' }}
                        />
                        System Default
                      </label>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Density
                    </label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="radio"
                          name="density"
                          value="comfortable"
                          checked={settings.appearance.density === 'comfortable'}
                          onChange={() => handleInputChange('appearance', 'density', 'comfortable')}
                          style={{ marginRight: '0.5rem' }}
                        />
                        Comfortable
                      </label>
                      
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="radio"
                          name="density"
                          value="compact"
                          checked={settings.appearance.density === 'compact'}
                          onChange={() => handleInputChange('appearance', 'density', 'compact')}
                          style={{ marginRight: '0.5rem' }}
                        />
                        Compact
                      </label>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={settings.appearance.animations}
                        onChange={(e) => handleInputChange('appearance', 'animations', e.target.checked)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      Enable Animations
                    </label>
                  </div>
                </div>
              )}
              
              {/* Privacy Settings */}
              {activeTab === 'privacy' && (
                <div>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Privacy Settings</h2>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Profile Visibility
                    </label>
                    <select
                      value={settings.privacy.profileVisibility}
                      onChange={(e) => handleInputChange('privacy', 'profileVisibility', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.25rem',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="public">Public - Anyone can view your profile</option>
                      <option value="friends">Friends Only - Only people you connect with</option>
                      <option value="private">Private - Only you can view your profile</option>
                    </select>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Activity Visibility
                    </label>
                    <select
                      value={settings.privacy.activityVisibility}
                      onChange={(e) => handleInputChange('privacy', 'activityVisibility', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.25rem',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="public">Public - Anyone can see your activities</option>
                      <option value="friends">Friends Only - Only people you connect with</option>
                      <option value="private">Private - Only you can see your activities</option>
                    </select>
                  </div>
                  
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={settings.privacy.showWorkoutDetails}
                        onChange={(e) => handleInputChange('privacy', 'showWorkoutDetails', e.target.checked)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      Show Workout Details to Others
                    </label>
                  </div>
                  
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={settings.privacy.allowDataCollection}
                        onChange={(e) => handleInputChange('privacy', 'allowDataCollection', e.target.checked)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      Allow Anonymous Data Collection for App Improvement
                    </label>
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleSave}
                style={{
                  background: '#5224EF',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage; 