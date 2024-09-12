// calculateDaysDiff.js

function calculateDaysDiff(date1, date2) {
  const startDate = new Date(date1);
  const endDate = new Date(date2);
  const timeDiff = endDate - startDate;
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return daysDiff;
}


export default calculateDaysDiff;