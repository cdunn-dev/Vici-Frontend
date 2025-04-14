// User Service: Handles business logic related to users, profiles, etc.
import { PrismaClient, User, Gender } from '@prisma/client';

const prisma = new PrismaClient();

// Interface for the expected structure of Strava athlete data
interface StravaAthleteData {
    id: number;
    firstname?: string;
    lastname?: string;
    profile?: string; // URL to medium profile picture
    profile_medium?: string; // Alias for profile
    sex?: 'M' | 'F' | null; // Strava uses M/F
    city?: string;
    state?: string;
    country?: string;
    date_preference?: string; // e.g., "%m/%d/%Y"
    measurement_preference?: 'feet' | 'meters';
    weight?: number; // Kilograms
    // Add other relevant fields if needed (e.g., clubs, bikes, shoes)
}

export class UserService {

    constructor() {}

    /**
     * Updates the Vici User profile based on data fetched from Strava.
     * Focuses on basic profile info like name and picture for MVP.
     * RunnerProfile updates (PBs, fitness level) would likely happen via AI analysis later.
     * @param {string} userId The Vici user ID.
     * @param {StravaAthleteData} stravaData The athlete data object from Strava API.
     * @returns {Promise<User | null>} The updated User object or null on error.
     */
    async updateProfileFromStrava(userId: string, stravaData: StravaAthleteData): Promise<User | null> {
        if (!userId || !stravaData) {
            console.warn('Missing userId or Strava data for profile update.');
            return null;
        }

        // Prepare data for update
        const updateData: { name?: string, profilePictureUrl?: string, gender?: Gender } = {};

        const firstName = stravaData.firstname;
        const lastName = stravaData.lastname;
        if (firstName || lastName) {
            updateData.name = `${firstName || ''} ${lastName || ''}`.trim();
        }

        // Prefer medium profile picture if available
        updateData.profilePictureUrl = stravaData.profile_medium || stravaData.profile || undefined;

        // Map Strava sex to Vici Gender enum
        if (stravaData.sex === 'M') {
            updateData.gender = Gender.Male;
        } else if (stravaData.sex === 'F') {
            updateData.gender = Gender.Female;
        }
        // Note: Strava might return null or not include sex. We don't map 'Other' directly.
        // We are NOT updating DOB from Strava, as it's not typically available.
        // Measurement preference could potentially update UserSettings.distanceUnit, but let user control that.

        // Only proceed if there's actually data to update
        if (Object.keys(updateData).length === 0) {
            console.log(`No new profile data found in Strava athlete object for user ${userId}.`);
            return null;
        }

        console.log(`Updating Vici profile for user ${userId} from Strava data:`, updateData);

        try {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: updateData,
            });
            console.log(`Successfully updated profile for user ${userId} from Strava.`);
            return updatedUser;
        } catch (error) {
            console.error(`Error updating Vici profile for user ${userId} from Strava:`, error);
            return null;
        }
    }

    // Other user-related methods might go here (e.g., findUserById, updateUser)
} 