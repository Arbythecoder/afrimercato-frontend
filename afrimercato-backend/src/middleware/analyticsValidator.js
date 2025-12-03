// Date range validation middleware
exports.validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;

  // Check if dates are provided
  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'Start date and end date are required',
      errorCode: 'INVALID_DATE_RANGE'
    });
  }

  // Check if dates are valid
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date format. Use YYYY-MM-DD',
      errorCode: 'INVALID_DATE_FORMAT'
    });
  }

  // Check if date range is valid (end date after start date)
  if (end < start) {
    return res.status(400).json({
      success: false,
      message: 'End date must be after start date',
      errorCode: 'INVALID_DATE_RANGE'
    });
  }

  // Check if date range is not too large (e.g., max 1 year)
  const maxDays = 365;
  const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  if (daysDiff > maxDays) {
    return res.status(400).json({
      success: false,
      message: `Date range cannot exceed ${maxDays} days`,
      errorCode: 'DATE_RANGE_TOO_LARGE'
    });
  }

  next();
};