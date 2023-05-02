import { Component, OnInit } from '@angular/core';
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {MenuItem} from "primeng/api";
import {MENU_STEPPER} from "../../constants/menu-steppers";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../../articulos/constants/dummies";
import {AtaudDonado, FinadoInterface, RespuestaFinado} from "../../models/consulta-donaciones-interface";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {AgregarFinadoComponent} from "./agregar-finado/agregar-finado.component";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";
import {AgregarAtaudComponent} from "./agregar-ataud/agregar-ataud.component";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-control-salida-donaciones',
  templateUrl: './control-salida-donaciones.component.html',
  styleUrls: ['./control-salida-donaciones.component.scss'],
  providers: [DialogService]
})
export class ControlSalidaDonacionesComponent implements OnInit {

  agregarFinadoRef!: DynamicDialogRef;
  agregarAtaudRef!: DynamicDialogRef;

  menuStep: MenuItem[] = MENU_STEPPER;
  indice: number = 0;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  sexo: TipoDropdown[] = CATALOGOS_DUMMIES;
  nacionalidad: TipoDropdown[] = CATALOGOS_DUMMIES;
  estado: TipoDropdown[] = CATALOGOS_DUMMIES;
  finados: FinadoInterface[] = [];
  ataudes: AtaudDonado[] = [];

  formDatosSolicitante!: FormGroup;
  formAtaudes!: FormGroup;


  constructor(
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarDatosSolicitantesForm();
    this.inicializarAtaudesForm();

  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar([]);
  }

  inicializarDatosSolicitantesForm(): void {
    this.formDatosSolicitante = this.formBuilder.group({
      nombre: [{value:null,disabled: false}, [Validators.required]],
      primerApellido: [{value:null,disabled: false}, [Validators.required]],
      segundoApellido: [{value:null,disabled: false}, [Validators.required]],
      curp: [{value:null,disabled: false}, [Validators.required]],
      rfc: [{value:null,disabled: false}],
      fechaNacimiento: [{value:null,disabled: false}, [Validators.required]],
      sexo: [{value:null,disabled: false}, [Validators.required]],
      nacionalidad: [{value:null,disabled: false}],
      telefono: [{value:null,disabled: false}, [Validators.required]],
      correoElectronico: [{value:null,disabled: false}, [Validators.required]],
      calle: [{value:null,disabled: false}, [Validators.required]],
      cp: [{value:null,disabled: false}, [Validators.required]],
      numeroExterior: [{value:null,disabled: false}, [Validators.required]],
      numeroInterior: [{value:null,disabled: false}],
      colonia: [{value:null,disabled: false}, [Validators.required]],
      municipio: [{value:null,disabled: false}, [Validators.required]],
      estado: [{value:null,disabled: false}, [Validators.required]],
      nombreInstitucion: [{value:null,disabled: false}]
    });
  }

  inicializarAtaudesForm(): void {
    this.formAtaudes = this.formBuilder.group({
      otorgamiento: [{value:null, disabled: false}],
      fechaSolicitud: [{value:null, disabled: false}, [Validators.required]],
      responsableAlmacen: [{value:null, disabled: false}, [Validators.required]],
      matriculaResponsable: [{value:null, disabled: false}, [Validators.required]]
    });
  }

  abrirModalFinado(): void {
    this.agregarFinadoRef = this.dialogService.open(AgregarFinadoComponent, {
      header: 'Agregar finado',
      width:"920px"
    })

    this.agregarFinadoRef.onClose.subscribe((finado: RespuestaFinado) => {
      if(finado.finado != null){
        this.finados.push(finado.finado);
      }
    });
  }

  abrirModalAtaud(): void {
    this.agregarAtaudRef = this.dialogService.open(AgregarAtaudComponent, {
      header: 'Agregar ataúd',
      width:"920px"
    })

    this.agregarAtaudRef.onClose.subscribe((ataud:AtaudDonado) => {
      if(ataud){
        this.ataudes.push(ataud);
      }
    })
  }

  aceptar(): void {
    this.alertaService.mostrar(TipoAlerta.Exito, 'Se ha registrado correctamente el registro de salida de ataúdes de donación. ');
    this.router.navigate(["consulta-donaciones"]);
  }

  siguiente(): void {
    this.indice ++;
  }

  regresar(): void {
    this.indice --;
  }

  get fds() {
    return this.formDatosSolicitante.controls;
  }

  get fa() {
    return this.formAtaudes.controls;
  }
}
