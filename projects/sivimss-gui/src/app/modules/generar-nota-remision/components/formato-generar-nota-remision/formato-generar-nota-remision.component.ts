import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OverlayPanel } from 'primeng/overlaypanel';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { ModalNotaRemisionComponent } from '../modal/modal-nota-remision/modal-nota-remision.component';
import { GenerarNotaRemisionService } from '../../services/generar-nota-remision.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-formato-generar-nota-remision',
  templateUrl: './formato-generar-nota-remision.component.html',
  styleUrls: ['./formato-generar-nota-remision.component.scss'],
  providers: [DynamicDialogConfig, DialogService],
})
export class FormatoGenerarNotaRemisionComponent implements OnInit {
  @ViewChild(OverlayPanel)
  overlayPanel: OverlayPanel | undefined;

  notaRemisionForm!: FormGroup;
  formatoGenerar: boolean = true;
  creacionRef!: DynamicDialogRef;

  constructor(
    public dialogService: DialogService,
    private formBuilder: FormBuilder,
    private alertaService: AlertaService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private generarNotaRemisionService: GenerarNotaRemisionService,
  ) { }

  ngOnInit(): void {
    this.inicializarNotaRemisionForm();
  }

  inicializarNotaRemisionForm() {
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
    });
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
  }

  generarNotaRemision() {
    this.abrirModalGenerandoNotaRemision();
    this.generarNotaRemisionService.guardar({ idOrden: 1 }).subscribe(
      (respuesta) => {
        if (respuesta && respuesta.codigo === 200) {
          this.creacionRef.close();
          this.alertaService.mostrar(TipoAlerta.Exito, 'Nota de remisión generada correctamente');
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
