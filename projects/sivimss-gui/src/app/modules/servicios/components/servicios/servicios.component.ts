import { Component, OnInit, ViewChild } from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";

import {DynamicDialogRef,DialogService} from "primeng/dynamicdialog";
import { LazyLoadEvent } from "primeng/api";
import {OverlayPanel} from "primeng/overlaypanel";

import {AlertaService,TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";

import {Servicio} from "../../models/servicio.interface";

import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";
import {TipoDropdown} from "../../../../models/tipo-dropdown";

import {CATALOGOS_DUMMIES} from "../../constants/dummies";
import {SERVICIO_BREADCRUMB} from "../../constants/breadcrumb";

import {AgregarServicioComponent} from "../agregar-servicio/agregar-servicio.component";
import {DetalleServicioComponent} from "../detalle-servicio/detalle-servicio.component";
import {ModificarServicioComponent} from "../modificar-servicio/modificar-servicio.component";


@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.component.html',
  styleUrls: ['./servicios.component.scss'],
  providers: [DialogService]
})
export class ServiciosComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;


  servicios:Servicio[] = [];
  servicioSeleccionado:Servicio = {};

  filtroForm!: FormGroup;

    creacionRef!: DynamicDialogRef;

  opciones:TipoDropdown[] = CATALOGOS_DUMMIES;
  tipoServicio:TipoDropdown[] = CATALOGOS_DUMMIES;
  partidaPresupuestal: TipoDropdown[] = CATALOGOS_DUMMIES;
  cuentaContable: TipoDropdown[] = CATALOGOS_DUMMIES;
  niveles: TipoDropdown[] = CATALOGOS_DUMMIES;
  velatorios: TipoDropdown[] = CATALOGOS_DUMMIES;

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
  ) { }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarFiltroForm();
  }

  actualizarBreadcrumb(): void{
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
  }

  inicializarFiltroForm(){
    this.filtroForm = this.formBuilder.group({
      nivel:[{value: null, disabled:false}],
      velatorio:[{value: null, disabled:false}],
      servicio:[{value: null, disabled:false}],
    });
  }

  abrirModalAgregarServicio(): void {
    this.creacionRef = this.dialogService.open(AgregarServicioComponent,{
      header:"Agregar servicio",
      width:"920px"
    });
    this.creacionRef.onClose.subscribe((estatus:boolean) => {
      if(estatus){
        this.alertaService.mostrar(TipoAlerta.Exito, 'Servicio agregado correctamente');
      }
    })
  }

  abrirModalModificarServicio(): void {
    this.creacionRef = this.dialogService.open(ModificarServicioComponent, {
      header:"Modificar servicio",
      width:"920px",
    })

    this.creacionRef.onClose.subscribe((estatus:boolean) => {
      if(estatus){
        this.alertaService.mostrar(TipoAlerta.Exito, 'Servicio modificado correctamente');
      }
    })
  }

  abrirModalDetalleCapilla(servicio:Servicio){
    this.creacionRef = this.dialogService.open(DetalleServicioComponent, {
      header:"Detalle",
      width:"920px",
      data: {servicio:servicio, origen: "detalle"},
    })
  }

  abrirModalCambioEstatus(servicio:Servicio){
    /*Preguntar si se puede usar 'let'*/
    let header:string;
    servicio.estatus?header="Activar servicio":header="Desactivar servicio";
    this.creacionRef = this.dialogService.open(DetalleServicioComponent, {
      header:header,
      width:"920px",
      data: {servicio:servicio, origen: "estatus"},
    })

    this.creacionRef.onClose.subscribe((servicio:Servicio) => {
      if(servicio.estatus){
        this.alertaService.mostrar(TipoAlerta.Exito, 'Servicio activado correctamente');
      }else{
        this.alertaService.mostrar(TipoAlerta.Exito, 'Servicio desactivado correctamente');
      }
    })

  }

  abrirPanel(event:MouseEvent,servicioSeleccionado:Servicio):void{
    this.servicioSeleccionado = servicioSeleccionado;
    this.overlayPanel.toggle(event);
  }

  paginar(event: LazyLoadEvent): void{
    setTimeout(() =>{
      this.servicios = [
        {
          id: 11111111,
          servicio: "Transporte de ataúdes",
          descripcionServicio: "Transporte de ataúdes en la totalidad del terriotorio nacional Mexicano",
          tipoServicio: 1,
          descTipoServicio : this.tipoServicio[0].label,
          partidaPresupuestal: 1,
          descPartidaPresupuestal: this.partidaPresupuestal[0].label,
          cuentaContable: 1,
          descCuentaContable: this.cuentaContable[0].label,
          observaciones: "Sin observaciones",
          claveSAT:"111111",
          estatus: true,
        },
        {
          id: 22222222,
          servicio: "Transporte de ataúdes",
          descripcionServicio: "Transporte de ataúdes en la totalidad del terriotorio nacional Mexicano",
          tipoServicio: 1,
          descTipoServicio : this.tipoServicio[1].label,
          partidaPresupuestal: 1,
          descPartidaPresupuestal: this.partidaPresupuestal[1].label,
          cuentaContable: 1,
          descCuentaContable: this.cuentaContable[1].label,
          observaciones: "Sin observaciones",
          claveSAT:"2222",
          estatus: true,
        },
        {
          id: 33333333,
          servicio: "Transporte de ataúdes",
          descripcionServicio: "Transporte de ataúdes en la totalidad del terriotorio nacional Mexicano",
          tipoServicio: 1,
          descTipoServicio : this.tipoServicio[2].label,
          partidaPresupuestal: 1,
          descPartidaPresupuestal: this.partidaPresupuestal[2].label,
          cuentaContable: 1,
          descCuentaContable: this.cuentaContable[2].label,
          observaciones: "Sin observaciones",
          claveSAT:"3333",
          estatus: false,
        }
      ];
      this.totalElementos = this.servicios.length;
    },0)
  }

  consultaServicioEspecifico():string{
    return "";
  }

  limpiar(): void {
    this.filtroForm.reset();
  }

  get f(){
    return this.filtroForm?.controls;
  }
}
