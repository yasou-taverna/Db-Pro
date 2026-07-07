export const BOOKING_TIMES = {
  '20:00': 'covered',
  '20:05': 'covered',
  '20:10': 'covered',
  '20:30': 'inside',
  '20:35': 'inside',
  '21:00': 'outside',
  '21:05': 'outside',
  '21:10': 'outside',
  '21:15': 'outside'
};

export const PUBLIC_TIMES = Object.keys(BOOKING_TIMES);

export const AREA_NAMES = {
  covered: 'מקורה',
  inside: 'פנימי',
  outside: 'חיצוני'
};

export const AREA_BY_HEBREW = {
  'מקורה': 'covered',
  'פנימי': 'inside',
  'חיצוני': 'outside'
};
