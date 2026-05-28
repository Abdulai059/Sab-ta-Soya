/**
 * Format assignment history record into human-readable message
 * @param {Object} record - History record from useAssignmentHistory
 * @returns {string} Formatted message
 */
export function formatHistoryMessage(record) {
  if (record.type === 'assignment') {
    return `${record.assigner.full_name} assigned this report to ${record.worker.full_name}`;
  }
  
  if (record.type === 'status_change') {
    return `${record.changer.full_name} changed status from "${record.old_status}" to "${record.new_status}"`;
  }
  
  return 'Unknown action';
}

/**
 * Format timestamp as relative time (e.g., "2 hours ago")
 * @param {string|Date} timestamp - ISO timestamp or Date object
 * @returns {string} Relative time string
 */
export function formatTimeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  
  // For older dates, return formatted date
  return past.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
