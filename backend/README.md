# Motiminder Backend Setup Guide

## 📋 Prerequisites

Before setting up the backend, ensure you have:

- Node.js (version 14 or higher) installed
- A OneSignal account (free at https://onesignal.com/)

## 🚀 Setup Instructions

### 1. Install Dependencies

Navigate to the backend directory and install the required packages:

```bash
cd backend
npm install
```

### 2. OneSignal Configuration

1. **Create a OneSignal Account**: Go to https://onesignal.com/ and sign up
2. **Create a New App**:

   - Click "New App/Website"
   - Choose "Web Push" platform
   - Enter your app name (e.g., "Motiminder")
   - Choose your website URL (for development: `http://localhost:3000`)

3. **Get Your Credentials**:
   - **App ID**: Found in Settings > Keys & IDs
   - **REST API Key**: Found in Settings > Keys & IDs

### 3. Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Edit the `.env` file and add your OneSignal credentials:

```env
ONESIGNAL_APP_ID=your_actual_app_id_here
ONESIGNAL_REST_API_KEY=your_actual_rest_api_key_here
PORT=3000
```

### 4. Start the Server

For development (with auto-restart):

```bash
npm run dev
```

For production:

```bash
npm start
```

The server will start on `http://localhost:3000`

## 🔧 Features Implemented

### 1. **Data Reception from Frontend**

- `POST /api/reminders` - Create new reminder
- `GET /api/reminders` - Get all reminders
- `DELETE /api/reminders/:id` - Delete a reminder

### 2. **OneSignal Integration**

- Automatic notification sending when reminders are due
- `POST /api/test-notification` - Test notification endpoint
- Support for targeted notifications (specific users)

### 3. **Cron Job Scheduling**

- Automatic check every minute for due reminders
- Marks reminders as sent to prevent duplicates
- Handles overdue reminders

## 📡 API Endpoints

### Create Reminder

```
POST /api/reminders
Content-Type: application/json

{
  "title": "Meeting with client",
  "description": "Discuss project requirements",
  "reminderTime": "2025-07-03T15:30:00",
  "userIds": ["user1", "user2"] // optional - for specific users
}
```

### Get All Reminders

```
GET /api/reminders
```

### Delete Reminder

```
DELETE /api/reminders/1
```

### Test Notification

```
POST /api/test-notification
Content-Type: application/json

{
  "title": "Test Title",
  "message": "Test message"
}
```

## 🔔 OneSignal Web Push Setup

To enable web push notifications in your browser:

1. **Add OneSignal SDK to Frontend** (optional for better integration):

   - Include OneSignal Web SDK in your frontend
   - Initialize with your App ID
   - Request notification permission

2. **Test Notifications**:
   - Use the `/api/test-notification` endpoint
   - Check browser notification permissions
   - Verify OneSignal dashboard for delivery status

## 🗄️ Data Storage

Currently using **in-memory storage** for simplicity. For production, consider:

### Database Options:

- **SQLite**: Simple file-based database
- **MongoDB**: NoSQL document database
- **PostgreSQL**: Full-featured SQL database
- **MySQL**: Popular SQL database

### Sample Database Schema (SQL):

```sql
CREATE TABLE reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reminder_time DATETIME NOT NULL,
    user_ids JSON,
    sent BOOLEAN DEFAULT FALSE,
    sent_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Troubleshooting

### Common Issues:

1. **OneSignal notifications not sending**:

   - Verify App ID and REST API Key
   - Check OneSignal dashboard for errors
   - Ensure notification permissions are granted

2. **Cron job not running**:

   - Check server logs
   - Verify reminder times are in correct format
   - Test with near-future reminder times

3. **CORS errors**:

   - Ensure CORS is enabled in backend
   - Check frontend API URL configuration

4. **Server won't start**:
   - Check if port 3000 is available
   - Verify all dependencies are installed
   - Check environment variables

## 📈 Production Considerations

1. **Database**: Replace in-memory storage with persistent database
2. **Authentication**: Add user authentication and authorization
3. **Rate Limiting**: Implement API rate limiting
4. **Logging**: Add comprehensive logging
5. **Error Handling**: Enhanced error handling and monitoring
6. **Security**: HTTPS, input validation, sanitization
7. **Scalability**: Load balancing, caching, database optimization

## 🎯 Next Steps

1. Set up OneSignal account and get credentials
2. Install dependencies and configure environment
3. Start the backend server
4. Test with the frontend interface
5. Send test notifications to verify integration

Happy coding! 🚀
