import {Component, OnInit, ViewChild} from '@angular/core';
import {SERVICIO_BREADCRUMB} from "../../constants/breadcrumb";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../../servicios-funerarios/constants/dummies";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";
import {EquipoVelacionInterface} from "../../models/velacion-domicilio.interface";
import {OverlayPanel} from "primeng/overlaypanel";

@Component({
  selector: 'app-generar-vale-salida',
  templateUrl: './generar-vale-salida.component.html',
  styleUrls: ['./generar-vale-salida.component.scss']
})
export class GenerarValeSalidaComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel

  confirmacion: boolean = false;
  generarValeSalidaForm!: FormGroup;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  velatorio:TipoDropdown[] = CATALOGOS_DUMMIES;
  estado:TipoDropdown[] = CATALOGOS_DUMMIES;

  equipo: EquipoVelacionInterface[] = [
    {
      nombreBienesArticulos: 'Ataud',
      cantidad: 2,
      observaciones: "No se presentan detalles, solo limpieza"
    },
    {
      nombreBienesArticulos: 'Ataud',
      cantidad: 2,
      observaciones: "No se presentan detalles, solo limpieza"
    },
    {
      nombreBienesArticulos: 'Ataud',
      cantidad: 2,
      observaciones: "No se presentan detalles, solo limpieza"
    }
  ];
  equipoSeleccionado: EquipoVelacionInterface = {};

  constructor(
    private breadcrumbService: BreadcrumbService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarForm();
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar([]);
  }

  inicializarForm(): void {
    this.generarValeSalidaForm = this.formBuilder.group({
      folioODS: [{value: null, disabled: false}, [Validators.required]],
      velatorio: [{value: null, disabled: false}, [Validators.required]],
      nombreContratante: [{value: null, disabled: false}, [Validators.required]],
      nombreFinado: [{value: null, disabled: false}, [Validators.required]],
      responsableEntrega: [{value: null, disabled: false}, [Validators.required]],
      diasNovenario: [{value: null, disabled: false}, [Validators.required]],
      fechaSalida: [{value: null, disabled: false}, [Validators.required]],
      responsableInstalacion: [{value: null, disabled: false}, [Validators.required]],
      matriculaResponsableInstalacion: [{value: null, disabled: false}, [Validators.required]],
      responsableEquipoVelacion: [{value: null, disabled: false}, [Validators.required]],
      matriculaResponsableVelacion: [{value: null, disabled: false}, [Validators.required]],
      fechaEntrada: [{value: null, disabled: false}, [Validators.required]],
      cp: [{value: null, disabled: false}, [Validators.required]],
      calle: [{value: null, disabled: false}, [Validators.required]],
      numeroExterior: [{value: null, disabled: false}, [Validators.required]],
      numeroInterior: [{value: null, disabled: false}, [Validators.required]],
      colonia: [{value: null, disabled: false}, [Validators.required]],
      municipio: [{value: null, disabled: false}, [Validators.required]],
      estado: [{value: null, disabled: false}, [Validators.required]],


    });
  }

  abrirPanel(event:MouseEvent,equipo:EquipoVelacionInterface):void{
    this.equipoSeleccionado = equipo;
    this.overlayPanel.toggle(event);
  }

  registrarSalida(): void {

  }

  aceptar(): void {

  }

  eliminarEquipoVelacion(): void {

  }

  get f() {
    return this.generarValeSalidaForm.controls;
  }

}
