import {ChangeDetectorRef, Component, ElementRef, Input, OnInit, Renderer2} from '@angular/core';
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {SeguimientoNuevoConvenioService} from "../../services/seguimiento-nuevo-convenio.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";
import {SolicitudDocumento} from "../../models/solicitudDocumento.interface";
import {finalize} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-resumen-persona',
  templateUrl: './resumen-persona.component.html',
  styleUrls: ['./resumen-persona.component.scss']
})
export class ResumenPersonaComponent implements OnInit {
  @Input() matricula: string = 'Sin Información';
  @Input() rfc: string = 'Sin Información';
  @Input() curp: string = 'Sin Información';
  @Input() nombre: string = 'Sin Información';
  @Input() primerApellido: string = 'Sin Información';
  @Input() segundoApellido: string = 'Sin Información';
  @Input() calle: string = 'Sin Información';
  @Input() numeroExterior: string = 'Sin Información';
  @Input() numeroInterior: string = 'Sin Información';
  @Input() codigoPostal: string = 'Sin Información';
  @Input() colonia: string = 'Sin Información';
  @Input() municipio: string = 'Sin Información';
  @Input() estado: string = 'Sin Información';
  @Input() nacionalidad: string = 'Sin Información';
  @Input() paisNacimiento: string = 'Sin Información';
  @Input() lugarNacimiento: string = 'Sin Información';
  @Input() correoElectronico: string = 'Sin Información';
  @Input() telefono: string = 'Sin Información';
  @Input() enfermedad: string = 'Sin Información';
  @Input() mostrarEnfermedad: boolean = true;
  @Input() tipoPaquete: string = '';
  @Input() nombreINE: string = '';
  @Input() nombreCURP: string = '';
  @Input() nombreRFC: string = '';
  @Input() ID: string = '';
  @Input() idPersona: number = 0;
  @Input() idContratante: number = 0;
  @Input() idPaqueteConvenio: number = 0;

  tipoDoc: TipoDropdown[] = [
    {value: 1, label: 'INE del afiliado'},
    {value: 2, label: 'CURP del afiliado'},
    {value: 3, label: 'RFC del afiliado'}
  ];

  tipoRFC: number = 3;
  tipoCURP: number = 2;
  tipoINE: number = 1;

  constructor(private cargadorService: LoaderService,
              private seguimientoNuevoConvenioService: SeguimientoNuevoConvenioService,
              private mensajesSistemaService: MensajesSistemaService,
              private alertaService: AlertaService,
              private el: ElementRef,
              private renderer: Renderer2,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.cambiarValorInputDescarga();
  }

  cambiarValorInputDescarga(): void {
    const verDocINE = this.el.nativeElement.querySelector('#verDocINE') as HTMLInputElement;
    const verDocCURP = this.el.nativeElement.querySelector('#verDocCURP') as HTMLInputElement;
    const verDocRFC = this.el.nativeElement.querySelector('#verDocRFC') as HTMLInputElement;
    if (verDocINE) {
      verDocINE.value = this.nombreINE;
    }
    if (verDocCURP) {
      verDocCURP.value = this.nombreCURP;
    }
    if (verDocRFC) {
      verDocRFC.value = this.nombreRFC;
    }
    this.cdr.detectChanges();
  }

  descargarArchivo(tipoDocumento: number) {
    const solicitud: SolicitudDocumento = this.generarSolicitudDescarga(tipoDocumento);
    this.cargadorService.activar();
    this.seguimientoNuevoConvenioService.descargarDocumento(solicitud).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta) => {
        if (!respuesta.datos) {
          this.alertaService.mostrar(TipoAlerta.Error, 'Error en la descarga del documento.Intenta nuevamente.');
          return;
        }
        let link = this.renderer.createElement('a');
        let nombreDocumento: string = 'documento';
        if (tipoDocumento === 1) {
          nombreDocumento = this.nombreINE.split('.')[0];
        }
        if (tipoDocumento === 2) {
          nombreDocumento = this.nombreCURP.split('.')[0];
        }
        if (tipoDocumento === 3) {
          nombreDocumento = this.nombreRFC.split('.')[0];
        }
        link.setAttribute('download', nombreDocumento);
        link.setAttribute('href', respuesta.datos);
        link.click();
        link.remove();
      },
      error: (error: HttpErrorResponse) => {
        const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, errorMsg || 'Error en la descarga del documento.Intenta nuevamente.');
      }
    });
  }

  generarSolicitudDescarga(tipoDocumento: number): SolicitudDocumento {
    return {
      idContratante: this.idContratante,
      idPaqueteConvenio: this.idPaqueteConvenio,
      idPersona: this.idPersona,
      tipoDocumento,
      tipoPersona: 1
    }
  }

}
