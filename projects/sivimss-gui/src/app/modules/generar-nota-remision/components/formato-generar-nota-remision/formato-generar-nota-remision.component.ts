import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {OverlayPanel} from 'primeng/overlaypanel';
import {AlertaService, TipoAlerta} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {ModalNotaRemisionComponent} from '../modal/modal-nota-remision/modal-nota-remision.component';
import {GenerarNotaRemisionService} from '../../services/generar-nota-remision.service';
import {HttpErrorResponse} from '@angular/common/http';
import {ArticulosServicios, DetalleNotaRemision, GenerarDatosReporte} from '../../models/nota-remision.interface';
import {DescargaArchivosService} from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import {mensajes} from '../../../reservar-salas/constants/mensajes';
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {CookieService} from "ngx-cookie-service";

@Component({
  selector: 'app-formato-generar-nota-remision',
  templateUrl: './formato-generar-nota-remision.component.html',
  styleUrls: ['./formato-generar-nota-remision.component.scss'],
  providers: [DynamicDialogConfig, DialogService, DescargaArchivosService, CookieService],
})
export class FormatoGenerarNotaRemisionComponent implements OnInit {
  readonly POSICION_DETALLE: number = 0;
  readonly POSICION_SERVICIOS: number = 1;

  @ViewChild(OverlayPanel)
  overlayPanel: OverlayPanel | undefined;

  notaRemisionForm!: FormGroup;
  formatoGenerar: boolean = true;
  detalleNota!: DetalleNotaRemision;
  creacionRef!: DynamicDialogRef;
  idOds: number = 0;
  servicios: ArticulosServicios[] = [];
  notaRemisionReporte: GenerarDatosReporte = {};
  validacionGenerarFactura: boolean = false;
  idNota: number = 0;

  alertas = JSON.parse(this.cookieService.get('mensajes') as string) || mensajes;

  constructor(
    public dialogService: DialogService,
    private formBuilder: FormBuilder,
    private alertaService: AlertaService,
    private router: Router,
    private route: ActivatedRoute,
    private activatedRoute: ActivatedRoute,
    private generarNotaRemisionService: GenerarNotaRemisionService,
    private mensajesSistemaService: MensajesSistemaService,
    private cookieService: CookieService
  ) {
  }

  ngOnInit(): void {
    this.cargarCatalogos();
    this.inicializarNotaRemisionForm(this.detalleNota);
  }


  cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    [this.notaRemisionReporte] = respuesta[this.POSICION_DETALLE]!.datos;
    [this.detalleNota] = respuesta[this.POSICION_DETALLE]!.datos;
    this.servicios = respuesta[this.POSICION_SERVICIOS]?.datos;
    this.idOds = +this.route.snapshot.params?.idOds;
    this.idNota = +this.route.snapshot.params?.idNota;
  }

  inicializarNotaRemisionForm(detalle: DetalleNotaRemision): void {
    this.notaRemisionForm = this.formBuilder.group({
      versionDocumento: [{value: null, disabled: true}],
      fechaNota: [{value: new Date(), disabled: true}],
      velatorioOrigen: [{value: null, disabled: true}],
      folioNota: [{value: null, disabled: true}],
      dirVelatorio: [{value: null, disabled: true}],
      nomSolicitante: [{value: null, disabled: true}],
      dirSolicitante: [{value: null, disabled: true}],
      curpSolicitante: [{value: null, disabled: true}],
      nomVelatorio: [{value: null, disabled: true}],
      nomFinado: [{value: null, disabled: true}],
      parFinado: [{value: null, disabled: true}],
      folioODS: [{value: null, disabled: true}],
      nombreConformidad: [{value: null, disabled: true}],
      nombreRepresentante: [{value: null, disabled: true}],
    });
    this.notaRemisionForm.patchValue({...detalle, versionDocumento: "1.2"});
  }

  abrirModalGenerandoNotaRemision(): void {
    this.creacionRef = this.dialogService.open(ModalNotaRemisionComponent, {
      header: "Aviso",
      width: "920px",
      data: {mensaje: 'Generando nota de remisión'},
    });
  }

  regresar(): void {
    this.formatoGenerar = true;
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

  cancelar(): void {
    void this.router.navigate(['/generar-nota-remision'], {relativeTo: this.activatedRoute});
  }

  generarNotaRemision(): void {
    this.abrirModalGenerandoNotaRemision();
    this.generarNotaRemisionService.guardar({idOrden: this.idOds, idNota: this.idNota}).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.creacionRef.close();
        this.alertaService.mostrar(TipoAlerta.Exito, 'Nota de remisión generada exitosamente');
        void this.router.navigate(['/generar-nota-remision'], {relativeTo: this.activatedRoute});
      },
      error: (error: HttpErrorResponse) => {
        const ERROR: string = 'Error al guardar la información de la nota de remisión. Intenta nuevamente.'
        this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
        this.creacionRef.close();
      }
    });
  }

  generarReporteOrdenServicio(): void {
    const busqueda: GenerarDatosReporte = this.datosReporte();
    this.generarNotaRemisionService.generarReporteNotaRemision(busqueda).subscribe({
      next: (response: any) => {
        const file = new Blob([response], {type: 'application/pdf'});
        const url = window.URL.createObjectURL(file);
        window.open(url);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al descargar reporte: ', error.message);
      }
    });
  }

  datosReporte(): GenerarDatosReporte {
    return {
      idNota: 0,
      idOrden: this.idOds,
      fechaNota: this.notaRemisionReporte.fechaNota,
      velatorioOrigen: this.notaRemisionReporte.velatorioOrigen,
      folioNota: this.notaRemisionReporte.folioNota,
      dirVelatorio: this.notaRemisionReporte.dirVelatorio,
      nomSolicitante: this.notaRemisionReporte.nomSolicitante,
      dirSolicitante: this.notaRemisionReporte.dirSolicitante,
      curpSolicitante: this.notaRemisionReporte.curpSolicitante,
      nomVelatorio: this.notaRemisionReporte.nomVelatorio,
      nomFinado: this.notaRemisionReporte.nomFinado,
      parFinado: this.notaRemisionReporte.parFinado,
      folioODS: this.notaRemisionReporte.folioODS,
      folioConvenio: this.notaRemisionReporte.folioConvenio,
      fechaConvenio: this.notaRemisionReporte.fechaConvenio,
      tipoReporte: "pdf"
    }
  }

  get f() {
    return this.notaRemisionForm.controls;
  }

}
