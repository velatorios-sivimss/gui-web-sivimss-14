import {Component, OnInit, Renderer2} from '@angular/core';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {
  ModalDetalleBeneficiariosComponent
} from './components/modal-detalle-beneficiarios/modal-detalle-beneficiarios.component';
import {ModalRenovarConvenioComponent} from './components/modal-renovar-convenio/modal-renovar-convenio.component';
import {ActivatedRoute, Router} from '@angular/router';
import {LoaderService} from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import {
  AlertaService,
  TipoAlerta,
} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {BusquedaConveniosPFServic} from '../../services/busqueda-convenios-pf.service';
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {finalize} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {DatosGeneralesDetalle} from '../../models/DatosGeneralesDetalle.interface';
import {Beneficiarios} from '../../models/Beneficiarios.interface';
import {DatosGeneralesRenovacion} from '../../models/DatosGeneralesRenovacion.interface';
import {
  ModalRegistrarNuevoBeneficiarioComponent
} from './components/modal-registrar-nuevo-beneficiario/modal-registrar-nuevo-beneficiario.component';
import {
  mapearArregloTipoDropdown,
  validarUsuarioLogueadoOnline
} from 'projects/sivimss-gui/src/app/utils/funciones';
import {TransaccionPago} from "../../../../models/transaccion-pago.interface";
import {SolicitudPagos} from "../../../../models/solicitud-pagos.interface";
import {GestorCredencialesService} from "../../../../../../services/gestor-credenciales.service";

@Component({
  selector: 'app-mi-convenio-prevision-funeraria',
  templateUrl: './mi-convenio-prevision-funeraria.component.html',
  styleUrls: ['./mi-convenio-prevision-funeraria.component.scss'],
  providers: [GestorCredencialesService]
})
export class MiConvenioPrevisionFunerariaComponent implements OnInit {
  beneficiarios: Beneficiarios[] = [];
  parentesco: any[] = [];

  datosGenerales: DatosGeneralesDetalle = {} as DatosGeneralesDetalle;
  datosGeneralesRenovacion: DatosGeneralesRenovacion = {} as DatosGeneralesRenovacion;
  ref!: DynamicDialogRef;
  agregarBeneficiarios: boolean = false;
  idPlan!: string;
  transaccion: any;
  nombreCompleto: string = '';
  idRenovacion: number = 0;

  constructor(
    private dialogService: DialogService,
    private rutaActiva: ActivatedRoute,
    private consultaConveniosService: BusquedaConveniosPFServic,
    private alertaService: AlertaService,
    private loaderService: LoaderService,
    private readonly router: Router,
    private renderer: Renderer2,
    private gestorCredencialesService: GestorCredencialesService,
  ) {
  }

  ngOnInit(): void {
    this.detalleConvenio();
    this.buscarParentesco();
  }

  detalleConvenio() {
    this.idPlan = this.rutaActiva.snapshot.queryParams.idpfs;
    if (validarUsuarioLogueadoOnline()) return;
    this.consultaConveniosService
      .detalleConvenio(this.idPlan)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error && respuesta.mensaje !== 'Exito') {
            this.alertaService.mostrar(
              TipoAlerta.Error,
              'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.'
            );
            return;
          }
          try {
            this.datosGenerales = respuesta.datos.datosGenerales[0] || {};
            this.gestorCredencialesService.obtenerToken().subscribe({
              next: (respuesta) => this.procesarToken(respuesta)
            });
            this.beneficiarios = respuesta.datos.beneficiarios || [];
            this.datosGeneralesRenovacion =
              respuesta.datos.datosRenovacion[0] || {};
            this.validarAlta();
          } catch (error) {
            console.error(error);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(
            TipoAlerta.Error,
            'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.'
          );
        },
      });
  }

  abrirModalDetalleBeneficiarios(event: MouseEvent, item: any): void {
    event.stopPropagation();
    this.ref = this.dialogService.open(ModalDetalleBeneficiariosComponent, {
      header: 'Detalle del beneficiario',
      style: {maxWidth: '876px', width: '100%'},
      data: {item: item, validaModificacion: this.agregarBeneficiarios},
    });

    this.ref.onClose.subscribe((respuesta: any) => {
      if (respuesta == 'exito') {
        this.detalleConvenio();
        return;
      }
      if (respuesta) {
        item = respuesta;
      }
    });
  }

  abrirModalRegistroNuevoBeneficiario(event: MouseEvent) {
    event.stopPropagation();

    this.ref = this.dialogService.open(
      ModalRegistrarNuevoBeneficiarioComponent,
      {
        header: 'Registrar nuevo beneficiaro',
        style: {maxWidth: '876px', width: '100%'},
        data: {
          idConvenio: this.datosGenerales.idConvenio,
          parentesco: this.parentesco,
          idVelatorio: this.datosGenerales.idVelatorio,
          velatorio: this.datosGenerales.velatorio,
          idContratante: this.datosGenerales.idContratante,
        },
      }
    );
    this.ref.onClose.subscribe((respuesta: any) => {
      if (respuesta == 'exito') {
        this.detalleConvenio();
      }
    });
  }

  cerrarModal(): void {
    void this.ref.onClose;
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }

  abrirModalRenovarConvenio(event: MouseEvent): void {
    event.stopPropagation();
    this.ref = this.dialogService.open(ModalRenovarConvenioComponent, {
      header: 'Renovar convenio',
      style: {maxWidth: '876px', width: '100%'},
      data: {
        item: this.datosGeneralesRenovacion,
      },
    });
    this.ref.onClose.subscribe((respuesta: any) => {
      if (respuesta.renovacion) this.iniciarPago()
    });
  }

  procesarToken(respuesta: HttpRespuesta<any>): void {
    const [credenciales] = respuesta.datos;
    this.cargarScript(() => {
    });
    const elemento_ref = document.querySelector('.realizar-pago');
    if (!elemento_ref) return;
    this.transaccion = {
      referencia: 'RPF',
      monto: this.datosGeneralesRenovacion.cuotaRecuperacion,
      mode: credenciales.mode,
      code: credenciales.code,
      key: credenciales.key
    }
    console.log(this.transaccion)
    this.subscripcionMotorPagos();
  }

  cargarScript(callback: () => void): void {
    const elementoId: string = 'realizar-pago';
    if (!document.getElementById(elementoId)) {
      const body: HTMLElement = document.body;
      const elemento_ref = this.renderer.createElement('script');
      elemento_ref.type = 'text/javascript';
      elemento_ref.src = '../../../../assets/js/control-pagos.js';
      elemento_ref.id = elementoId;
      elemento_ref.async = true;
      elemento_ref.defer = true;
      this.renderer.appendChild(body, elemento_ref);
      elemento_ref.onload = callback;
    } else {
      callback();
    }
  }

  iniciarPago(): void {
    const idConvenio: number = this.datosGenerales.idConvenio
    this.loaderService.activar();
    this.consultaConveniosService.renovarConvenio(idConvenio).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (response: HttpRespuesta<any>) => this.renovarConvenio(response)
    })
  }

  renovarConvenio(respuesta: HttpRespuesta<any>): void {
    if (!respuesta.datos) return;
    this.idRenovacion = respuesta.datos;
    const evento = new CustomEvent('realizarPago', {detail: this.transaccion});
    document.dispatchEvent(evento);
  }

  subscripcionMotorPagos(): void {
    // Escucha el evento personalizado
    document.addEventListener('datosRecibidos', (event) => {
      const data = (event as CustomEvent).detail;
      if (data.error && !data) {
        this.alertaService.mostrar(TipoAlerta.Error, 'Error en la realización del pago en línea.');
        return;
      }
      if (data.transaction && [0, 1, 2, 3].includes(data.transaction.status_detail)) {
        this.guardarPagoEnLinea(data);
      }
      if (data.transaction && ![0, 1, 2, 3].includes(data.transaction.status_detail)) {
        this.alertaService.mostrar(TipoAlerta.Error, 'Pago rechazado.');
      }
    });
  }

  guardarPagoEnLinea(transaccion: TransaccionPago): void {
    this.loaderService.activar();
    const solicitud: SolicitudPagos = this.generarSolicitudPagosLinea(transaccion);
    this.consultaConveniosService.guardarDatosPago(solicitud).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        const id = respuesta.datos.idPagoLinea;
        this.alertaService.mostrar(TipoAlerta.Exito, 'Pago realizado con éxito.');
        void this.router.navigate(['recibo-de-pago', id], {relativeTo: this.rutaActiva});
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
      }
    })
  }

  generarSolicitudPagosLinea(pago: TransaccionPago): SolicitudPagos {
    let idMetodoPago: number = 4;
    if (+pago.transaction.payment_method_type === 0) idMetodoPago = 4;
    if (+pago.transaction.payment_method_type === 7) idMetodoPago = 3;
    this.nombreCompleto = `${this.datosGenerales.nombreAfiliado} ${this.datosGenerales.primerApellido} ${this.datosGenerales.segundoApellido}`;
    return {
      fecTransaccion: pago.transaction.payment_date, // pagos linea
      folio: this.datosGenerales.folioConvenio,
      folioPago: "TEST-1", // pagos linea
      idFlujoPagos: 3,
      idMetodoPago, // debito o credito payment_method_type
      idRegistro: this.idRenovacion, // idConvenio
      idVelatorio: this.datosGenerales.idVelatorio,
      importe: this.datosGeneralesRenovacion.cuotaRecuperacion,
      nomContratante: this.nombreCompleto,
      nomTitular: this.nombreCompleto, // pagos
      numAprobacion: pago.transaction.authorization_code, // pagos
      numTarjeta: pago.card.number, // pagos number
      referencia: pago.transaction.id, // pagos transaction_reference
      refPago: 'RPF'
    }
  }

  buscarParentesco() {
    this.consultaConveniosService
      .parentesco()
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.error && respuesta.mensaje !== 'Exito') {
            console.log(respuesta.mensaje);
            this.alertaService.mostrar(
              TipoAlerta.Error,
              'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.'
            );
            return;
          }

          this.parentesco = mapearArregloTipoDropdown(
            respuesta.datos,
            'nombreParentesco',
            'idParentesco'
          );
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.alertaService.mostrar(
            TipoAlerta.Error,
            'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.'
          );
        },
      });
  }

  visualizarReciboPago(): void {
    void this.router.navigate(['recibo-de-pago', this.datosGenerales.idPagoLinea], {relativeTo: this.rutaActiva});
  }

  validarAlta(): void {
    // this.agregarBeneficiarios = true; se descomenta solo para hacer pruebas de actualziacion
    if (this.datosGeneralesRenovacion.tipoPrevision === 1) {
      if (this.beneficiarios.length < 3) {
        if (this.datosGeneralesRenovacion.periodoRenovacion === 1) {
          if (this.datosGeneralesRenovacion.titularFallecido === 0) {
            if (Number(this.datosGeneralesRenovacion.idEstatusConvenio) === 2)
              this.agregarBeneficiarios = true;
          }
        }
      }
    }
  }
}
