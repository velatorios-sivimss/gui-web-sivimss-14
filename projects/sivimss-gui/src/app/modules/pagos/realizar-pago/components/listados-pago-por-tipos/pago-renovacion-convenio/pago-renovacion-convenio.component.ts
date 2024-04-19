import {Component, OnInit, ViewChild} from '@angular/core';
import {OverlayPanel} from "primeng/overlaypanel";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../../../utils/constantes";
import {TIPO_PAGO_CATALOGOS_CONVENIO} from "../../../constants/catalogos";
import {LazyLoadEvent} from "primeng/api";
import {DialogService} from "primeng/dynamicdialog";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../../../models/tipo-dropdown";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {RealizarPagoService} from "../../../services/realizar-pago.service";
import {LoaderService} from "../../../../../../shared/loader/services/loader.service";
import {MensajesSistemaService} from "../../../../../../services/mensajes-sistema.service";
import {PagoEspecifico} from "../../../modelos/pagoEspecifico.interface";
import {
  obtenerNivelUsuarioLogueado,
  obtenerVelatorioUsuarioLogueado,
  validarUsuarioLogueado
} from "../../../../../../utils/funciones";
import {UsuarioEnSesion} from "../../../../../../models/usuario-en-sesion.interface";
import {AutenticacionService} from "../../../../../../services/autenticacion.service";

@Component({
  selector: 'app-pago-renovacion-convenio',
  templateUrl: './pago-renovacion-convenio.component.html',
  styleUrls: ['./pago-renovacion-convenio.component.scss'],
  providers: [DialogService, AutenticacionService]
})
export class PagoRenovacionConvenioComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  totalElementos: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  tipoPago: TipoDropdown[] = TIPO_PAGO_CATALOGOS_CONVENIO;

  pagoForm!: FormGroup;
  pagos: PagoEspecifico[] = [];
  pagoSeleccionado!: PagoEspecifico;

  constructor(private formBuilder: FormBuilder,
              public dialogService: DialogService,
              private realizarPagoService: RealizarPagoService,
              private cargadorService: LoaderService,
              private mensajesSistemaService: MensajesSistemaService,
              private authService: AutenticacionService
  ) {

  }

  ngOnInit(): void {
    this.inicializarFormPago();
  }

  inicializarFormPago(): void {
    this.pagoForm = this.formBuilder.group({
      tipoPago: [{value: null, disabled: false}, [Validators.required]]
    })
  }

  seleccionarPaginacion(event?: LazyLoadEvent): void {
    if (validarUsuarioLogueado()) return;
    if (event) {
      this.numPaginaActual = Math.floor((event.first ?? 0) / (event.rows ?? 1));
    }
    this.paginar();
  }

  private paginar(): void {
    this.cargadorService.activar();
    const usuario: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();
    const idVelatorio: number | null = obtenerNivelUsuarioLogueado(usuario) === 1 ? null : obtenerVelatorioUsuarioLogueado(usuario);
    this.realizarPagoService.consultarPagosRenovacionConvenio({ idVelatorio },this.numPaginaActual, this.cantElementosPorPagina)
      .pipe(finalize(() => this.cargadorService.desactivar())).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => this.manejarRespuestaBusqueda(respuesta),
      error: (error: HttpErrorResponse): void => this.manejarMensajeError(error)
    });
  }

  private manejarRespuestaBusqueda(respuesta: HttpRespuesta<any>): void {
    this.pagos = respuesta.datos.content;
    this.totalElementos = respuesta.datos.totalElements;
  }

  private manejarMensajeError(error: HttpErrorResponse): void {
    console.error(error);
    this.mensajesSistemaService.mostrarMensajeError(error);
  }

  abrirPanel(event: MouseEvent, pago: any): void {
    this.overlayPanel.toggle(event);
    this.pagoSeleccionado = pago;
  }

}
