// ─── Notification polling service ─────────────────────────────────────────────
// Polls every 30 seconds; calls a callback with { notifications, unread_count }

import { notificationAPI } from './api';

let _intervalId  = null;
let _subscribers = [];

const emit = (data) => _subscribers.forEach(fn => fn(data));

export const notificationService = {
  subscribe(fn) {
    _subscribers.push(fn);
    return () => { _subscribers = _subscribers.filter(s => s !== fn); };
  },

  async fetchNow() {
    try {
      const res = await notificationAPI.getAll({ limit: 20 });
      emit({ notifications: res.data.data, unread_count: res.data.unread_count });
    } catch (_) {}
  },

  start() {
    if (_intervalId) return;
    this.fetchNow();
    _intervalId = setInterval(() => this.fetchNow(), 30000);
  },

  stop() {
    if (_intervalId) { clearInterval(_intervalId); _intervalId = null; }
  },

  async markRead(id) {
    await notificationAPI.markRead(id);
    await this.fetchNow();
  },

  async markAllRead() {
    await notificationAPI.readAll();
    await this.fetchNow();
  },
};
