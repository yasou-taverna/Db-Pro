export function todayISO(){ return new Date().toISOString().slice(0,10); }
export function uid(prefix='id'){ return prefix + Date.now() + Math.random().toString(16).slice(2); }
