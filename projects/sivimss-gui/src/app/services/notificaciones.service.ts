import {Injectable} from "@angular/core";

@Injectable()
export class NotificacionesService {

  readonly notificaciones = ["Notificion1", "Notificion2", "Notifiacion3", "Notificacion4"];

  constructor() {
  }

  existenNotificaciones(): boolean {
    return this.obtenerNotificaciones().length !== 0
  }

  guardarNotificaciones(): void {
    localStorage.setItem('notificaciones', JSON.stringify(this.notificaciones));
  }

  consultarNotificaciones(): string[] {
    return this.obtenerNotificaciones();
  }

  borrarNotificaciones(): void {
    localStorage.removeItem('notificaciones');
  }

  obtenerNotificaciones(): string[] {
    const notificaciones = JSON.parse(localStorage.getItem('notificaciones') as string);
    return notificaciones || this.notificaciones;
  }
}
