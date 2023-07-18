import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { Router } from "@angular/router";
import { TipoDropdown } from '../../../../models/tipo-dropdown';
import { SolicitudesPagoService } from '../../services/solicitudes-pago.service';
import { SolicitarSolicitudPago, PartidaPresupuestal } from '../../models/solicitud-pagos.interface';

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
  

  fechaActual: Date = new Date();
  opcionesSolicitud: number = 0;
  partidaPresupuestal: PartidaPresupuestal [] = [];
  catalogotipoSolicitud: TipoDropdown[] = [
    {
      value: 1,
      label: 'Solicitud de bienes y servicios por comprobar',
    },
    {
      value: 2,
      label: 'Solicitud de comprobación de bienes y servicios',
    },
    {
      value: 3,
      label: 'Solicitud de reembolso de fondo fijo revolvente',
    },
    {
      value: 4,
      label: 'Solicitud de pago',
    },
    {
      value: 5,
      label: 'Solicitud de pago a consignantes',
    },
    {
      value: 6,
      label: 'Solicitud de pago por contrato',
    }
  ];

  constructor(
    private router: Router,
    public config: DynamicDialogConfig,
    private formBulder: FormBuilder,
    private readonly referencia: DynamicDialogRef,
    private balanceCajaService: SolicitudesPagoService,
  ) { }

  ngOnInit(): void {
    if (this.config?.data) {
      this.pagoSeleccionado = this.config.data.pagoSeleccionado;
    }
    this.inicializarModificarPagoForm();
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

  inicializarModificarPagoForm(): void {
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