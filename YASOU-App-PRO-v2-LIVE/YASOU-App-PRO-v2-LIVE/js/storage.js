export const storage = {
  get(key, fallback=[]){ return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); },
  set(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
};
