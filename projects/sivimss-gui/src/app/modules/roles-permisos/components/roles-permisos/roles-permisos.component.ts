import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";
import {OverlayPanel} from "primeng/overlaypanel";
import {USUARIOS_BREADCRUMB} from '../../../usuarios/constants/breadcrumb';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {Rol} from "../../models/rol.interface";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {HttpErrorResponse} from '@angular/common/http';
import {CATALOGOS} from '../../../usuarios/constants/catalogos_dummies';
import {RolPermisosService} from '../../services/rol-permisos.service';
import {Catalogo} from 'projects/sivimss-gui/src/app/models/catalogos.interface';
import {VerDetalleRolPermisosComponent} from "../ver-detalle-rol-permisos/ver-detalle-rol-permisos.component";
import {ModificarRolPermisosComponent} from "../modificar-rol-permisos/modificar-rol-permisos.component";
import {RespuestaModalRol} from "projects/sivimss-gui/src/app/modules/roles-permisos/models/respuesta-modal.interface";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";

type SolicitudEstatus = Pick<Rol, "idRol">;
const MAX_WIDTH: string = "876px";

@Component({
  selector: 'app-roles-permisos',
  templateUrl: './roles-permisos.component.html',
  providers: [DialogService]
})
export class RolesPermisosComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  paginacionConFiltrado: boolean = false;
  filtroForm!: FormGroup;
  permisos: any;
  rolPermisos: any = "";
  opciones: TipoDropdown[] = CATALOGOS;
  catRol: any[] = [];
  roles: Rol[] = [];
  rolSeleccionado!: Rol;
  mostrarModalDetalleRol: boolean = false;
  detalleRef!: DynamicDialogRef;
  modificacionRef!: DynamicDialogRef;

  constructor(
    private formBuilder: FormBuilder,
    private rolPermisosService: RolPermisosService,
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
  ) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(USUARIOS_BREADCRUMB);
    this.inicializarFiltroForm();
    this.catalogoRoles();
  }

  inicializarFiltroForm(): void {
    this.filtroForm = this.formBuilder.group({
      rol: [{value: null, disabled: false}],
      nivel: [{value: null, disabled: false}],
      velatorio: [{value: null, disabled: false}],
      delegacion: [{value: null, disabled: false}],
      estatus: [{value: null, disabled: false}],
      alta: [{value: false, disabled: false}],
      baja: [{value: false, disabled: false}],
      aprobacion: [{value: false, disabled: false}],
      consulta: [{value: false, disabled: false}],
      modificar: [{value: false, disabled: false}],
      imprimir: [{value: false, disabled: false}]
    });
  }

  seleccionarPaginacion(): void {
    if (this.paginacionConFiltrado) {
      this.paginarConFiltros();
    } else {
      this.paginar();
    }
  }

  paginar(): void {
    this.rolPermisosService.buscarPorPagina(this.numPaginaActual, this.cantElementosPorPagina).subscribe({
      next: (respuesta): void => {
        this.roles = respuesta.datos.content;
        this.totalElementos = respuesta.datos.totalElements;
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
    this.totalElementos = this.roles.length;
  }

  paginarConFiltros(): void {
    this.permisos = (this.filtroForm.get("alta")?.value ? "1" : "") +
      (this.filtroForm.get("baja")?.value ? "2" : "") +
      (this.filtroForm.get("consulta")?.value ? "3" : "") +
      (this.filtroForm.get("modificar")?.value ? "4" : "") +
      (this.filtroForm.get("aprobacion")?.value ? "5" : "") +
      (this.filtroForm.get("imprimir")?.value ? "6" : "");
    const separar = this.permisos.split('');
    const cadenaPermisos = separar.toString()
    if (cadenaPermisos != "") {
      this.rolPermisos = {
        idRol: this.filtroForm.get("rol")?.value,
        nivel: this.filtroForm.get("nivel")?.value,
        permisos: cadenaPermisos,
        estatus: 1
      }
    } else {
      this.rolPermisos = {
        idRol: this.filtroForm.get("rol")?.value,
        nivel: this.filtroForm.get("nivel")?.value,
        estatus: 1
      }
    }
    const solicitudFiltros = JSON.stringify(this.rolPermisos);
    this.rolPermisosService.buscarPorFiltros(solicitudFiltros, this.numPaginaActual, this.cantElementosPorPagina).subscribe({
      next: (respuesta): void => {
        this.roles = respuesta.datos;
        this.totalElementos = respuesta.datos.totalElements;
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  buscar(): void {
    this.numPaginaActual = 0;
    this.paginacionConFiltrado = true;
    this.paginarConFiltros();
  }

  limpiar(): void {
    this.paginacionConFiltrado = false;
    this.filtroForm.reset();
    this.numPaginaActual = 0;
    this.paginar();
  }

  cambiarEstatus(idRol: number): void {
    const id: SolicitudEstatus = {idRol}
    const solicitudId = JSON.stringify(id);
    this.rolPermisosService.cambiarEstatus(solicitudId).subscribe({
      next: (): void => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Cambio de estatus realizado');
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }


  abrirPanel(event: MouseEvent, rolSeleccionado: Rol): void {
    this.rolSeleccionado = rolSeleccionado;
    this.overlayPanel.toggle(event);
  }

  abrirModalDetalleRol(rol: Rol): void {
    this.rolSeleccionado = rol;
    const DETALLE_CONFIG: DynamicDialogConfig = {
      header: "Ver detalle rol permiso",
      width: MAX_WIDTH,
      data: rol
    }
    this.detalleRef = this.dialogService.open(VerDetalleRolPermisosComponent, DETALLE_CONFIG);
    this.detalleRef.onClose.subscribe((respuesta: RespuestaModalRol) => this.procesarRespuestaModal(respuesta));
  }

  abrirModalModificarRolPermisos(): void {
    const MODIFICAR_CONFIG: DynamicDialogConfig = {
      header: "Modificar rol permisos",
      width: MAX_WIDTH,
      data: this.rolSeleccionado
    }
    this.modificacionRef = this.dialogService.open(ModificarRolPermisosComponent, MODIFICAR_CONFIG);
    this.modificacionRef.onClose.subscribe((respuesta: RespuestaModalRol) => this.procesarRespuestaModal(respuesta));
  }

  procesarRespuestaModal(respuesta: RespuestaModalRol = {}): void {
    if (respuesta.actualizar) {
      this.limpiar();
    }
    if (respuesta.mensaje) {
      this.alertaService.mostrar(TipoAlerta.Exito, respuesta.mensaje);
    }
  }

  catalogoRoles(): void {
    this.rolPermisosService.obtenerCatRoles().subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.catRol = respuesta.datos.map((rol: Catalogo) => ({label: rol.des_rol, value: rol.id})) || [];
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.detalleRef) {
      this.detalleRef.destroy();
    }
    if (this.modificacionRef) {
      this.modificacionRef.destroy();
    }
  }


}
