const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../")));

// In-memory storage for reminders (use a database in production)
let reminders = [];
let reminderIdCounter = 1;

// OneSignal configuration
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

// OneSignal API endpoint
const ONESIGNAL_API_URL = "https://onesignal.com/api/v1/notifications";

/**
 * Send notification using OneSignal
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {Array} userIds - Array of user IDs to send to (optional)
 */
async function sendOneSignalNotification(title, message, userIds = null) {
  try {
    const notificationData = {
      app_id: ONESIGNAL_APP_ID,
      headings: { en: title },
      contents: { en: message },
      // Send to all users if no specific user IDs provided
      included_segments: userIds ? undefined : ["All"],
      include_player_ids: userIds || undefined,
    };

    const response = await axios.post(ONESIGNAL_API_URL, notificationData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
    });

    console.log("OneSignal notification sent successfully:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(
      "Error sending OneSignal notification:",
      error.response?.data || error.message
    );
    return { success: false, error: error.message };
  }
}

/**
 * Check for due reminders and send notifications
 */
function checkAndSendReminders() {
  const now = new Date();
  const dueReminders = reminders.filter((reminder) => {
    const reminderTime = new Date(reminder.reminderTime);
    return reminderTime <= now && !reminder.sent;
  });

  dueReminders.forEach(async (reminder) => {
    console.log(`Sending reminder: ${reminder.title}`);

    const result = await sendOneSignalNotification(
      reminder.title,
      reminder.description || "Reminder notification",
      reminder.userIds
    );

    if (result.success) {
      // Mark reminder as sent
      reminder.sent = true;
      reminder.sentAt = new Date();
      console.log(`Reminder "${reminder.title}" sent successfully`);
    } else {
      console.error(`Failed to send reminder "${reminder.title}"`);
    }
  });
}

// Routes

/**
 * GET / - Serve the main HTML file
 */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

/**
 * POST /api/reminders - Create a new reminder
 */
app.post("/api/reminders", (req, res) => {
  try {
    const { title, description, reminderTime, userIds } = req.body;

    // Validate required fields
    if (!title || !reminderTime) {
      return res.status(400).json({
        success: false,
        error: "Title and reminder time are required",
      });
    }

    // Validate reminder time is in the future
    const reminderDate = new Date(reminderTime);
    if (reminderDate <= new Date()) {
      return res.status(400).json({
        success: false,
        error: "Reminder time must be in the future",
      });
    }

    // Create new reminder
    const newReminder = {
      id: reminderIdCounter++,
      title,
      description: description || "",
      reminderTime,
      userIds: userIds || null,
      sent: false,
      createdAt: new Date(),
    };

    reminders.push(newReminder);

    console.log("New reminder created:", newReminder);

    res.status(201).json({
      success: true,
      message: "Reminder created successfully",
      reminder: newReminder,
    });
  } catch (error) {
    console.error("Error creating reminder:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/reminders - Get all reminders
 */
app.get("/api/reminders", (req, res) => {
  try {
    res.json({
      success: true,
      reminders: reminders,
    });
  } catch (error) {
    console.error("Error fetching reminders:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * DELETE /api/reminders/:id - Delete a reminder
 */
app.delete("/api/reminders/:id", (req, res) => {
  try {
    const reminderId = parseInt(req.params.id);
    const reminderIndex = reminders.findIndex((r) => r.id === reminderId);

    if (reminderIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Reminder not found",
      });
    }

    reminders.splice(reminderIndex, 1);

    res.json({
      success: true,
      message: "Reminder deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting reminder:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * POST /api/test-notification - Test OneSignal notification
 */
app.post("/api/test-notification", async (req, res) => {
  try {
    const { title, message } = req.body;

    const result = await sendOneSignalNotification(
      title || "Test Notification",
      message || "This is a test notification from Motiminder!"
    );

    res.json(result);
  } catch (error) {
    console.error("Error sending test notification:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Cron job to check for due reminders every minute
cron.schedule("* * * * *", () => {
  console.log("Checking for due reminders...");
  checkAndSendReminders();
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Motiminder server running on http://localhost:${PORT}`);
  console.log("📅 Cron job scheduled to check reminders every minute");
  console.log("🔔 OneSignal integration ready");

  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
    console.warn(
      "⚠️  WARNING: OneSignal credentials not found in environment variables"
    );
  }
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down Motiminder server...");
  process.exit(0);
});
