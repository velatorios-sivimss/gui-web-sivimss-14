import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OverlayPanel } from 'primeng/overlaypanel';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { ModalNotaRemisionComponent } from '../modal/modal-nota-remision/modal-nota-remision.component';
import { GenerarNotaRemisionService } from '../../services/generar-nota-remision.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ArticulosServicios, DetalleNotaRemision, GenerarReporte } from '../../models/nota-remision.interface';
import { OpcionesArchivos } from 'projects/sivimss-gui/src/app/models/opciones-archivos.interface';
import { DescargaArchivosService } from 'projects/sivimss-gui/src/app/services/descarga-archivos.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { finalize } from 'rxjs';
import { mensajes } from '../../../reservar-salas/constants/mensajes';

@Component({
  selector: 'app-formato-generar-nota-remision',
  templateUrl: './formato-generar-nota-remision.component.html',
  styleUrls: ['./formato-generar-nota-remision.component.scss'],
  providers: [DynamicDialogConfig, DialogService, DescargaArchivosService],
})
export class FormatoGenerarNotaRemisionComponent implements OnInit {
  readonly POSICION_DETALLE: number = 0;
  readonly POSICION_SERVICIOS: number = 1;

  @ViewChild(OverlayPanel)
  overlayPanel: OverlayPanel | undefined;

  notaRemisionForm!: FormGroup;
  formatoGenerar: boolean = true;
  creacionRef!: DynamicDialogRef;
  idOds: number = 0;
  servicios: ArticulosServicios[] = [];

  alertas = JSON.parse(localStorage.getItem('mensajes') as string) || mensajes;

  constructor(
    public dialogService: DialogService,
    private formBuilder: FormBuilder,
    private alertaService: AlertaService,
    private router: Router,
    private route: ActivatedRoute,
    private activatedRoute: ActivatedRoute,
    private generarNotaRemisionService: GenerarNotaRemisionService,
    private descargaArchivosService: DescargaArchivosService,
    private readonly loaderService: LoaderService,
  ) { }

  ngOnInit(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    this.idOds = +this.route.snapshot.params?.idOds;

    if (!this.idOds) {
      this.cancelar();
    }

    const detalleOrdenServicio = respuesta[this.POSICION_DETALLE]?.datos[0];
    this.servicios = respuesta[this.POSICION_SERVICIOS]?.datos;
    this.inicializarNotaRemisionForm(detalleOrdenServicio);
  }

  inicializarNotaRemisionForm(detalle: DetalleNotaRemision) {
    this.notaRemisionForm = this.formBuilder.group({
      versionDocumento: [{ value: null, disabled: true }],
      fechaNota: [{ value: new Date(), disabled: true }],
      velatorioOrigen: [{ value: null, disabled: true }],
      folioNota: [{ value: null, disabled: true }],
      dirVelatorio: [{ value: null, disabled: true }],
      nomSolicitante: [{ value: null, disabled: true }],
      dirSolicitante: [{ value: null, disabled: true }],
      curpSolicitante: [{ value: null, disabled: true }],
      nomVelatorio: [{ value: null, disabled: true }],
      nomFinado: [{ value: null, disabled: true }],
      parFinado: [{ value: null, disabled: true }],
      folioODS: [{ value: null, disabled: true }],
      nombreConformidad: [{ value: null, disabled: true }],
      nombreRepresentante: [{ value: null, disabled: true }],
    });

    this.notaRemisionForm.patchValue({
      ...detalle,
      versionDocumento: "1.2",
    })
  }

  abrirModalGenerandoNotaRemision(): void {
    this.creacionRef = this.dialogService.open(ModalNotaRemisionComponent, {
      header: "Aviso",
      width: "920px",
      data: { mensaje: 'Generando nota de remisión' },
    });
  }

  regresar() {
    this.formatoGenerar = true;
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

  cancelar() {
    this.router.navigate(['/generar-nota-remision'], { relativeTo: this.activatedRoute });
  }

  generarNotaRemision() {
    this.abrirModalGenerandoNotaRemision();
    this.generarNotaRemisionService.guardar({ idOrden: 1 }).subscribe(
      (respuesta) => {
        this.creacionRef.close();
        const mensaje = this.alertas?.filter((msj: any) => {
          return msj.idMensaje == respuesta.mensaje;
        });
        if (mensaje && mensaje.length > 0) {
          this.alertaService.mostrar(TipoAlerta.Exito, mensaje[0].desMensaje);
        }
        this.router.navigate(['/generar-nota-remision'], { relativeTo: this.activatedRoute });
      },
      (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
        const mensaje = this.alertas.filter((msj: any) => {
          return msj.idMensaje == error?.error?.mensaje;
        })
        if (mensaje && mensaje.length > 0) {
          this.alertaService.mostrar(TipoAlerta.Error, mensaje[0].desMensaje);
        }
        this.creacionRef.close();
      }
    );
  }

  generarReporteOrdenServicio(tipoReporte: string): void {
    const configuracionArchivo: OpcionesArchivos = {};
    if (tipoReporte == "xls") {
      configuracionArchivo.ext = "xlsx"
    }

    this.loaderService.activar();
    const busqueda = this.filtrosArchivos(tipoReporte);

    this.descargaArchivosService.descargarArchivo(this.generarNotaRemisionService.generarReporteNotaRemision(busqueda), configuracionArchivo).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe(
      (respuesta) => {
        console.log(respuesta);
      },
      (error) => {
        console.log(error);
      },
    )
  }

  filtrosArchivos(tipoReporte: string): GenerarReporte {
    return {
      idNota: 0,
      idOrden: +this.f.folioODS.value,
      tipoReporte,
    }
  }

  get f() {
    return this.notaRemisionForm.controls;
  }

}
