import {Component, OnInit, ViewChild} from '@angular/core';
import {OverlayPanel} from "primeng/overlaypanel";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";
import {FormBuilder, FormGroup} from "@angular/forms";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {SERVICIO_BREADCRUMB} from "../../constants/breadcrumb";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {ConfirmarContratante, UsuarioContratante} from "../../models/usuario-contratante.interface";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../constants/dummies";
import {LazyLoadEvent} from "primeng/api";
import {DetalleContratantesComponent} from "../detalle-contratantes/detalle-contratantes.component";
import {ModificarContratantesComponent} from "../modificar-contratantes/modificar-contratantes.component";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {ALERTA_ESTATUS} from "../../constants/alertas";

@Component({
  selector: 'app-contratantes',
  templateUrl: './contratantes.component.html',
  styleUrls: ['./contratantes.component.scss'],
  providers: [DialogService]
})
export class ContratantesComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  filtroForm!: FormGroup;

  contratante: UsuarioContratante[] = [];
  contratanteSeleccionado: UsuarioContratante = {};

  alertaEstatus: string[] = ALERTA_ESTATUS;

  modificarRef!: DynamicDialogRef;
  detalleRef!: DynamicDialogRef;
  retorno:ConfirmarContratante = {};

  estatus:TipoDropdown[] = CATALOGOS_DUMMIES;

  constructor(
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarFiltroForm();
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(SERVICIO_BREADCRUMB);
  }

  inicializarFiltroForm(): void {
    this.filtroForm = this.formBuilder.group({
      curp:[{value: null, disabled:false}],
      nss:[{value: null, disabled:false}],
      nombre:[{value: null, disabled:false}],
      estatus:[{value: null, disabled:false}]
    });
  }

  paginar(event: LazyLoadEvent): void {
    setTimeout(()=> {
      this.contratante = [
        {
          curp: "FEMB121070HDFNCD00",
          nss: 727956804078700,
          nombre: "Federico Miguel",
          primerApellido: "Alameda",
          segundoApellido: "Barcenas",
          rfc:"FEMAL12107034Y",
          fechaNacimiento:"12/10/1970",
          telefono: 5514236758,
          nacionalidad:1,
          lugarNacimiento:"CDMX",
          cp:12345,
          calle:"Miguel Alemán Barcenas",
          numeroExterior:"121",
          numeroInterior:"2b",
          colonia:"Miguel Hidalgo",
          pais:1,
          correoElectronico:"hildalore1234@gmail.com",
          estado:"CDMX",
          municipio:"Azcapotzalco",
          estatus: true
        },
        {
          curp: "FEMB121070HDFNCD00",
          nss: 727956804078700,
          nombre: "Federico Miguel",
          primerApellido: "Alameda",
          segundoApellido: "Barcenas",
          rfc:"FEMAL12107034Y",
          fechaNacimiento:"12/10/1970",
          telefono: 5645768950,
          estatus: true
        },
        {
          curp: "FEMB121070HDFNCD00",
          nss: 727956804078700,
          nombre: "Federico Miguel",
          primerApellido: "Alameda",
          segundoApellido: "Barcenas",
          rfc:"FEMAL12107034Y",
          fechaNacimiento:"12/10/1970",
          telefono: 5645768950,
          estatus: false
        }
      ];
      this.totalElementos = this.contratante.length;
    },0)

  }

  abrirModalDetalleContratante(contratante: UsuarioContratante): void {
    this.detalleRef = this.dialogService.open(DetalleContratantesComponent, {
      header:"Ver detalle",
      width:"920px",
      data: {contratante:contratante, origen: "detalle"},
    });
  }
  abrirModalModificarContratante(): void {
    this.modificarRef = this.dialogService.open(ModificarContratantesComponent ,{
      header:"Modificar contratante",
      width:"920px",
      data: {contratante:this.contratanteSeleccionado, origen: "modificar"},
    });

    this.modificarRef.onClose.subscribe((respuesta:ConfirmarContratante) => {
      if(respuesta.estatus){
        this.alertaService.mostrar(TipoAlerta.Exito, this.alertaEstatus[2]);
      }
    });
  }

  abrirModalCambiarEstatus(contratante: UsuarioContratante): void {
    this.detalleRef = this.dialogService.open(DetalleContratantesComponent, {
      header:contratante.estatus? "Activar contratante":"Desactivar contratante",
      width:"920px",
      data: {contratante:contratante, origen: "estatus"},
    });

    this.detalleRef.onClose.subscribe((respuesta:ConfirmarContratante) => {
      if(respuesta.estatus){
        this.alertaService.mostrar(TipoAlerta.Exito,
          respuesta.usuarioContratante?.estatus?this.alertaEstatus[0]:this.alertaEstatus[1] );
      }
    });
  }

  abrirPanel(event: MouseEvent, contratante: UsuarioContratante): void {
    this.contratanteSeleccionado = contratante;
    this.overlayPanel.toggle(event);
  }

  limpiar(): void {
    this.filtroForm.reset();
  }

  get ff() {
    return this.filtroForm.controls;
  }

}
