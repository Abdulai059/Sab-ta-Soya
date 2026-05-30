export function calculateAssignmentStats(history) {
  if (!history || history.length === 0) {
    return {
      total: 0,
      completed: 0,
      declined: 0,
      expired: 0,
      completionRate: 0,
      averageCompletionTime: null
    };
  }

  const completed = history.filter(a => a.status === 'completed');
  const declined = history.filter(a => a.status === 'rejected');
  const expired = history.filter(a => a.status === 'expired');

  const completionRate = history.length > 0 
    ? Math.round((completed.length / history.length) * 100) 
    : 0;

  let averageCompletionTime = null;
  if (completed.length > 0) {
    const totalDays = completed.reduce((sum, assignment) => {
      const start = new Date(assignment.accepted_at || assignment.assigned_at);
      const end = new Date(assignment.completed_at);
      const days = (end - start) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);
    
    const avgDays = totalDays / completed.length;
    averageCompletionTime = avgDays < 1 
      ? `${Math.round(avgDays * 24)} hours`
      : `${avgDays.toFixed(1)} days`;
  }

  return {
    total: history.length,
    completed: completed.length,
    declined: declined.length,
    expired: expired.length,
    completionRate,
    averageCompletionTime
  };
}

export function calculateDuration(assignment) {
  let start, end;

  if (assignment.status === 'completed') {
    start = new Date(assignment.accepted_at || assignment.assigned_at);
    end = new Date(assignment.completed_at);
  } else if (assignment.status === 'rejected') {
    start = new Date(assignment.assigned_at);
    end = new Date(assignment.rejected_at);
  } else if (assignment.status === 'expired') {
    start = new Date(assignment.assigned_at);
    end = new Date(assignment.expired_at);
  } else {
    return null;
  }

  const hours = (end - start) / (1000 * 60 * 60);
  
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutes`;
  } else if (hours < 24) {
    return `${Math.round(hours)} hours`;
  } else {
    const days = hours / 24;
    return `${days.toFixed(1)} days`;
  }
}
