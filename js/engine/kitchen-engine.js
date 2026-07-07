export function kitchenLoad(reservations){
  return reservations.reduce((acc,r)=>{
    acc[r.area] = (acc[r.area] || 0) + Number(r.guests || 0);
    return acc;
  }, {});
}
