import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {OverlayPanel} from "primeng/overlaypanel";
import {FormGroup} from "@angular/forms";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {GenerarOrdenSubrogacionService} from '../../services/generar-orden-subrogacion.service';
import {MensajesSistemaService} from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import {ActivatedRoute} from '@angular/router';
import {GenerarOrdenSubrogacion} from '../../models/generar-orden-subrogacion.interface';
import {ConfirmationService} from 'primeng/api';
import {DatePipe} from '@angular/common';
import {DescargaArchivosService} from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import {HttpErrorResponse} from '@angular/common/http';
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {mapearArregloTipoDropdown} from 'projects/sivimss-gui/src/app/utils/funciones';
import {UsuarioEnSesion} from 'projects/sivimss-gui/src/app/models/usuario-en-sesion.interface';
import {CookieService} from "ngx-cookie-service";
import {AutenticacionService} from "../../../../services/autenticacion.service";

@Component({
  selector: 'app-detalle-generar-orden',
  templateUrl: './detalle-generar-orden.component.html',
  styleUrls: ['./detalle-generar-orden.component.scss'],
  providers: [DialogService, DatePipe, DescargaArchivosService, ConfirmationService, DynamicDialogRef, DynamicDialogConfig,
    CookieService, AutenticacionService]
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
  public alertas = JSON.parse(this.cookieService.get('mensajes') as string);
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
    private route: ActivatedRoute,
    private generarOrdenSubrogacionService: GenerarOrdenSubrogacionService,
    private mensajesSistemaService: MensajesSistemaService,
    private datePipe: DatePipe,
    private authService: AutenticacionService,
    private cookieService: CookieService,
  ) {
  }

  ngOnInit(): void {
    this.ordenSeleccionada = this.generarOrdenSubrogacionService.ordenSeleccionada;
    this.horaPartidaConFormato = this.ordenSeleccionada.horaPartida;
    this.horaActual = this.datePipe.transform(new Date(), 'HH:mm:ss');
    this.cargarVelatorios(true);
    this.inicializarCatalogos();
  }

  inicializarCatalogos(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    const usuario: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();
    this.catalogoNiveles = respuesta[this.POSICION_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_DELEGACIONES];
    let delegacionObtenida = this.catalogoDelegaciones.filter(d => d.value === parseInt(usuario.idDelegacion));
    this.delegacionDescripcion = delegacionObtenida[0].label;
  }

  cargarVelatorios(cargaInicial: boolean = false): void {
    const usuario: UsuarioEnSesion = this.authService.obtenerUsuarioEnSesion();
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
  }

  get ef() {
    return this.editForm.controls;
  }

}
