export function validateBookingForm(data, agreed) {
  const errors = [];
  if (!data.customerName || data.customerName.length < 2) errors.push('יש להזין שם מלא.');
  if (!data.phone || data.phone.length < 8) errors.push('יש להזין מספר טלפון תקין.');
  if (!data.date) errors.push('יש לבחור תאריך.');
  if (!data.time) errors.push('יש לבחור שעה.');
  if (!data.guests || data.guests < 1) errors.push('יש לבחור מספר סועדים.');
  if (!agreed) errors.push('יש לאשר את תנאי ההזמנה.');
  return errors;
}
