import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Seed database with initial data
 */
async function main() {
  console.log('Starting database seed...');
  
  // Clear existing data
  await prisma.workout.deleteMany({});
  await prisma.trainingPlan.deleteMany({});
  await prisma.notificationPreferences.deleteMany({});
  await prisma.userSettings.deleteMany({});
  await prisma.user.deleteMany({});
  
  console.log('Cleared existing data');
  
  // Create users
  const password = await bcrypt.hash('Password123!', 10);
  
  const user1 = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password,
      name: 'Sample User',
      profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
      settings: {
        create: {
          distanceUnit: 'km',
          language: 'en',
          coachingStyle: 'Balanced',
          privacyDataSharing: true,
          notificationPreferences: {
            create: {
              email: true,
              push: true,
              sms: false,
              inApp: true
            }
          }
        }
      }
    }
  });
  
  console.log(`Created user: ${user1.email}`);
  
  const user2 = await prisma.user.create({
    data: {
      email: 'coach@example.com',
      password,
      name: 'Coach User',
      profilePicture: 'https://randomuser.me/api/portraits/women/1.jpg',
      settings: {
        create: {
          distanceUnit: 'miles',
          language: 'en',
          coachingStyle: 'Motivational',
          privacyDataSharing: false,
          notificationPreferences: {
            create: {
              email: true,
              push: true,
              sms: true,
              inApp: true
            }
          }
        }
      }
    }
  });
  
  console.log(`Created user: ${user2.email}`);
  
  // Create training plans
  const plan1 = await prisma.trainingPlan.create({
    data: {
      userId: user1.id,
      status: 'Active',
      goal: {
        type: 'Race',
        distance: 21097, // Half marathon in meters
        date: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000), // 12 weeks from now
        name: 'City Half Marathon',
        description: 'My first half marathon'
      },
      settings: {
        daysPerWeek: 4,
        startDate: new Date(),
        endDate: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000),
        preferredRunDays: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
        includeIntervals: true,
        includeLongRuns: true,
        includeRecoveryRuns: true,
        intensity: 'Medium'
      }
    }
  });
  
  console.log(`Created training plan: ${plan1.id}`);
  
  // Create workouts
  // Create a sample workout for today
  const today = new Date();
  
  const workout1 = await prisma.workout.create({
    data: {
      trainingPlanId: plan1.id,
      userId: user1.id,
      type: 'EASY_RUN',
      title: 'Easy Recovery Run',
      description: 'Take it easy and focus on recovery',
      scheduledDate: today,
      duration: 1800, // 30 minutes in seconds
      distance: 5000, // 5km in meters
      steps: [
        {
          type: 'warmup',
          duration: 300, // 5 minutes
          description: 'Easy jogging to warm up'
        },
        {
          type: 'main',
          duration: 1200, // 20 minutes
          description: 'Easy pace running'
        },
        {
          type: 'cooldown',
          duration: 300, // 5 minutes
          description: 'Easy jogging and walking to cool down'
        }
      ],
      status: 'scheduled'
    }
  });
  
  console.log(`Created workout: ${workout1.id}`);
  
  // Create a completed workout from yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const workout2 = await prisma.workout.create({
    data: {
      trainingPlanId: plan1.id,
      userId: user1.id,
      type: 'INTERVAL',
      title: 'Speed Intervals',
      description: '400m repeats with recovery',
      scheduledDate: yesterday,
      duration: 2400, // 40 minutes in seconds
      distance: 6000, // 6km in meters
      steps: [
        {
          type: 'warmup',
          duration: 600, // 10 minutes
          description: 'Easy jogging to warm up'
        },
        {
          type: 'interval',
          duration: 90, // 1:30 minutes
          distance: 400,
          targetPace: [210, 240], // 3:30-4:00 min/km pace
          description: '400m hard effort'
        },
        {
          type: 'recovery',
          duration: 90, // 1:30 minutes
          description: 'Recovery jog'
        },
        // Repeat interval + recovery 6 times
        {
          type: 'cooldown',
          duration: 600, // 10 minutes
          description: 'Easy jogging and walking to cool down'
        }
      ],
      completedDate: yesterday,
      actualDuration: 2450, // Actually took a bit longer
      actualDistance: 6200, // Actually ran a bit farther
      status: 'completed'
    }
  });
  
  console.log(`Created workout: ${workout2.id}`);
  
  console.log('Database seed completed successfully');
}

// Execute the seed
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 