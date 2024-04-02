import {Component, OnInit, Renderer2} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogService} from 'primeng/dynamicdialog';
import {finalize} from 'rxjs';
import {
  ContratarPSFPAService
} from '../../../mapa-contratar-plan-servicios-funerarios-pago-anticipado/services/contratar-psfpa.service';
import {AlertaService, TipoAlerta} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {LoaderService} from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {HttpErrorResponse} from '@angular/common/http';
import {DetalleServicioFunerario, PagoSFPA, TitularesBeneficiarios} from '../../models/consulta-plan-sfpa.interface';
import {DescargaArchivosService} from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import {OpcionesArchivos} from 'projects/sivimss-gui/src/app/models/opciones-archivos.interface';
import {TransaccionPago} from '../../../../models/transaccion-pago.interface';
import {SolicitudPagos} from '../../../../models/solicitud-pagos.interface';
import {
  BusquedaConveniosPFServic
} from '../../../consulta-convenio-prevision-funeraria/services/busqueda-convenios-pf.service';
import * as moment from 'moment';
import {GestorCredencialesService} from "../../../../../../services/gestor-credenciales.service";
import {diferenciaUTC, obtenerFechaYHoraActualPagos} from "../../../../../../utils/funciones";

@Component({
  selector: 'app-mi-plan-servicios-funerarios-pago-anticipado',
  templateUrl: './mi-plan-servicios-funerarios-pago-anticipado.component.html',
  styleUrls: ['./mi-plan-servicios-funerarios-pago-anticipado.component.scss'],
  providers: [DescargaArchivosService, GestorCredencialesService]
})
export class MiPlanServiciosFunerariosPagoAnticipadoComponent implements OnInit {
  readonly ESTATUS_POR_PAGAR: number = 8;
  beneficiarios: TitularesBeneficiarios[] = [];
  titular!: TitularesBeneficiarios;
  titularSubstituto!: TitularesBeneficiarios;
  detalleServicioFunerario!: DetalleServicioFunerario;
  idPlanSfpa: number | undefined;
  registroPagar!: PagoSFPA;
  mostrarBtnRealizarPago: boolean = false;
  transaccion!: any;
  idVelatorio: string = '';
  velatorio: string = '';

  constructor(
    private dialogService: DialogService,
    private rutaActiva: ActivatedRoute,
    private contratarPSFPAService: ContratarPSFPAService,
    private alertaService: AlertaService,
    private loaderService: LoaderService,
    private descargaArchivosService: DescargaArchivosService,
    private renderer: Renderer2,
    private router: Router,
    private consultaConveniosService: BusquedaConveniosPFServic,
    private gestorCredencialesService: GestorCredencialesService
  ) {
  }

  ngOnInit(): void {
    this.detalleConvenio();
    this.gestorCredencialesService.obtenerToken().subscribe({
      next: (respuesta) => this.procesarToken(respuesta)
    });
  }

  cargarScript(callback: () => void): void {
    const elementoId: string = 'realizar-pago';
    if (!document.getElementById(elementoId)) {
      const body: HTMLElement = document.body;
      const elemento_ref = this.renderer.createElement('script');
      elemento_ref.type = 'text/javascript';
      elemento_ref.src = '../../../../../../assets/js/control-pagos.js';
      elemento_ref.id = elementoId;
      elemento_ref.async = true;
      elemento_ref.defer = true;
      this.renderer.appendChild(body, elemento_ref);
      elemento_ref.onload = callback;
    } else {
      callback();
    }
  }

  procesarToken(respuesta: HttpRespuesta<any>): void {
    const [credenciales] = respuesta.datos;
    this.cargarScript(() => {});
    const velatorio: string = this.detalleServicioFunerario.desIdVelatorio || '';
    const idVelatorio: number = this.detalleServicioFunerario.idVelatorio || 0;
    this.transaccion = {
      referencia: 'Mensualidad que se pagó del plan SFPA',
      monto: null,
      mode: credenciales.mode,
      code: credenciales.code,
      key: credenciales.key,
      folio: `${idVelatorio}_${velatorio}_${obtenerFechaYHoraActualPagos()}`
    };
    this.subscripcionMotorPagos();
  }

  realizarPago(): void {
    this.transaccion.monto = this.registroPagar.importeAcumulado;
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

    let nombreTitular = `${this.titular.nomPersona} ${this.titular.primerApellido} ${this.titular.segundoApellido}`;

    return {
      fecTransaccion: pago.transaction.payment_date,
      folio: this.detalleServicioFunerario.numFolioPlanSFPA ?? '',
      folioPago: "TEST-1",
      idFlujoPagos: 4,
      idMetodoPago, // debito o credito payment_method_type
      idRegistro: this.detalleServicioFunerario.idPlanSfpa ? +this.detalleServicioFunerario.idPlanSfpa : null,
      idVelatorio: this.detalleServicioFunerario.idVelatorio ?? null,
      importe: this.registroPagar.importeAcumulado === 0 ? this.registroPagar.importeMensual : this.registroPagar.importeAcumulado,
      nomContratante: nombreTitular,
      nomTitular: nombreTitular,
      numAprobacion: pago.transaction.authorization_code,
      numTarjeta: pago.card.number,
      referencia: pago.transaction.id,
      idPagoSFPA: this.registroPagar.idPagoSFPA,
      refPago: 'Mensualidad que se pagó del plan SFPA'
    }
  }

  detalleConvenio() {
    this.idPlanSfpa = this.rutaActiva.snapshot.queryParams.idPlanSfpa;
    if (this.idPlanSfpa) {
      this.loaderService.activar();
      this.contratarPSFPAService
        .obtenerDetalle(+this.idPlanSfpa)
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
              this.detalleServicioFunerario = respuesta.datos || {};
              this.titular = this.detalleServicioFunerario.titularesBeneficiarios[0];

              this.titularSubstituto =
                this.detalleServicioFunerario.indTitularSubstituto === 1
                  ? this.titular
                  : this.detalleServicioFunerario.titularesBeneficiarios[1];

              let beneficiario1 =
                this.detalleServicioFunerario.indTitularSubstituto === 1
                  ? this.detalleServicioFunerario?.titularesBeneficiarios[1]
                  : this.detalleServicioFunerario?.titularesBeneficiarios[2];

              let beneficiario2 =
                this.detalleServicioFunerario.indTitularSubstituto === 1
                  ? this.detalleServicioFunerario?.titularesBeneficiarios[2]
                  : this.detalleServicioFunerario?.titularesBeneficiarios[3];

              if (beneficiario1) this.beneficiarios.push(beneficiario1);
              if (beneficiario2) this.beneficiarios.push(beneficiario2);

              this.detalleServicioFunerario.pagoSFPA.forEach((item: PagoSFPA) => {
                if (!item.fechaParcialidad) return;
                const fechaParcialidad = new Date(diferenciaUTC(item.fechaParcialidad, '/'))
                if (moment().isSame(moment(fechaParcialidad, 'DD/MM/YYYY'), 'day') && item.idEstatus === this.ESTATUS_POR_PAGAR) {
                  this.registroPagar = item;
                  this.mostrarBtnRealizarPago = true;
                }
              });
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
  }

  verContrato(): void {
    if (this.idPlanSfpa) {
      const configuracionArchivo: OpcionesArchivos = {};
      this.loaderService.activar();
      this.contratarPSFPAService
        .verContrato(+this.idPlanSfpa)
        .pipe(finalize(() => this.loaderService.desactivar()))
        .subscribe({
          next: (respuesta: HttpRespuesta<any>) => {
            const file = new Blob(
              [this.descargaArchivosService.base64_2Blob(
                respuesta.datos,
                this.descargaArchivosService.obtenerContentType(configuracionArchivo))],
              {type: this.descargaArchivosService.obtenerContentType(configuracionArchivo)});
            const url = window.URL.createObjectURL(file);
            window.open(url);
          },
          error: (error: HttpErrorResponse) => {
            console.error(error);
          },
        });
    }
  }
}
