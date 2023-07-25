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

  solicitarPagoForm1!: FormGroup;
  solicitarPagoForm2!: FormGroup;
  solicitarPagoForm3!: FormGroup;
  solicitarPagoForm4!: FormGroup;
  pagoSeleccionado: any = {}
  opcion1: boolean = false;
  opcion2: boolean = false;
  opcion3: boolean = false;
  opcion4: boolean = false;
  datosSolicitudPago!: CrearSolicitudPago;


  fechaActual: Date = new Date();
  partidaPresupuestal: PartidaPresupuestal [] = [];
  readonly POSICION_CATALOGO_TIPOSOLICITUD: number = 1;
  catatalogoTipoSolicitud: TipoDropdown[] = [];


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
    this.inicializarTipoSolicitud();
    this.inicializarSolicitarPagoForm1();
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catatalogoTipoSolicitud = mapearArregloTipoDropdown(respuesta[this.POSICION_CATALOGO_TIPOSOLICITUD].datos, "desTipoSolicitud", "tipoSolicitud");
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

  inicializarTipoSolicitud(): void {
    this.solicitudPagoForm = this.formBulder.group({
      tipoSolicitud: [{value: null, disabled: false}, [Validators.required]],
      folioFiscal: [{value: null, disabled: false}, [Validators.required]],
      fechaElaboracion: [{value: null, disabled: false}, [Validators.required]],
      unidadSeleccionada: [{value: null, disabled: false}, [Validators.required]],
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

  inicializarSolicitarPagoForm1(): void {
    this.solicitarPagoForm1 = this.formBulder.group({
      fechaElaboracion1: [{value: null, disabled: false}],
      nomDestinatario1: [{value: null, disabled: false}, [Validators.required]],
      nomRemitente1: [{value: null, disabled: false}, [Validators.required]],
      referenciaTD1: [{value: null, disabled: false}, [Validators.required]],
      beneficiario1: [{value: null, disabled: false}, [Validators.required]],
      concepto1: [{value: null, disabled: false}, [Validators.required, Validators.maxLength(60)]],
      importeTotal1: [{value: null, disabled: false}, [Validators.required]],
      cantidad1: [{value: null, disabled: false}, [Validators.required]],
      observ1: [{value: null, disabled: false}, [Validators.required, Validators.maxLength(100)]],
    });
  }

  validaTipoSolicitud(): void {
    const idTipo = this.solicitudPagoForm.get('tipoSolicitud')?.value;

    if (idTipo === 1) {
      this.opcion1 = true;
      this.opcion2 = false;
      this.opcion3 = false;
      this.opcion4 = false;
    }
    if (idTipo === 2 || idTipo === 3 || idTipo === 4) {
      this.opcion2 = true;
      this.opcion1 = false;
      this.opcion3 = false;
      this.opcion4 = false;
    }
    if (idTipo === 5) {
      this.opcion1 = false;
      this.opcion2 = false;
      this.opcion3 = true;
      this.opcion4 = false;
    }
    if (idTipo === 6) {
      this.opcion1 = false;
      this.opcion2 = false;
      this.opcion3 = false;
      this.opcion4 = true;
    }
  }

  generarSolicitudPago1(): CrearSolicitudPago {
    return {
      idTipoSolic: this.solicitudPagoForm.get('tipoSolicitud')?.value,
      cveFolioGastos: "null",
      cveFolioConsignados: "null",
      fechaElaboracion: "null",
      idUnidadMedica: 1,
      idDelegacion: 40,
      nomDestinatario: this.solicitarPagoForm1.get("nomDestinatario1")?.value,
      nomRemitente: this.solicitarPagoForm1.get("nomRemitente1")?.value,
      numReferencia: this.solicitarPagoForm1.get("referenciaTD1")?.value,
      idContratBenef: 1,
      fechaInicial: "10/07/2023",
      fechaFinal: "23/07/2023",
      beneficiario: this.solicitarPagoForm1.get("beneficiario1")?.value,
      concepto: this.solicitarPagoForm1.get("concepto1")?.value,
      observaciones: this.solicitarPagoForm1.get("observ1")?.value,
      idVelatorio: 1,
      ejercicioFiscal: 2022,
      idEstatusSol: 1
    };
  }

  generarSolicitudPago234(): CrearSolicitudPago {
    return {
      idTipoSolic: this.solicitudPagoForm.get('tipoSolicitud')?.value,
      cveFolioGastos: this.solicitarPagoForm2.get("folioGastos2")?.value,
      fechaElaboracion: this.solicitarPagoForm2.get("fechaElaboracion2")?.value,
      cveFolioConsignados: "null",
      idUnidadMedica: this.solicitarPagoForm2.get("unidadOpe2")?.value,
      idDelegacion: 40,
      nomDestinatario: this.solicitarPagoForm2.get("nombreDestinatario2")?.value,
      nomRemitente: this.solicitarPagoForm2.get("nomRemitente2")?.value,
      numReferencia: this.solicitarPagoForm2.get("referenciaTD2")?.value,
      idContratBenef: 1,
      fechaInicial: "10/07/2023",
      fechaFinal: "23/07/2023",
      beneficiario: this.solicitarPagoForm2.get("beneficiario2")?.value,
      concepto: this.solicitarPagoForm2.get("concepto2")?.value,
      observaciones: this.solicitarPagoForm2.get("observ2")?.value,
      idVelatorio: 1,
      ejercicioFiscal: 2022,
      idEstatusSol: 1
    };
  }

  generarSolicitudPago5(): CrearSolicitudPago {
    return {
      idTipoSolic: this.solicitudPagoForm.get('tipoSolicitud')?.value,
      cveFolioGastos: this.solicitarPagoForm3.get("folioGastos3")?.value,
      cveFolioConsignados: this.solicitarPagoForm3.get("folioConsig3")?.value,
      fechaElaboracion: this.solicitarPagoForm3.get("fechaElaboracion3")?.value,
      idUnidadMedica: 1,
      idDelegacion: 40,
      nomDestinatario: this.solicitarPagoForm3.get("nombreDestinatario3")?.value,
      nomRemitente: this.solicitarPagoForm3.get("nomRemitente3")?.value,
      numReferencia: this.solicitarPagoForm3.get("referenciaTD3")?.value,
      idContratBenef: this.solicitarPagoForm3.get("beneficiario3")?.value,
      fechaInicial: "10/07/2023",
      fechaFinal: "23/07/2023",
      beneficiario: "null",
      concepto: this.solicitarPagoForm3.get("concepto3")?.value,
      observaciones: this.solicitarPagoForm3.get("observ3")?.value,
      idVelatorio: 1,
      ejercicioFiscal: 2022,
      idEstatusSol: 1
    };
  }

  generarSolicitudPago6(): CrearSolicitudPago {
    return {
      idTipoSolic: this.solicitudPagoForm.get('tipoSolicitud')?.value,
      cveFolioGastos: this.solicitarPagoForm4.get("folioGastos4")?.value,
      cveFolioConsignados: this.solicitarPagoForm4.get("folioConsig4")?.value,
      fechaElaboracion: this.solicitarPagoForm4.get("fechaElaboracion4")?.value,
      idUnidadMedica: 1,
      idDelegacion: 40,
      nomDestinatario: this.solicitarPagoForm4.get("nombreDestinatario4")?.value,
      nomRemitente: this.solicitarPagoForm4.get("nomRemitente4")?.value,
      numReferencia: this.solicitarPagoForm4.get("referenciaTD4")?.value,
      idContratBenef: this.solicitarPagoForm4.get("beneficiario4")?.value,
      fechaInicial: "10/07/2023",
      fechaFinal: "23/07/2023",
      beneficiario: "null",
      concepto: this.solicitarPagoForm4.get("concepto4")?.value,
      observaciones: this.solicitarPagoForm4.get("observ4")?.value,
      idVelatorio: 1,
      ejercicioFiscal: 2022,
      idEstatusSol: 1
    };
  }

  crearSolicitudPago(): void {
    this.cargadorService.activar();
    const idTipo = this.solicitudPagoForm.get('tipoSolicitud')?.value;

    switch (idTipo) {
      case 1:
        this.datosSolicitudPago = this.generarSolicitudPago1();
        break;
      case 2:
        this.datosSolicitudPago = this.generarSolicitudPago234();
        break;
      case 3:
        this.datosSolicitudPago = this.generarSolicitudPago234();
        break;
      case 4:
        this.datosSolicitudPago = this.generarSolicitudPago234();
        break;
      case 5:
        this.datosSolicitudPago = this.generarSolicitudPago5();
        break;
      case 6:
        this.datosSolicitudPago = this.generarSolicitudPago6();
        break;
    }
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

  get ref() {
    return this.solicitarPagoForm1.controls;
  }

  get fa() {
    return this.solicitarPagoForm1.controls;
  }

  cancelar(): void {
    this.referencia.close(false);
  }

  get tipoSolicitud(): number {
    return this.solicitudPagoForm.get('tipoSolicitud')?.value
  }

}
