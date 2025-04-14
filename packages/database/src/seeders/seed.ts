import { PrismaClient, WorkoutStatus, UserSettings, TrainingPlan, Workout, PlanWeek } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

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
      email: 'alice@example.com',
      passwordHash: password,
      name: 'Alice Wonderland',
      emailVerified: true,
      dateOfBirth: new Date('1990-05-15T00:00:00Z'),
      gender: 'Female',
      settings: {
        create: {
          distanceUnit: 'km',
          language: 'en',
          coachingStyle: 'Balanced',
          privacyDataSharing: true,
          updatedAt: new Date(),
          notificationPreferences: {
            create: {
              email: true,
              push: true,
              sms: false,
              inApp: true,
            },
          },
        },
      },
      runnerProfile: {
        create: {
          fitnessLevel: 'Intermediate',
        }
      }
    }
  });
  
  console.log(`Created user: ${user1.email}`);
  
  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      passwordHash: password,
      name: 'Bob The Builder',
      emailVerified: true,
      settings: {
        create: {
          distanceUnit: 'miles',
          language: 'en',
          coachingStyle: 'Motivational',
          privacyDataSharing: false,
          updatedAt: new Date(),
          notificationPreferences: {
            create: {
              email: true,
              push: true,
              sms: true,
              inApp: true,
            },
          },
        },
      },
      runnerProfile: {
        create: {
          fitnessLevel: 'Beginner',
        }
      }
    }
  });
  
  console.log(`Created user: ${user2.email}`);
  
  // --- Seed Training Plans --- 
  // Create Goal and Preferences first
  const goal1Data = { 
      type: 'Race',
      distanceMeters: 10000,
      raceDate: new Date('2024-09-15T00:00:00Z'),
      goalTimeSeconds: 3000 
  };
  const prefs1Data = {
      targetWeeklyDistanceMeters: 30000,
      runningDaysPerWeek: 4,
      qualityWorkoutsPerWeek: 1,
      preferredLongRunDay: 'Sunday',
      coachingStyle: 'Balanced'
  };

  // Create the TrainingPlan, linking the related records
  const plan1 = await prisma.trainingPlan.create({
    data: {
      userId: user1.id,
      status: 'Active',
      Goal: { create: goal1Data }, // Use nested create for Goal
      PlanPreferences: { create: prefs1Data } // Use nested create for PlanPreferences
      // We will create PlanWeeks and Workouts separately below
    },
    include: { Goal: true, PlanPreferences: true } // Include to verify
  });

  console.log(`Created training plan ${plan1.id} for ${user1.email}`);

  // --- Seed Workouts (Example for plan1) --- 
  if (plan1.id) {
    // Create PlanWeek first
    const week1 = await prisma.planWeek.create({ 
        data: {
            trainingPlanId: plan1.id, // Link to the created plan
            weekNumber: 1,
            startDate: new Date('2024-07-01T00:00:00Z'),
            endDate: new Date('2024-07-07T23:59:59Z'),
            totalDistanceMeters: 20000 
        }
    });
    console.log(`Created week ${week1.weekNumber} for plan ${plan1.id}`);

    // Create Workouts linked to the PlanWeek
    await prisma.workout.createMany({
      data: [
        {
          planWeekId: week1.id, // Link to the created week
          userId: user1.id,
          workoutType: 'EasyRun',
          description: '3 miles easy',
          scheduledDate: new Date('2024-07-02T12:00:00Z'),
          distanceMeters: 4828,
          status: WorkoutStatus.Upcoming, 
        },
        {
          planWeekId: week1.id, // Link to the created week
          userId: user1.id,
          workoutType: 'Intervals',
          description: '6x400m @ target pace',
          scheduledDate: new Date('2024-07-04T12:00:00Z'),
          distanceMeters: 5000, 
          status: WorkoutStatus.Upcoming, 
        },
         {
          planWeekId: week1.id, // Link to the created week
          userId: user1.id,
          workoutType: 'LongRun',
          description: '6 miles long run',
          scheduledDate: new Date('2024-07-07T12:00:00Z'),
          distanceMeters: 9656,
          status: WorkoutStatus.Completed, 
          completedDate: new Date('2024-07-07T14:00:00Z'),
          actualDistance: 9700,
          actualDuration: 3600 
        },
      ],
    });
    console.log(`Created workouts for week ${week1.weekNumber}`);
  }

  console.log(`Seeding finished.`);
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