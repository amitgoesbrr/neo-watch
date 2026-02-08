import cron from "node-cron";
import { eq, inArray, and, gte } from "drizzle-orm";
import { fetchNeoFeed } from "../services/nasa";
import { createCloseApproachAlert } from "../services/alert";
import { db } from "../db";
import { watchlist, alerts } from "../db/schema";
import { enrichNeoWithRisk } from "../services/risk-engine";

export function startCronJobs() {
  console.log("Starting background jobs...");

  // Run immediately on start (for demo purposes)
  runDailyCheck();

  // Schedule to run every day at midnight (00:00)
  cron.schedule("0 0 * * *", () => {
    console.log("Running scheduled daily NEOS check...");
    runDailyCheck();
  });
}

async function runDailyCheck() {
  try {
    console.log("Fetching today's NEO feed...");
    const neos = await fetchNeoFeed();
    console.log(`Fetched ${neos.length} NEOs for today.`);

    if (neos.length === 0) return;

    const neoIds = neos.map((n) => n.id);
    
    // Find all relevant watchlist items in one query
    const watchingItems = await db
        .select()
        .from(watchlist)
        .where(inArray(watchlist.asteroidId, neoIds));

    console.log(`Found ${watchingItems.length} active watches for today's objects.`);

    let alertsGenerated = 0;

    for (const item of watchingItems) {
        if (!item.alertEnabled) continue;

        const neo = neos.find((n) => n.id === item.asteroidId);
        if (!neo) continue;

        // Check approach data
        // NASA API usually provides close_approach_data relevant to the feed dates
        const approach = neo.closeApproachData[0];
        if (!approach) continue;

        // Verify approach date matches today to avoid stale data (optional)
        // const today = new Date().toISOString().split('T')[0];
        // if (approach.date !== today) continue; 

        // Check thresholds
        const distanceKm = approach.missDistance.kilometers;
        const threshold = item.alertThresholdKm ?? 0;
        
        if (distanceKm <= threshold) {
             // Check for duplicate alert (same user, same asteroid, created today)
             const today = new Date();
             today.setHours(0, 0, 0, 0);
             
             const existingAlert = await db
                 .select()
                 .from(alerts)
                 .where(
                     and(
                         eq(alerts.userId, item.userId),
                         eq(alerts.asteroidId, neo.id),
                         eq(alerts.type, "close_approach"),
                         gte(alerts.createdAt, today)
                     )
                 )
                 .limit(1);
             
             if (existingAlert.length > 0) {
                 console.log(`Skipping duplicate alert for User ${item.userId} regarding Object ${neo.name}`);
                 continue;
             }
             
             console.log(`Generating alert for User ${item.userId} regarding Object ${neo.name}`);
             
             await createCloseApproachAlert(
                item.userId,
                neo.id,
                neo.name,
                approach.dateFull,
                distanceKm
             );
             alertsGenerated++;
        }
    }
    
    console.log(`Daily check completed. Generated ${alertsGenerated} alerts.`);

  } catch (error) {
    console.error("Daily NEO check failed:", error);
  }
}
