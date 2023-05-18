import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {BreadcrumbService} from "../../../../shared/breadcrumb/services/breadcrumb.service";
import {DIEZ_ELEMENTOS_POR_PAGINA} from "../../../../utils/constantes";
import {OverlayPanel} from "primeng/overlaypanel";
import { USUARIOS_BREADCRUMB } from '../../../usuarios/constants/breadcrumb';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {Rol} from "../../models/rol.interface";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {HttpErrorResponse} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import { CATALOGOS } from '../../../usuarios/constants/catalogos_dummies';
import { RolService } from '../../services/rol.service';
import {Catalogo} from 'projects/sivimss-gui/src/app/models/catalogos.interface';
import { FiltrosRol } from '../../models/filtrosRol.interface';
import {VerDetalleRolComponent} from "../ver-detalle-rol/ver-detalle-rol.component";
import {ModificarRolComponent} from "../modificar-rol/modificar-rol.component";
import {RespuestaModalRol} from "../../models/respuestaModal.interface";
import { CATALOGO_NIVEL } from '../../../articulos/constants/dummies';
import { LazyLoadEvent } from 'primeng/api';
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";

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
  catRol: Rol[] = [];
  roles: Rol[] = [];
  rolSeleccionado!: Rol;
  mostrarModalDetalleRol: boolean = false;
  detalleRef!: DynamicDialogRef;
  modificacionRef!: DynamicDialogRef;

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
    this.breadcrumbService.actualizar([
      {
        icono: 'imagen-icono-operacion-sivimss.svg',
        titulo: 'Administración de catálogos'
      },
      {
        icono: '',
        titulo: 'Administrar roles a nivel oficina'
      }
    ]);
    const roles = this.route.snapshot.data["respuesta"];
    this.catRol = roles[0].datos.map((rol: Catalogo) => ({label: rol.des_rol, value: rol.id})) || [];
    this.catalogo_nivelOficina = roles[1].map((nivel: any) => ({label: nivel.label, value: nivel.value})) || [];
    this.inicializarFiltroForm();
  }


  seleccionarPaginacion(event?: LazyLoadEvent): void {
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
      (respuesta) => {
        this.roles = respuesta!.datos.content;
        this.totalElementos = respuesta!.datos.totalElements;
        if (this.totalElementos == 0) {
          this.alertaService.mostrar(
            TipoAlerta.Error,
            'No se encontró información relacionada a tu búsqueda.',
          )
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    );
    this.totalElementos = this.roles.length;
  }

  paginarConFiltros(): void {
    const filtros = this.crearSolicitudFiltros();
    const solicitudFiltros = JSON.stringify(filtros);
    this.rolService.buscarPorFiltros(solicitudFiltros, this.numPaginaActual, this.cantElementosPorPagina).subscribe(
      (respuesta) => {
        if(respuesta.datos.content.length > 0 ){
          this.roles = respuesta!.datos.content;
          this.totalElementos = respuesta!.datos.totalElements;
          return;
        }
        const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(respuesta.mensaje));
        this.alertaService.mostrar(TipoAlerta.Precaucion, msg);
      },
      (error: HttpErrorResponse) => {
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
      idOficina: this.filtroForm.get("nivel")?.value
    };
  }

  limpiar(): void {
    this.paginacionConFiltrado = false;
    this.filtroForm.reset();
    this.numPaginaActual = 0;
    this.paginarConFiltros();
  }

  cambiarEstatus(rol: Rol): void {
    const rolEstatus = {
      "idRol": rol.idRol,
      "estatusRol": rol.estatusRol ? 1 : 0
    }
    const solicitudId = JSON.stringify(rolEstatus);
    this.rolService.cambiarEstatus(solicitudId).subscribe(
      () => {
        this.alertaService.mostrar(TipoAlerta.Exito, 'Cambio de estatus realizado');
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    );
  }

  inicializarFiltroForm():void {
    this.filtroForm = this.formBuilder.group({
      rol: [{value: null, disabled: false}],
      nivel: [{value: null, disabled: false}],
    });
  }

  abrirPanel(event: MouseEvent, rolSeleccionado: Rol):void {
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
    if (respuesta.mensaje) {
      this.alertaService.mostrar(TipoAlerta.Exito, respuesta.mensaje);
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
