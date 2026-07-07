export function whatsappLink(phone, message){
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
