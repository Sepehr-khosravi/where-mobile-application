// src/services/backgroundLocation.ts
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { connectSocket, getSocket } from './socket';

export const LOCATION_TASK_NAME = 'BACKGROUND_LOCATION_TASK';

// فقط یکبار تعریف کن، حتی اگر چندبار ایمپورت بشه
if (!TaskManager.isTaskDefined(LOCATION_TASK_NAME)) {
  TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    // خطاهای سطح تسک را بگیر
    if (error) {
      // لاگ نکن تا کرش نکنه
      return;
    }

    try {
      if (!data) return;
      const { locations } = data as { locations: Location.LocationObject[] };
      if (!locations || locations.length === 0) return;

      const location = locations[0];
      if (!location) return;

      const { latitude, longitude, accuracy } = location.coords;

      // فیلتر دقت پایین (با محدوده بالاتر برای کاهش ارسال‌های بی‌دقت)
      if (accuracy && accuracy > 200) {
        return;
      }

      // فقط در صورتی که سوکت وصل باشه ارسال کن
      let socket = await getSocket();
      if (!socket || !socket.connected) {
        // تلاش برای اتصال مجدد با timeout
        try {
          await Promise.race([
            connectSocket(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
          ]);
          socket = await getSocket();
        } catch (_) {
          // اگر نتونست وصل بشه، بی‌صدا خارج شو
          return;
        }
      }

      if (socket && socket.connected) {
        socket.emit('location:update', { latitude, longitude });
      }
    } catch (_) {
      // همه‌ی خطاها را بگیر و نادیده بگیر تا کرش نکنه
    }
  });
}