import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {ActivatedRoute, Router} from "@angular/router";
import {TipoDropdown} from '../../../../models/tipo-dropdown';
import {finalize} from "rxjs/operators";
import {LoaderService} from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import {SolicitudesPagoService} from '../../services/solicitudes-pago.service';
import {PartidaPresupuestal, CrearSolicitudPago} from '../../models/solicitud-pagos.interface';
import {mapearArregloTipoDropdown} from 'projects/sivimss-gui/src/app/utils/funciones';
import {MensajesSistemaService} from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import {AlertaService, TipoAlerta} from '../../../../shared/alerta/services/alerta.service';
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-solicitar-solicitud-pago',
  templateUrl: './solicitar-solicitud-pago.component.html',
  styleUrls: ['./solicitar-solicitud-pago.component.scss']
})
export class SolicitarSolicitudPagoComponent implements OnInit {

  solicitudPagoForm!: FormGroup;
  catatalogoTipoSolicitud: TipoDropdown[] = [];


  pagoSeleccionado: any = {}
  datosSolicitudPago!: CrearSolicitudPago;
  fechaActual: Date = new Date();
  partidaPresupuestal: PartidaPresupuestal [] = [];
  readonly POSICION_CATALOGO_TIPOSOLICITUD: number = 1;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public config: DynamicDialogConfig,
    private cargadorService: LoaderService,
    private formBulder: FormBuilder,
    private readonly referencia: DynamicDialogRef,
    private solicitudesPagoService: SolicitudesPagoService,
    private mensajesSistemaService: MensajesSistemaService,
    private alertaService: AlertaService
  ) {
  }

  ngOnInit(): void {
    this.obtenerCatalogos();
    this.inicializarTipoSolicitud();
    this.partidaPresupuestal = [
      {
        idPartida: 1,
        partidaPresupuestal: 'Solicitud de comprobación de bienes y servicios',
        cuentasContables: '000001',
        importeTotal: '000001',
      },
      {
        idPartida: 2,
        partidaPresupuestal: 'Solicitud de comprobación de bienes y servicios',
        cuentasContables: '000001',
        importeTotal: '000001',
      }
    ];
  }

  obtenerCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    const catalogoTipoSolicitud = respuesta[this.POSICION_CATALOGO_TIPOSOLICITUD];
    this.catatalogoTipoSolicitud = mapearArregloTipoDropdown(catalogoTipoSolicitud.datos, "desTipoSolicitud", "tipoSolicitud");
  }

  inicializarTipoSolicitud(): void {
    this.solicitudPagoForm = this.formBulder.group({
      tipoSolicitud: [{value: null, disabled: false}, [Validators.required]],
      folioFiscal: [{value: null, disabled: false}, [Validators.required]],
      fechaElaboracion: [{value: null, disabled: false}, [Validators.required]],
      unidadSeleccionada: [{value: 1, disabled: false}, [Validators.required]],
      referenciaUnidad: [{value: null, disabled: true}],
      solicitadoPor: [{value: null, disabled: true}],
      nombreDestinatario: [{value: null, disabled: false}, [Validators.required]],
      nomRemitente: [{value: null, disabled: false}, [Validators.required]],
      referenciaTD: [{value: null, disabled: true}],
      beneficiario: [{value: null, disabled: false}, [Validators.required]],
      concepto: [{value: null, disabled: false}, [Validators.required]],
      cantidadLetra: [{value: null, disabled: true}],
      observaciones: [{value: null, disabled: false}, [Validators.required]],
      numeroContrato: [{value: null, disabled: false}, [Validators.required]],
      banco: [{value: null, disabled: false}, [Validators.required]],
      cuenta: [{value: null, disabled: false}, [Validators.required]],
      claveBancaria: [{value: null, disabled: false}, [Validators.required]],
      fechaInicial: [{value: null, disabled: false}, [Validators.required]],
      fechaFinal: [{value: null, disabled: false}, [Validators.required]],
    });
  }

  crearSolicitudPago(): void {
    this.cargadorService.activar();
    const idTipo = this.solicitudPagoForm.get('tipoSolicitud')?.value;
    this.solicitudesPagoService.guardar(this.datosSolicitudPago).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (): void => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Solicitud de pago generada correctamente')
        this.referencia.close(false);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error, "Error al guardar la información de la solicitud de pago. Intenta nuevamente.");
      }
    });
  }

  cancelar(): void {
    this.referencia.close(false);
  }

  get tipoSolicitud(): number {
    return this.solicitudPagoForm.get('tipoSolicitud')?.value
  }

}
