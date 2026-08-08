import Pusher from 'pusher';

let pusherInstance = null;

const appId = process.env.PUSHER_APP_ID;
const key = process.env.PUSHER_KEY || process.env.VITE_PUSHER_KEY;
const secret = process.env.PUSHER_SECRET;
const cluster = process.env.PUSHER_CLUSTER || process.env.VITE_PUSHER_CLUSTER || 'mt1';

if (appId && key && secret) {
  try {
    pusherInstance = new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    });
    console.log('[Pusher]: Server client initialized successfully');
  } catch (err) {
    console.error('[Pusher Initialization Error]:', err.message);
  }
} else {
  console.warn('[Pusher Warning]: Missing Pusher environment variables (PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET). Running in mock/fallback mode.');
}

/**
 * Safely trigger a Pusher event
 * @param {string} channel 
 * @param {string} event 
 * @param {object} data 
 */
export const triggerPusher = async (channel, event, data) => {
  if (pusherInstance) {
    try {
      await pusherInstance.trigger(channel, event, data);
      console.log(`[Pusher Event Triggered] Channel: ${channel}, Event: ${event}`);
    } catch (error) {
      console.error(`[Pusher Trigger Error] Channel: ${channel}, Event: ${event}`, error.message);
    }
  } else {
    console.log(`[Pusher Mock Event] Channel: ${channel}, Event: ${event}`, data);
  }
};

export default pusherInstance;
