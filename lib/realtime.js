/**
 * Supabase Real-time Utilities
 * 
 * This file provides utilities for setting up real-time subscriptions
 * across the application for instant UI updates when database changes occur.
 */

import { supabase } from "./supabase";

/**
 * Subscribe to changes on a specific table
 * @param {string} channelName - Unique channel identifier
 * @param {string} tableName - Database table name
 * @param {Function} callback - Function to call when changes occur
 * @param {Object} options - Additional options
 * @param {string} options.event - Event type: '*', 'INSERT', 'UPDATE', 'DELETE'
 * @param {string} options.filter - Filter string (e.g., 'assigned_to=eq.123')
 * @returns {Object} Channel object for cleanup
 */
export function subscribeToTable(channelName, tableName, callback, options = {}) {
  const { event = "*", filter } = options;

  const config = {
    event,
    schema: "public",
    table: tableName,
  };

  if (filter) {
    config.filter = filter;
  }

  const channel = supabase
    .channel(channelName)
    .on("postgres_changes", config, (payload) => {
      callback(payload);
    })
    .subscribe();

  return channel;
}

/**
 * Subscribe to multiple tables at once
 * @param {Array} subscriptions - Array of subscription configs
 * @returns {Array} Array of channel objects for cleanup
 * 
 * @example
 * const channels = subscribeToMultipleTables([
 *   { channelName: 'reports', tableName: 'sanitation_reports', callback: fetchReports },
 *   { channelName: 'tasks', tableName: 'service_tasks', callback: fetchTasks }
 * ]);
 */
export function subscribeToMultipleTables(subscriptions) {
  return subscriptions.map(({ channelName, tableName, callback, options }) =>
    subscribeToTable(channelName, tableName, callback, options)
  );
}

/**
 * Unsubscribe from a channel
 * @param {Object} channel - Channel object returned from subscribe functions
 */
export function unsubscribe(channel) {
  if (channel) {
    supabase.removeChannel(channel);
  }
}

/**
 * Unsubscribe from multiple channels
 * @param {Array} channels - Array of channel objects
 */
export function unsubscribeAll(channels) {
  channels.forEach(unsubscribe);
}

/**
 * Common table subscriptions for reuse
 */
export const TABLE_SUBSCRIPTIONS = {
  REPORTS: "sanitation_reports",
  ASSIGNMENTS: "report_assignments",
  TASKS: "service_tasks",
  PROFILES: "profiles",
  LOCATIONS: "locations",
  COMMUNITIES: "communities",
  CLIMATE_EVENTS: "climate_events",
};

/**
 * Setup real-time for worker offers (filtered by user)
 * @param {string} userId - User ID to filter tasks
 * @param {Function} callback - Callback function
 * @returns {Array} Array of channels
 */
export function setupWorkerOffersRealtime(userId, callback) {
  return subscribeToMultipleTables([
    {
      channelName: `worker_tasks_${userId}`,
      tableName: TABLE_SUBSCRIPTIONS.TASKS,
      callback,
      options: { filter: `assigned_to=eq.${userId}` },
    },
    {
      channelName: `worker_reports_${userId}`,
      tableName: TABLE_SUBSCRIPTIONS.REPORTS,
      callback,
    },
    {
      channelName: `worker_assignments_${userId}`,
      tableName: TABLE_SUBSCRIPTIONS.ASSIGNMENTS,
      callback,
    },
  ]);
}

/**
 * Setup real-time for admin assign workers page
 * @param {Function} callback - Callback function
 * @returns {Array} Array of channels
 */
export function setupAssignWorkersRealtime(callback) {
  return subscribeToMultipleTables([
    {
      channelName: "assign_reports",
      tableName: TABLE_SUBSCRIPTIONS.REPORTS,
      callback,
    },
    {
      channelName: "assign_assignments",
      tableName: TABLE_SUBSCRIPTIONS.ASSIGNMENTS,
      callback,
    },
    {
      channelName: "assign_tasks",
      tableName: TABLE_SUBSCRIPTIONS.TASKS,
      callback,
    },
    {
      channelName: "assign_workers",
      tableName: TABLE_SUBSCRIPTIONS.PROFILES,
      callback,
    },
  ]);
}

/**
 * Setup real-time for admin dashboard
 * @param {Function} callback - Callback function
 * @returns {Array} Array of channels
 */
export function setupDashboardRealtime(callback) {
  return subscribeToMultipleTables([
    {
      channelName: "dashboard_reports",
      tableName: TABLE_SUBSCRIPTIONS.REPORTS,
      callback,
    },
    {
      channelName: "dashboard_assignments",
      tableName: TABLE_SUBSCRIPTIONS.ASSIGNMENTS,
      callback,
    },
  ]);
}

/**
 * Setup real-time for reports list
 * @param {Function} callback - Callback function
 * @returns {Object} Channel object
 */
export function setupReportsListRealtime(callback) {
  return subscribeToTable("reports_list", TABLE_SUBSCRIPTIONS.REPORTS, callback);
}
