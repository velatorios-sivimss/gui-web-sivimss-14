import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";
import {OverlayPanel} from "primeng/overlaypanel";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {Rol} from "../../models/rol.interface";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {HttpErrorResponse} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {RolService} from '../../services/rol.service';
import {Catalogo} from 'projects/sivimss-gui/src/app/models/catalogos.interface';
import {FiltrosRol} from '../../models/filtrosRol.interface';
import {VerDetalleRolComponent} from "../ver-detalle-rol/ver-detalle-rol.component";
import {ModificarRolComponent} from "../modificar-rol/modificar-rol.component";
import {RespuestaModalRol} from "../../models/respuestaModal.interface";
import {LazyLoadEvent} from 'primeng/api';
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {
  ConfirmacionMovimientoComponent
} from "../confirmacion-movimiento/confirmacion-movimiento/confirmacion-movimiento.component";
import {validarUsuarioLogueado} from "../../../../utils/funciones";
import {ROLES_BREADCRUMB} from "../../constants/breadcrumb";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";

const MAX_WIDTH: string = "876px";

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
  providers: [DialogService]
})
export class RolesComponent implements OnInit {

  base64: string = ''

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  paginacionConFiltrado: boolean = false;
  filtroForm!: FormGroup;

  catalogo_nivelOficina!: TipoDropdown[];
  estatus!: TipoDropdown[];
  catRol: Rol[] = [];
  roles: Rol[] = [];
  rolSeleccionado!: Rol;
  mostrarModalDetalleRol: boolean = false;
  detalleRef!: DynamicDialogRef;
  modificacionRef!: DynamicDialogRef;
  cambiarEstatusRef!: DynamicDialogRef;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private rolService: RolService,
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private mensajesSistemaService: MensajesSistemaService
  ) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(ROLES_BREADCRUMB);
    const roles = this.route.snapshot.data["respuesta"];
    this.catRol = roles[0].datos.map((rol: Catalogo) => ({label: rol.des_rol, value: rol.id})) || [];
    this.catalogo_nivelOficina = roles[1].map((nivel: any) => ({label: nivel.label, value: nivel.value})) || [];
    this.estatus = [{label: "Activo", value: 1}, {label: "Inactivo", value: 0}];
    this.inicializarFiltroForm();
  }


  seleccionarPaginacion(event?: LazyLoadEvent): void {
    if (validarUsuarioLogueado()) return;
    if (event) {
      this.numPaginaActual = Math.floor((event.first || 0) / (event.rows || 1));
    }
    if (this.paginacionConFiltrado) {
      this.paginarConFiltros();
    } else {
      this.paginarConFiltros();
    }
  }

  paginar(): void {
    this.rolService.obtenerCatRolesPaginadoSinFiltro(this.numPaginaActual, this.cantElementosPorPagina).subscribe(
      (respuesta: HttpRespuesta<any>): void => {
        this.roles = respuesta.datos.content || [];
        this.totalElementos = respuesta.datos.totalElements || 0;
      },
      (error: HttpErrorResponse): void => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    );
    this.totalElementos = this.roles.length;
  }

  paginarConFiltros(): void {
    const filtros: FiltrosRol = this.crearSolicitudFiltros();
    const solicitudFiltros: string = JSON.stringify(filtros);
    this.rolService.buscarPorFiltros(solicitudFiltros, this.numPaginaActual, this.cantElementosPorPagina).subscribe(
      (respuesta: HttpRespuesta<any>): void => {
        this.roles = respuesta.datos.content || [];
        this.totalElementos = respuesta.datos.totalElements || 0;
      },
      (error: HttpErrorResponse): void => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    );
  }

  buscar(): void {
    this.numPaginaActual = 0;
    this.paginacionConFiltrado = true;
    this.paginarConFiltros();
  }

  crearSolicitudFiltros(): FiltrosRol {
    return {
      idRol: this.filtroForm.get("rol")?.value,
      idOficina: this.filtroForm.get("nivel")?.value,
      estatusRol: this.filtroForm.get("estatus")?.value
    };
  }

  limpiar(): void {
    this.paginacionConFiltrado = false;
    this.filtroForm.reset();
    this.numPaginaActual = 0;
    this.paginarConFiltros();
  }

  cambiarEstatus(rol: Rol): void {
    const titulo = rol.estatusRol ? "Activar" : "Desactivar"

    const DETALLE_CONFIG: DynamicDialogConfig = {
      header: titulo + " rol",
      width: MAX_WIDTH,
      data: rol
    }
    this.cambiarEstatusRef = this.dialogService.open(ConfirmacionMovimientoComponent, DETALLE_CONFIG);

    this.cambiarEstatusRef.onClose.subscribe((respuesta: any) => {
      if (respuesta.estatus) {
        const rolEstatus = {
          "idRol": respuesta.datosRol.idRol,
          "estatusRol": respuesta.datosRol.estatusRol ? 1 : 0
        }
        const solicitudId = JSON.stringify(rolEstatus);
        this.rolService.cambiarEstatus(solicitudId).subscribe(
          () => {
            if (rolEstatus.estatusRol) {
              this.alertaService.mostrar(TipoAlerta.Exito, 'Activado correctamente. ' + rol.desRol);
            } else {
              this.alertaService.mostrar(TipoAlerta.Exito, 'Desactivado correctamente. ' + rol.desRol);

            }

          },
          (error: HttpErrorResponse) => {
            console.error(error);
            this.alertaService.mostrar(TipoAlerta.Error, error.message);
          }
        );
        return;
      }
      this.buscar();
    });

    // this.cambiarEstatusRef.onClose.subscribe((respuesta: RespuestaModalRol) => this.procesarRespuestaModal(respuesta));
    return;


  }

  inicializarFiltroForm(): void {
    this.filtroForm = this.formBuilder.group({
      rol: [{value: null, disabled: false}],
      nivel: [{value: null, disabled: false}],
      estatus: [{value: null, disabled: false}],
    });
  }

  abrirPanel(event: MouseEvent, rolSeleccionado: Rol): void {
    this.rolSeleccionado = rolSeleccionado;
    this.overlayPanel.toggle(event);
  }

  abrirModalDetalleRol(rol: Rol): void {
    this.rolSeleccionado = rol;
    const DETALLE_CONFIG: DynamicDialogConfig = {
      header: "Ver detalle",
      width: MAX_WIDTH,
      data: rol
    }
    this.detalleRef = this.dialogService.open(VerDetalleRolComponent, DETALLE_CONFIG);
    this.detalleRef.onClose.subscribe((respuesta: RespuestaModalRol) => this.procesarRespuestaModal(respuesta));
  }

  abrirModalModificarRol(): void {
    const MODIFICAR_CONFIG: DynamicDialogConfig = {
      header: "Modificar rol",
      width: MAX_WIDTH,
      data: this.rolSeleccionado
    }
    this.modificacionRef = this.dialogService.open(ModificarRolComponent, MODIFICAR_CONFIG);
    this.modificacionRef.onClose.subscribe((respuesta: RespuestaModalRol) => this.procesarRespuestaModal(respuesta));
  }

  procesarRespuestaModal(respuesta: RespuestaModalRol = {}): void {
    if (respuesta.actualizar) {
      this.limpiar();
    }
  }

  ngOnDestroy(): void {
    if (this.detalleRef) {
      this.detalleRef.destroy();
    }
    if (this.modificacionRef) {
      this.modificacionRef.destroy();
    }
  }

  descargarArchivo(tipoReporte: string) {
    const filtros = this.crearSolicitudFiltros()
    const tipoArchivo = JSON.stringify(filtros)
    const tipoArchivoConTipoDoc = JSON.parse(tipoArchivo)
    tipoArchivoConTipoDoc['tipoReporte'] = tipoReporte;
    this.rolService.exportarArchivo(tipoArchivoConTipoDoc).subscribe(
      (respuesta) => {
        this.base64 = respuesta!.datos
        if (this.totalElementos == 0) {
          this.alertaService.mostrar(
            TipoAlerta.Error,
            'No se encontró información relacionada a tu búsqueda.',
          )
        }
        const linkSource =
          'data:application/' + tipoReporte + ';base64,' + this.base64 + '\n'
        const downloadLink = document.createElement('a')
        const fileName = 'Roles.' + tipoReporte
        downloadLink.href = linkSource
        downloadLink.download = fileName
        downloadLink.click()
      },
      (error: HttpErrorResponse) => {
        console.error(error)
        this.alertaService.mostrar(TipoAlerta.Error, error.message)
      },
    )
  }

}
