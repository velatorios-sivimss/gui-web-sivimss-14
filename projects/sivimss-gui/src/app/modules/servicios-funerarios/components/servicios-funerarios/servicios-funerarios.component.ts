import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {Router} from "@angular/router";
import {OverlayPanel} from "primeng/overlaypanel";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS_DUMMIES} from "../../constants/dummies";
import {SERVICIO_BREADCRUMB} from "../../constants/breadcrumb";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {ServiciosFunerariosInterface} from "../../models/servicios-funerarios.interface"
import {LazyLoadEvent} from "primeng/api";
import {UsuarioContratante} from "../../../contratantes/models/usuario-contratante.interface";


@Component({
  selector: 'app-servicios-funerarios',
  templateUrl: './servicios-funerarios.component.html',
  styleUrls: ['./servicios-funerarios.component.scss']
})
export class ServiciosFunerariosComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  filtroForm!: FormGroup;

  nivel:TipoDropdown[] = CATALOGOS_DUMMIES;
  estatus:TipoDropdown[] = CATALOGOS_DUMMIES;
  velatorio:TipoDropdown[] = CATALOGOS_DUMMIES;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  servicioFunerario:ServiciosFunerariosInterface[] = [];
  servicioSeleccionado: ServiciosFunerariosInterface = {};

  constructor(
    private breadcrumbService: BreadcrumbService,
    private formBuilder: FormBuilder,
    private router: Router
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
      nivel: [{value: null, disabled:false}],
      velatorio: [{value: null, disabled:false}],
      folioPlanSFPA: [{value: null, disabled:false}],
      rfc: [{value: null, disabled:false}],
      curp: [{value: null, disabled:false}],
      estatus: [{value: null, disabled:false}],
      afiliado: [{value: null, disabled:false}],
      rangoInicio: [{value: null, disabled:false}],
      rangoFin: [{value: null, disabled:false}]
    });
  }

  paginar(event: LazyLoadEvent): void {
    setTimeout(() => {
      this.servicioFunerario = [
        {
          folioPlanSFPA:"DOC-0001",
          nombre: "Heriberto Angelo",
          primerApellido: "Sánchez",
          segundoApellido: "Maldonado",
          estado: "Queretaro",
          correoElectronico: "herisama123@gmail.com",
          paquete: "ECCO",
          numeroPago: 1,
          estatusPlan: "Generado" ,
          estatusPago: "Vigente"
        }
      ];
      this.totalElementos = this.servicioFunerario.length;
    },0)
  }

  abrirPanel(event: MouseEvent, servicioFunerario: ServiciosFunerariosInterface): void {
    this.servicioSeleccionado = servicioFunerario;
    this.overlayPanel.toggle(event);
  }


  detallePago(): void {
    this.router.navigate(["servicios-funerarios/detalle-pago/1"])
  }

  cancelarPago(): void {
    this.router.navigate(["servicios-funerarios/cancelar-pago/1"])
  }

  modificarPago(): void {
    this.router.navigate(["servicios-funerarios/modificar-pago"],{queryParams:{idPlanSfpa:20}})
  }

}
