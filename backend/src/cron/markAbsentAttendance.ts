import cron from 'node-cron';
import { attendanceService } from '../services/attendanceService.js';


export const startAttendanceCronJob = () => {
  cron.schedule('5 0 * * *', async () => {
    console.log('[CRON] Running attendance absence marking job...');
    
    try {
      await attendanceService.fillMissingAttendanceForAll();
      console.log('[CRON] Attendance absence marking completed successfully');
    } catch (error) {
      console.error('[CRON] Error marking absent attendance:', error);
    }
  });

  console.log('[CRON] Attendance cron job scheduled (12:05 AM daily)');
};