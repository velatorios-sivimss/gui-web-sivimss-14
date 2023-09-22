import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {OverlayPanel} from "primeng/overlaypanel";
import {FormBuilder, FormGroup} from "@angular/forms";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {GenerarOrdenSubrogacionService} from '../../services/generar-orden-subrogacion.service';
import {AlertaService, TipoAlerta} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {MensajesSistemaService} from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import {ActivatedRoute, Router} from '@angular/router';
import {GenerarOrdenSubrogacion} from '../../models/generar-orden-subrogacion.interface';
import {ConfirmationService} from 'primeng/api';
import {DatePipe} from '@angular/common';
import {finalize} from "rxjs/operators";
import {LoaderService} from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import {DescargaArchivosService} from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import {OpcionesArchivos} from 'projects/sivimss-gui/src/app/models/opciones-archivos.interface';
import {HttpErrorResponse} from '@angular/common/http';
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {mapearArregloTipoDropdown} from 'projects/sivimss-gui/src/app/utils/funciones';
import {UsuarioEnSesion} from 'projects/sivimss-gui/src/app/models/usuario-en-sesion.interface';

@Component({
  selector: 'app-detalle-generar-orden',
  templateUrl: './detalle-generar-orden.component.html',
  styleUrls: ['./detalle-generar-orden.component.scss'],
  providers: [DialogService, DatePipe, DescargaArchivosService, ConfirmationService, DynamicDialogRef, DynamicDialogConfig]
})
export class DetalleGenerarOrdenComponent implements OnInit {
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  @Input() generarOrdenSubrogacion!: GenerarOrdenSubrogacion;

  @Input() origen!: string;

  @Output()
  confirmacionAceptar: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  cancelarConfirmacion: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input() datos: any;

  readonly POSICION_NIVELES: number = 0;
  readonly POSICION_DELEGACIONES: number = 1;

  public mensajeArchivoConfirmacion: string = "";
  public mostrarModalConfirmacion: boolean = false;
  public alertas = JSON.parse(localStorage.getItem('mensajes') as string);
  public cambiarEstatusRef!: DynamicDialogRef;
  public modificarRef!: DynamicDialogRef;
  public editForm!: FormGroup;
  public catalogoServicios: TipoDropdown[] = [];
  public catalogoNiveles: TipoDropdown[] = [];
  public catalogoDelegaciones: TipoDropdown[] = [];
  public catalogoVelatorios: TipoDropdown[] = [];
  public ordenSeleccionada: any;
  public delegacionDescripcion: any;
  public velatorioDescripcion: any;
  public horaActual: any;
  public horaPartidaConFormato: string = "";

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private readonly loaderService: LoaderService,
    private alertaService: AlertaService,
    private generarOrdenSubrogacionService: GenerarOrdenSubrogacionService,
    private mensajesSistemaService: MensajesSistemaService,
    private descargaArchivosService: DescargaArchivosService,
    private datePipe: DatePipe
  ) {
  }

  ngOnInit(): void {
    this.ordenSeleccionada = this.generarOrdenSubrogacionService.ordenSeleccionada;
    this.horaPartidaConFormato = this.ordenSeleccionada.horaPartida.substring(0, 5);
    this.horaActual = this.datePipe.transform(new Date(), 'HH:mm:ss')?.substring(0, 5);
    this.cargarVelatorios(true);
    this.inicializarCatalogos();
  }

  inicializarCatalogos(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    this.catalogoNiveles = respuesta[this.POSICION_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_DELEGACIONES];
    let delegacionObtenida = this.catalogoDelegaciones.filter(d => d.value === parseInt(usuario.idDelegacion));
    this.delegacionDescripcion = delegacionObtenida[0].label;
  }

  cargarVelatorios(cargaInicial: boolean = false): void {
    const usuario: UsuarioEnSesion = JSON.parse(localStorage.getItem('usuario') as string);
    if (!cargaInicial) {
      this.catalogoVelatorios = [];
      this.editForm.get('velatorio')?.patchValue("");
    }
    if (!usuario.idDelegacion) return;
    this.generarOrdenSubrogacionService.obtenerVelatorios(usuario.idDelegacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, "desc", "id");
        let velatorioObtenido = this.catalogoVelatorios.filter(v => v.value === parseInt(usuario.idVelatorio));
        this.velatorioDescripcion = velatorioObtenido[0].label;
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  imprimir() {
    this.loaderService.activar();
    let datos = {
      idHojaSubrogacion: this.ordenSeleccionada.idHojaSubrogacion
    }
    const configuracionArchivo: OpcionesArchivos = {};
    this.descargaArchivosService.descargarArchivo(this.generarOrdenSubrogacionService.generarHojaSubrogacion(datos), configuracionArchivo).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: any) => {
        this.mensajeArchivoConfirmacion = this.mensajesSistemaService.obtenerMensajeSistemaPorId(23);
        this.mostrarModalConfirmacion = true;
      },
      error: (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
        const mensaje = this.alertas?.filter((msj: any) => {
          return msj.idMensaje == error?.error?.mensaje;
        })
        if (mensaje) {
          this.alertaService.mostrar(TipoAlerta.Error, mensaje[0]?.desMensaje);
        } else {
          this.alertaService.mostrar(TipoAlerta.Error, "Error en la descarga del documento. Intenta nuevamente.");
        }
      },
    });
  }

  modificar(esModificacion: boolean): void {
    void this.router.navigate([`formato/${esModificacion}`], {relativeTo: this.activatedRoute});
  }

  get ef() {
    return this.editForm.controls;
  }

}
