import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { ActivatedRoute, Router } from "@angular/router";
import { TipoDropdown } from '../../../../models/tipo-dropdown';
import {finalize} from "rxjs/operators";
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { SolicitudesPagoService } from '../../services/solicitudes-pago.service';
import { SolicitarSolicitudPago, PartidaPresupuestal, CrearSolicitudPago } from '../../models/solicitud-pagos.interface';
import {mapearArregloTipoDropdown} from 'projects/sivimss-gui/src/app/utils/funciones';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { AlertaService , TipoAlerta} from '../../../../shared/alerta/services/alerta.service';
import {HttpErrorResponse} from "@angular/common/http";
import * as moment from "moment/moment";

@Component({
  selector: 'app-solicitar-solicitud-pago',
  templateUrl: './solicitar-solicitud-pago.component.html',
  styleUrls: ['./solicitar-solicitud-pago.component.scss']
})
export class SolicitarSolicitudPagoComponent implements OnInit {

  solicitarPagoForm!: FormGroup;
  pagoSeleccionado: any = {}
  opcion1: boolean = false;
  opcion2: boolean = false;
  opcion3: boolean = false;
  opcion4: boolean = false;
  opcion5: boolean = false;
  ShowUnidadOpe: boolean = false;
  ShowUnidadAdmi: boolean = false;
  nuevoSolicitudPago!: CrearSolicitudPago;
  

  fechaActual: Date = new Date();
  opcionesSolicitud: number = 0;
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
  ) { }

  ngOnInit(): void {
    debugger
    this.inicializarSolicitarPagoForm();
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catatalogoTipoSolicitud =  mapearArregloTipoDropdown(respuesta[this.POSICION_CATALOGO_TIPOSOLICITUD].datos, "desTipoSolicitud", "tipoSolicitud");
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

  inicializarSolicitarPagoForm(): void {
    this.solicitarPagoForm = this.formBulder.group({
      tipoSolicitud: [{ value: null, disabled: false }, [ Validators.required]],
      unidadOpe: [{value:null, disabled: false}],
      unidadAdmi: [{value:null, disabled: false}],
      fechaElaboracion1: [{ value: null, disabled: false }, [ Validators.required]],
      nomDestinatario1: [{ value: null, disabled: false }, [ Validators.required]],
      nomRemitente1: [{ value: null, disabled: false }, [ Validators.required]],
      referenciaTD1: [{ value: null, disabled: false }, [ Validators.required]],
      beneficiario1: [{ value: null, disabled: false }, [ Validators.required]],
      concepto1: [{ value: null, disabled: false }, [Validators.required, Validators.maxLength(60)]],
      importeTotal1: [{ value: null, disabled: false }, [ Validators.required]],
      cantidad1: [{ value: null, disabled: false }, [ Validators.required]],
      observ1: [{ value: null, disabled: false }, [Validators.required, Validators.maxLength(100)]],
    });
  }

  solicitarPago(): void {
    this.referencia.close(false);
  }

  cancelar(): void {
    this.referencia.close(false);
  }

  validaTipoSolicitud(): void {
    debugger
    const idTipo = this.solicitarPagoForm.get('tipoSolicitud')?.value;

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

  generarSolicitudPago(): CrearSolicitudPago {
    return {
      idTipoSolic: this.solicitarPagoForm.get("tipoSolicitud")?.value,
      cveFolioGastos: this.solicitarPagoForm.get("folioGastos")?.value,
      cveFolioConsignados: this.solicitarPagoForm.get("folioConsig")?.value,
      idUnidadMedica: this.solicitarPagoForm.get("unidadOpe3")?.value,
      idDelegacion: 1, 
      nomDestinatario: this.solicitarPagoForm.get("nombreDestinatario3")?.value,
      nomRemitente: this.solicitarPagoForm.get("nomRemitente3")?.value,
      numReferencia: this.solicitarPagoForm.get("referenciaTD3")?.value,
      idContratBenef: this.solicitarPagoForm.get("beneficiario3")?.value,
      fechaInicial: "10/07/2023",
      fechaFinal: "12/07/2023",
      concepto: this.solicitarPagoForm.get("concepto3")?.value,
      observaciones: this.solicitarPagoForm.get("observ3")?.value,
      idVelatorio: 1,
      ejercicioFiscal:2022,
      idEstatusSol: 1
    };
  }

  
  crearSolicitudPago(): void {
    this.cargadorService.activar();
    const solicitudGuardar: CrearSolicitudPago = this.generarSolicitudPago();
    this.solicitudesPagoService.guardar(solicitudGuardar).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (): void => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Solicitud de pago generada correctamente')
        void this.router.navigate(['../../'], {relativeTo: this.route});
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error, "Error al guardar la información de la solicitud de pago. Intenta nuevamente.");
      }
    });
  }

  get ref() {
    return this.solicitarPagoForm.controls;
  }

  get fa() {
    return this.solicitarPagoForm.controls;
  }

  unidad(tipo:number): void {
    if(tipo){
      this.ShowUnidadAdmi = true;
      this.ShowUnidadOpe = false;
      this.fa.unidadOpe.setValue(false);
      return;
    }
    this.fa.unidadAdmi.setValue(false);
      this.ShowUnidadAdmi = false;
      this.ShowUnidadOpe = true;

  }

}