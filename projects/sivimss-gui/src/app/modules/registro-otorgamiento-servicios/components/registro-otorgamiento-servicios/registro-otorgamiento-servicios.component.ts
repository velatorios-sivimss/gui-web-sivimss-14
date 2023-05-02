import {Component, OnInit, ViewChild} from '@angular/core';
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {OverlayPanel} from "primeng/overlaypanel";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";

import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {SERVICIO_BREADCRUMB} from "../../constants/breadcrumb";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {RegistroOtorgamientoServicios} from "../../models/registro-otorgamiento-servicios-interface";
import {LazyLoadEvent} from "primeng/api";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {
  DetalleRegistroOtorgamientoServiciosComponent
} from "../detalle-registro-otorgamiento-servicios/detalle-registro-otorgamiento-servicios.component";
import {
  AgregarRegistroOtorgamientoServiciosComponent
} from "../agregar-registro-otorgamiento-servicios/agregar-registro-otorgamiento-servicios.component";

@Component({
  selector: 'app-registro-otorgamiento-servicios',
  templateUrl: './registro-otorgamiento-servicios.component.html',
  styleUrls: ['./registro-otorgamiento-servicios.component.scss'],
  providers: [DialogService]
})
export class RegistroOtorgamientoServiciosComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  filtroForm!: FormGroup;

  mostrarRegistros:boolean = false;
  registroOtorgamientoServicios: RegistroOtorgamientoServicios[]=[];
  registroOtorgamientoSeleccionado: RegistroOtorgamientoServicios = {};

  otorgamientoServicioRef!: DynamicDialogRef;
  situarServicioRef!: DynamicDialogRef;

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private alertaService: AlertaService,
  ) { }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarFiltroForm();
  }

  actualizarBreadcrumb(): void{
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
  }

  inicializarFiltroForm():void {
    this.filtroForm = this.formBuilder.group({
      folioODS:[{value: null, disabled:false},[Validators.required]]
    });
  }

  consultaOtorgamientoServicios(): void {
    this.paginar({first:0});
  }

  paginar(event: LazyLoadEvent): void{
    this.mostrarRegistros = true;
    console.log(event);
    setTimeout(()=>{
      this.registroOtorgamientoServicios = [
        {
          tipoServicio:1,
          descTipoServicio: "Desc tipo servicio",
          certificadoCremacion: true,
          fecha:"2022/02/02",
          hora:"11:12",
          notasServicio:"Nota de servicio"
        }
      ];
    },0);
  }

  abrirModalSituarServicios(): void{
    this.situarServicioRef = this.dialogService.open(AgregarRegistroOtorgamientoServiciosComponent,{
      header:"Otorgamiento de un servicio",
      width:"920px"
    });
    this.situarServicioRef.onClose.subscribe((estatus:boolean) => {
      if (estatus) {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Otorgamiento del servicio registrado correctamente');
      }
    })

  }

  abrirModalQuitarServicio(): void{
    this.otorgamientoServicioRef = this.dialogService.open(DetalleRegistroOtorgamientoServiciosComponent,{
      header:"Quitar servicio",
      width:"920px",
      data:this.registroOtorgamientoSeleccionado
    })

    this.otorgamientoServicioRef.onClose.subscribe((estatus:boolean) => {
      if (estatus) {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Servicio eliminado correctamente');
      }
    })
  }

  abrirPanel(event:MouseEvent,registroOtorgamientoServicios:RegistroOtorgamientoServicios):void{
    this.registroOtorgamientoSeleccionado = registroOtorgamientoServicios;
    this.overlayPanel.toggle(event);
  }

  limpiar(): void {
    this.filtroForm.reset();
    this.mostrarRegistros = false;
  }

  get f(){
    return this.filtroForm?.controls;
  }

}
