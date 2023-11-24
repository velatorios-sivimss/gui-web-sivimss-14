import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {LazyLoadEvent} from 'primeng/api';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {OverlayPanel} from 'primeng/overlaypanel';
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import {AlertaService} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {BreadcrumbService} from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import {DIEZ_ELEMENTOS_POR_PAGINA} from 'projects/sivimss-gui/src/app/utils/constantes';
import {CATALOGOS_DUMMIES} from '../../../../proveedores/constants/dummies';
import {SeguimientoNuevoConvenio} from '../../models/seguimiento-nuevo-convenio.interface';
import {SEGUIMIENTO_CONVENIO_BREADCRUMB} from "../../constants/breadcrumb";

@Component({
  selector: 'app-seguimiento-nuevo-convenio',
  templateUrl: './seguimiento-nuevo-convenio.component.html',
  styleUrls: ['./seguimiento-nuevo-convenio.component.scss'],
  providers: [DialogService],
})
export class SeguimientoNuevoConvenioComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  niveles: TipoDropdown[] = [];
  velatorios: TipoDropdown[] = [];

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;


  convenios: SeguimientoNuevoConvenio[] = [];
  convenioSeleccionado: SeguimientoNuevoConvenio = {};

  filtroForm!: FormGroup;

  creacionRef!: DynamicDialogRef;
  detalleRef!: DynamicDialogRef;
  modificacionRef!: DynamicDialogRef;

  opciones: TipoDropdown[] = CATALOGOS_DUMMIES;
  tipoServicio: TipoDropdown[] = CATALOGOS_DUMMIES;
  partidaPresupuestal: TipoDropdown[] = CATALOGOS_DUMMIES;
  cuentaContable: TipoDropdown[] = CATALOGOS_DUMMIES;


  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.inicializarFiltroForm();
    this.breadcrumbService.actualizar(SEGUIMIENTO_CONVENIO_BREADCRUMB);
  }

  inicializarFiltroForm(): void {
    this.filtroForm = this.formBuilder.group({
      nivel: [{value: null, disabled: false}, [Validators.required]],
      velatorio: [{value: null, disabled: false}, [Validators.required]],
      folioConvenioPf: [{value: null, disabled: false}, [Validators.required]],
      folioConvenioPsfpa: [{value: null, disabled: false}, [Validators.required]],
      rfcAfiliado: [{value: null, disabled: false}, [Validators.required]],
    });
  }

  paginar(event: LazyLoadEvent): void {
    console.log(event);
    setTimeout(() => {
      this.convenios = [
        {
          id: 1,
          nivel: "ataúd",
          velatorio: "Artículo complementario",
          folioConvenioPf: "Madera ecológica MDF",
          folioConvenioPsfpa: "Tambora",
          rfcAfiliado: "Intermediaria",
          tipoContratacion: "Por persona",
          rfc: "fjdgf639d ",
          nombreAfiliado: "10m",
          tipoPaquete: "2m",
          estatus: true,
        },
        {
          id: 2,
          nivel: "ataúd",
          velatorio: "Artículo complementario",
          folioConvenioPf: "Madera ecológica MDF",
          folioConvenioPsfpa: "Tambora",
          rfcAfiliado: "Intermediaria",
          tipoContratacion: "Por Empresa",
          rfc: "fjdgf639d ",
          nombreAfiliado: "10m",
          tipoPaquete: "2m",
          estatus: true,
        },
        {
          id: 3,
          nivel: "ataúd",
          velatorio: "Artículo complementario",
          folioConvenioPf: "Madera ecológica MDF",
          folioConvenioPsfpa: "Tambora",
          rfcAfiliado: "Intermediaria",
          tipoContratacion: "Numero de folio de convenio (Pre registro)",
          rfc: "fjdgf639d ",
          nombreAfiliado: "10m",
          tipoPaquete: "2m",
          estatus: true,
        }
      ];
      this.totalElementos = this.convenios.length;
    }, 0)
  }

  limpiar(): void {
    this.filtroForm.reset();
  }

  get nuf() {
    return this.filtroForm?.controls;
  }

  abrirModalAgregarServicio(): void {
    // this.creacionRef = this.dialogService.open(AgregarArticulosComponent,{
    //   header:"Agregar artículo",
    //   width:"920px"
    // });
    // this.creacionRef.onClose.subscribe((estatus:boolean) => {
    //   if(estatus){
    //     this.alertaService.mostrar(TipoAlerta.Exito, 'Artículo agregado correctamente');
    //   }
    // })
  }

  abrirCambioEstatus(servicio: SeguimientoNuevoConvenio) {
    void this.router.navigate(['desactivar-convenio'], {relativeTo: this.activatedRoute});
    /*Preguntar si se puede usar 'let'*/
    // let header:string = "" ;
    // servicio.estatus?header="Activar artículo":header="Desactivar artículo";
    // this.creacionRef = this.dialogService.open(DetalleArticulosComponent, {
    //   header:header,
    //   width:"920px",
    //   data: {servicio:servicio, origen: "estatus"},
    // })

    // this.creacionRef.onClose.subscribe((servicio:Articulos) => {
    //   if(servicio.estatus){
    //     this.alertaService.mostrar(TipoAlerta.Exito, 'Artículo activado correctamente');
    //   }else{
    //     this.alertaService.mostrar(TipoAlerta.Exito, 'Servicio desactivado correctamente');
    //   }
    // })

  }

  abrirConcluirServicio(): void {
    // this.creacionRef = this.dialogService.open(ModificarArticulosComponent, {
    //   header:"Modificar artículo",
    //   width:"920px",
    // })

    // this.creacionRef.onClose.subscribe((estatus:boolean) => {
    //   if(estatus){
    //     this.alertaService.mostrar(TipoAlerta.Exito, 'Artículo modificado correctamente');
    //   }
    // })
  }

  abrirPanel(event: MouseEvent, convenioSeleccionado: SeguimientoNuevoConvenio): void {
    this.convenioSeleccionado = convenioSeleccionado;
    this.overlayPanel.toggle(event);
  }

  abrirModalDetalleCapilla(servicio: SeguimientoNuevoConvenio) {
    // this.creacionRef = this.dialogService.open(DetalleArticulosComponent, {
    //   header:"Detalle",
    //   width:"920px",
    //   data: {servicio:servicio, origen: "detalle"},
    // })
  }

  consultaServicioEspecifico(): string {
    return ''
  }

  abrirPreRegistroNuevoConvenio(): void {
    this.router.navigate(['pre-registro-nuevo-convenio'], {relativeTo: this.activatedRoute});
  }


}
