export function totalGuests(reservations){ return reservations.reduce((sum,r)=>sum+Number(r.guests||0),0); }
