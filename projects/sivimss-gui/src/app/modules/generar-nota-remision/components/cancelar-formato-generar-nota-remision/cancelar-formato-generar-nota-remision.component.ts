import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { ModalNotaRemisionComponent } from '../modal/modal-nota-remision/modal-nota-remision.component';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GenerarNotaRemisionService } from '../../services/generar-nota-remision.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-cancelar-formato-generar-nota-remision',
  templateUrl: './cancelar-formato-generar-nota-remision.component.html',
  styleUrls: ['./cancelar-formato-generar-nota-remision.component.scss'],
  providers: [DynamicDialogConfig, DialogService],
})

export class CancelarFormatoGenerarNotaRemisionComponent implements OnInit {
  readonly POSICION_DETALLE: number = 0;
  readonly POSICION_SERVICIOS: number = 1;

  @Input() confirmarCancelacion: boolean = false;

  notaRemisionForm!: FormGroup;
  creacionRef!: DynamicDialogRef;
  idNota: number = 0;
  idOds: number = 0;

  constructor(
    private route: ActivatedRoute,
    public dialogService: DialogService,
    private formBuilder: FormBuilder,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private alertaService: AlertaService,
    private generarNotaRemisionService: GenerarNotaRemisionService,
  ) { }

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    this.idNota = +this.route.snapshot.params?.idNota;
    this.idOds = +this.route.snapshot.params?.idOds;

    if (!this.idNota || !this.idOds) {
      this.btnAceptarDetalle();
    }
    const detalleNotaRemision = respuesta[this.POSICION_DETALLE].datos;
    const serviciosNotaRemision = respuesta[this.POSICION_SERVICIOS].datos;
    this.inicializarNotaRemisionForm(detalleNotaRemision, serviciosNotaRemision);
  }

  inicializarNotaRemisionForm(detalle: any, servicios: any) {
    this.notaRemisionForm = this.formBuilder.group({
      versionDocumento: [{ value: "1.2", disabled: true }],
      fecha: [{ value: new Date(), disabled: true }],
      velatorio: [{ value: 'No. 22 Villahermosa', disabled: true }],
      remisionServicios: [{ value: 'DOC-000001', disabled: true }],
      direccion: [{ value: 'Prolongación Av. México No. 1203, Col. Sabina, C.P. 86153, Villahermosa, San Luis Potosí.', disabled: true }],
      nombreSolicitante: [{ value: 'Miranda Fernendez Guisa', disabled: true }],
      direccionSolicitante: [{ value: 'Av. Congreso de la Unión, Iztacalco, CP 201, CDMX', disabled: true }],
      curpSolicitante: [{ value: 'FEGM560117MDFMPRO7', disabled: true }],
      velatorioSolicitante: [{ value: 'No. 22 Villahermosa', disabled: true }],
      finado: [{ value: 'Pedro Lomas Morales', disabled: true }],
      parentesco: [{ value: 'Abuelo', disabled: true }],
      folioOds: [{ value: 'DOC-000001', disabled: true }],
      nombreConformidad: [{ value: null, disabled: true }],
      nombreRepresentante: [{ value: null, disabled: true }],
      motivoCancelacion: [{ value: null, disabled: false }, Validators.required],
    });

    this.notaRemisionForm.markAllAsTouched();
  }

  regresar() {
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }

  abrirModalCancelandoNotaRemision(): void {
    this.creacionRef = this.dialogService.open(ModalNotaRemisionComponent, {
      header: "Aviso",
      width: "920px",
      data: { mensaje: 'Cancelando nota de remisión' },
    });
  }

  cancelarNotaRemision() {
    if (!this.confirmarCancelacion) {
      this.confirmarCancelacion = true;
    } else {
      this.abrirModalCancelandoNotaRemision();
      let obj = {
        idNota: this.idNota,
        idOrden: this.idOds,
        motivo: this.f.motivoCancelacion.value
      }
      this.generarNotaRemisionService.cancelarNotaRemision(obj).subscribe(
        (respuesta) => {
          if (respuesta && respuesta.codigo === 200) {
            this.creacionRef.close();
            this.alertaService.mostrar(TipoAlerta.Exito, 'Nota de remisión cancelada correctamente');
            this.router.navigate(['/generar-nota-remision'], { relativeTo: this.activatedRoute });
          }
        },
        (error: HttpErrorResponse) => {
          console.error(error);
          this.creacionRef.close();
        }
      );
    }
  }

  btnAceptarDetalle() {
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }

  get f() {
    return this.notaRemisionForm?.controls;
  }
}
