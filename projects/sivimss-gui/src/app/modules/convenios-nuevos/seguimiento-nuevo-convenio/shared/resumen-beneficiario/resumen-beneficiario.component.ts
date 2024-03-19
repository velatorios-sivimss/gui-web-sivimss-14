import {ChangeDetectorRef, Component, ElementRef, Input, OnInit, Renderer2} from '@angular/core';
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {SolicitudDocumento} from "../../models/solicitudDocumento.interface";
import {finalize} from "rxjs/operators";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {SeguimientoNuevoConvenioService} from "../../services/seguimiento-nuevo-convenio.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";

@Component({
  selector: 'app-resumen-beneficiario',
  templateUrl: './resumen-beneficiario.component.html',
  styleUrls: ['./resumen-beneficiario.component.scss']
})
export class ResumenBeneficiarioComponent implements OnInit {
  @Input() nombre: string = 'Sin Información';
  @Input() edad: number = 0;
  @Input() parentesco: string = 'Sin Información';
  @Input() curp: string = 'Sin Información';
  @Input() rfc: string = 'Sin Información';
  @Input() correoElectronico: string = 'Sin Información';
  @Input() telefono: string = 'Sin Información';
  @Input() ID: string = '0';
  @Input() numeroDocumento: string = '';
  @Input() tipoDocumento: number = 0;
  @Input() nombreDocumento: string = '';
  @Input() idContratante: number = 0;
  @Input() idPaqueteConvenio: number = 0;
  @Input() idPersona: number = 0;

  tipoDoc: TipoDropdown[] = [
    {value: 1, label: 'INE del beneficiario'},
    {value: 4, label: 'Acta de nacimiento del beneficiario'}
  ];

  constructor(private cargadorService: LoaderService,
              private seguimientoNuevoConvenioService: SeguimientoNuevoConvenioService,
              private renderer: Renderer2,
              private alertaService: AlertaService,
              private mensajesSistemaService: MensajesSistemaService,
              private el: ElementRef,
              private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.cambiarValorInputDescarga();
  }

  cambiarValorInputDescarga(): void {
    const verDocInput = this.el.nativeElement.querySelector('#verDoc') as HTMLInputElement;
    if (verDocInput) {
      verDocInput.value = this.nombreDocumento;
      this.cdr.detectChanges();
    }
  }

  descargarArchivo(): void {
    const solicitud: SolicitudDocumento = this.generarSolicitudDescarga();
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
        const [nombreDocumento] = this.nombreDocumento.split('.');
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

  generarSolicitudDescarga(): SolicitudDocumento {
    console.log(this.idContratante)
    return {
      idContratante: this.idContratante,
      idPaqueteConvenio: this.idPaqueteConvenio,
      idPersona: this.idPersona,
      tipoDocumento: this.tipoDocumento,
      tipoPersona: 2
    }
  }

}
