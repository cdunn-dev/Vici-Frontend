// Strava Webhook Controller: Handles incoming webhook requests from Strava\nimport { Request, Response, NextFunction } from \'express\';\nimport { StravaService } from \'../services/strava.service\'; // Adjust path if needed\n\n// TODO: Add secure comparison function for verify token\n\nconst stravaService = new StravaService();\n\n// This should match the token you provide when creating the subscription in Strava settings\nconst STRAVA_VERIFY_TOKEN = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN || \'default-verify-token\';\n\n/**\n * Handles the Strava webhook subscription verification request (GET).\n * Responds with the hub.challenge value if the verify token matches.\n */\nexport const verifySubscription = (req: Request, res: Response, next: NextFunction) => {\n    console.log(\'Received Strava webhook verification request:\', req.query);\n    const mode = req.query[\'hub.mode\'];\n    const token = req.query[\'hub.verify_token\'];\n    const challenge = req.query[\'hub.challenge\'];\n\n    // Verifies that the hub.verify_token sent by Strava matches our verify token\n    if (mode === \'subscribe\' && token === STRAVA_VERIFY_TOKEN) {\n        // Responds with the challenge token from the request\n        console.log(\'Strava webhook verification successful!\');\n        res.status(200).json({ \"hub.challenge\": challenge });\n    } else {\n        // Responds with 403 Forbidden if verify tokens do not match\n        console.warn(\'Strava webhook verification failed: Invalid mode or token.\');\n        res.sendStatus(403);\n    }\n};\n\n/**\n * Handles incoming Strava event notifications (POST).\n * Processes activity updates/creations/deletions and deauthorizations.\n */\nexport const handleEvent = async (req: Request, res: Response, next: NextFunction) => {\n    console.log(\'Received Strava webhook event:\', JSON.stringify(req.body, null, 2));\n    \n    const event = req.body;\n\n    // Acknowledge receipt immediately\n    res.status(200).send(\'EVENT_RECEIVED\');\n\n    // --- Process Event Asynchronously --- \n    // Use Promise.resolve().then() for cleaner async background processing\n    Promise.resolve().then(async () => {\n        try {\n            if (event.object_type === \'athlete\') {\n                if (event.aspect_type === \'update\' && event.updates?.authorized === false) {\n                    console.log(`Processing Strava deauthorization for athlete ID: ${event.owner_id}`);\n                    await stravaService.handleDeauthorization(event.owner_id);\n                }\n            } else if (event.object_type === \'activity\') {\n                const stravaUserId = event.owner_id;\n                const stravaActivityId = event.object_id;\n                const eventType = event.aspect_type;\n\n                const viciUserId = await stravaService.findViciUserIdByStravaId(stravaUserId);\n
                if (!viciUserId) {\n                    console.warn(`Webhook event ignored: Could not find Vici user for Strava athlete ID: ${stravaUserId}`);\n                    return;\n                }\n\n                console.log(`Processing Strava activity event for Vici User ${viciUserId}: Strava Activity ${stravaActivityId}, Type: ${eventType}`);\n
                if (eventType === \'create\' || eventType === \'update\') {\n                     await stravaService.fetchAndStoreSingleActivity(viciUserId, stravaActivityId);\n                } else if (eventType === \'delete\') {\n                     await stravaService.deleteActivity(viciUserId, stravaActivityId);\n                }\n            } else {\n                console.warn(\'Received unknown Strava webhook event type:\', event.object_type);\n            }\n        } catch (error) {\n            console.error(\'Error processing Strava webhook event asynchronously:\', error);\n        }\n    }).catch(error => {\n        // Catch errors from the Promise chain itself \n        console.error(\'Error in webhook async processing chain:\', error);\n    });\n};\n 