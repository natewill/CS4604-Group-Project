// Format date labels (Today, Tomorrow, day names, full dates)
export const getDateLabel = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  if (targetDate.getTime() === today.getTime()) {
    return "Today";
  }
  
  if (targetDate.getTime() === tomorrow.getTime()) {
    return "Tomorrow";
  }
  
  const daysAway = Math.floor((targetDate - today) / (1000 * 60 * 60 * 24));
  
  // Within a week - show day name
  if (daysAway > 0 && daysAway <= 7) {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }
  
  // More than a week or past - show full date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });
};

// Group runs by date
export const groupRunsByDate = (runs) => {
  return runs.reduce((acc, run) => {
    if (!acc[run.date]) {
      acc[run.date] = [];
    }
    acc[run.date].push(run);
    return acc;
  }, {});
};

