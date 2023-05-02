import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

export enum TipoAlerta {
  Exito = 'success',
  Info = 'info',
  Precaucion = 'warning',
  Error = 'error'
}
/**
 * Servicio que permite mostrar las alertas flotantes del sistema.
 */
@Injectable()
export class AlertaService {

  constructor(private messageService: MessageService) { }

  /**
 * Muestra una alerta flotante
 * @param tipo
 * @param mensaje
 * @param fijo Si este valor es true la alerta no desaparecera hasta que presiones la X.
 */
  mostrar(tipo: TipoAlerta, mensaje: string, fijo?: boolean) {
    let severity = '';
    switch (tipo) {
      case TipoAlerta.Exito: severity = 'success'; break;
      case TipoAlerta.Info: severity = 'info'; break;
      case TipoAlerta.Precaucion: severity = 'warn'; break;
      case TipoAlerta.Error: severity = 'error'; break;
      default: severity = 'info'; break;
    }
    this.messageService.add({ severity, detail: mensaje, sticky: !!fijo });
  }

  /**
   * Limpia todas las alertas
   */
  limpiar() {
    this.messageService.clear();
  }

}
