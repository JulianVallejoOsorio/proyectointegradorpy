export function alertGeneral(message, icon) {
  Swal.fire({
    title: message,
    icon: icon,
    draggable: true,
  });
}