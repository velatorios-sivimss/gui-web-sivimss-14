import {Component, OnInit, ViewChild} from '@angular/core';
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {OverlayPanel} from "primeng/overlaypanel";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";
import {FormBuilder, FormGroup} from "@angular/forms";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {SERVICIO_BREADCRUMB} from "../../constants/breadcrumb";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../../servicios/constants/dummies";
import {OperadoresPorVelatorio} from "../../models/operadores-por-velatorio.interface";
import {LazyLoadEvent} from "primeng/api";
import {
  AgregarOperadoresPorVelatorioComponent
} from "../agregar-operadores-por-velatorio/agregar-operadores-por-velatorio.component";
import {
  DetalleOperadoresPorVelatorioComponent
} from "../detalle-operadores-por-velatorio/detalle-operadores-por-velatorio.component";
import {
  ModificarOperadoresPorVelatorioComponent
} from "../modificar-operadores-por-velatorio/modificar-operadores-por-velatorio.component";

@Component({
  selector: 'app-operadores-por-velatorio',
  templateUrl: './operadores-por-velatorio.component.html',
  styleUrls: ['./operadores-por-velatorio.component.scss'],
  providers: [DialogService]
})
export class OperadoresPorVelatorioComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  filtroForm!: FormGroup;

  operadoresPorVelatorio: OperadoresPorVelatorio[] = [];
  operadorSeleccionado:OperadoresPorVelatorio={};

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  nivel:TipoDropdown[] = CATALOGOS_DUMMIES;
  delegacion:TipoDropdown[] = CATALOGOS_DUMMIES;
  velatorio:TipoDropdown[] = CATALOGOS_DUMMIES;

  creacionRef!: DynamicDialogRef;
  modificarRef!: DynamicDialogRef;
  detalleRef!: DynamicDialogRef;
  estatusRef!: DynamicDialogRef;

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
    /*Cambiar la imagen de Administración de catálogos*/
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
  }

  inicializarFiltroForm(): void{
    this.filtroForm = this.formBuilder.group({
      nivel:[{value: null, disabled:false}],
      delegacion:[{value: null, disabled:false}],
      velatorio:[{value: null, disabled:false}],
      operador:[{value: null, disabled:false}]
    });
  }
  consultaOperadorEspecifico(): string{
    return "";
  }

  abrirModalAgregarOperador(): void {
    this.creacionRef = this.dialogService.open(AgregarOperadoresPorVelatorioComponent, {
      header: "Agregar operador",
      width:"920px",
    });

    this.creacionRef.onClose.subscribe((estatus:boolean) => {
      if(estatus){
        this.alertaService.mostrar(TipoAlerta.Exito, 'Operador agregado correctamente');
      }
    });
  }

  abrirModalModificarOperador():void {
    this.modificarRef = this.dialogService.open(ModificarOperadoresPorVelatorioComponent, {
      header: "Modificar operador",
      width:"920px",
      data:this.operadorSeleccionado,
    });

    this.modificarRef.onClose.subscribe((estatus:boolean) => {
      if(estatus){
        this.alertaService.mostrar(TipoAlerta.Exito, 'Operador modificado correctamente');
      }
    })
  }

  abrirModalDetalleOperador(operadorSeleccionado: OperadoresPorVelatorio):void{
    this.detalleRef = this.dialogService.open(DetalleOperadoresPorVelatorioComponent, {
      header: "Ver detalle",
      width:"920px",
      data: {operador: operadorSeleccionado, origen: "detalle"}
    });
  }

  abrirModalEstatusOperador(operador: OperadoresPorVelatorio):void {
    this.estatusRef = this.dialogService.open(DetalleOperadoresPorVelatorioComponent, {
      header: operador.estatus?"Activar operador": "Desactivar operador",
      width:"920px",
      data: {operador: operador, origen: operador.estatus?"activar": "desactivar"}
    });

    this.estatusRef.onClose.subscribe((operador:OperadoresPorVelatorio) => {
      if(operador.estatus){
        this.alertaService.mostrar(TipoAlerta.Exito, 'Operador activado correctamente');
      }else{
        this.alertaService.mostrar(TipoAlerta.Exito, 'Operador desactivado correctamente');
      }
    });
  }

  limpiar(): void {
    this.filtroForm.reset();
  }

  get f(){
    return this.filtroForm.controls;
  }

  paginar(event:LazyLoadEvent): void {
    console.log(event);
    setTimeout(() => {
      this.operadoresPorVelatorio = [
        {
          id: 1,
          curp: "GJUE856425GJVMMB89",
          nombre: "Juan",
          primerApellido: "Farias",
          segundoApellido: "Robles",
          numeroEmpleado: "SO12KJ333",
          fechaNaciemiento: "26/05/1999",
          fechaIngreso: "09/03/2023",
          fechaBaja: "09/03/2023",
          sueldoBase: 9000,
          velatorio:1,
          descVelatorio:"Velatorio",
          descDiasDescanso:this.devolverDiasDescanso([0,1,2]),
          descAntiguedad:this.devolverAntiguedad(9),
          correoElectronico: "fariasrobles1@gmail.com",
          puesto:"Consejero",
          estatus:true
        },
        {
          id: 2,
          curp: "GJUE856425GJVMMB89",
          nombre: "Juan",
          primerApellido: "Farias",
          segundoApellido: "Robles",
          numeroEmpleado: "SO12KJ333",
          fechaNaciemiento: "26/05/1999",
          fechaIngreso: "09/03/2023",
          fechaBaja: "",
          sueldoBase: 9000,
          descVelatorio:"Velatorio",
          descDiasDescanso:this.devolverDiasDescanso([1]),
          descAntiguedad:this.devolverAntiguedad(18),
          correoElectronico: "fariasrobles1@gmail.com",
          puesto:"Consejero",
          estatus:true
        },
        {
          id: 3,
          curp: "GJUE856425GJVMMB89",
          nombre: "Juan",
          primerApellido: "Farias",
          segundoApellido: "Robles",
          matricula:123456789,
          fechaNaciemiento: "26/05/1999",
          fechaIngreso: "09/03/2023",
          fechaBaja: "",
          sueldoBase: 9000,
          descVelatorio:"Velatorio",
          descDiasDescanso:this.devolverDiasDescanso([4,6]),
          descAntiguedad:this.devolverAntiguedad(27),
          correoElectronico: "fariasrobles1@gmail.com",
          puesto:"Consejero",
          estatus:false
        },
        {
          id: 4,
          curp: "GJUE856425GJVMMB89",
          nombre: "Juan",
          primerApellido: "Farias",
          segundoApellido: "Robles",
          matricula:123456789,
          fechaNaciemiento: "26/05/1999",
          fechaIngreso: "09/03/2023",
          fechaBaja: "",
          sueldoBase: 9000,
          descVelatorio:"Velatorio",
          descDiasDescanso:this.devolverDiasDescanso([0,1,2,3,4]),
          descAntiguedad:this.devolverAntiguedad(1),
          correoElectronico: "fariasrobles1@gmail.com",
          puesto:"Consejero",
          estatus:false
        }
      ];
    this.totalElementos = this.operadoresPorVelatorio.length;

    },0);
  }

  devolverDiasDescanso(dias:number[]):string{
    let descripcionDias:string = "";
    dias.length>1?descripcionDias="días de descanso":descripcionDias="día de descanso";
    return `${dias.length} ${descripcionDias}`;
  }

  devolverAntiguedad(meses:number): string {
    let descripcionMeses: string = "";
    let descripcionAnios: string = "";
    let numAnio:number;
    if(meses < 12){
        meses>1?descripcionMeses="meses":descripcionMeses="mes";
        return `${meses} ${descripcionMeses}`;
    }else{
      meses < 24 ? descripcionAnios = "año" : descripcionAnios = "años";
      numAnio = Math.trunc(meses / 12);
      return `${numAnio} ${descripcionAnios}`;
    }
  }

  abrirPanel(event: MouseEvent, operadorSeleccionado: OperadoresPorVelatorio):void {
    this.operadorSeleccionado = operadorSeleccionado;
    this.overlayPanel.toggle(event);
  }
}
