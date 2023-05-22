import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { ModalNotaRemisionComponent } from '../modal/modal-nota-remision/modal-nota-remision.component';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GenerarNotaRemisionService } from '../../services/generar-nota-remision.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ArticulosServicios, DetalleNotaRemision } from '../../models/nota-remision.interface';
import { mensajes } from '../../../reservar-salas/constants/mensajes';

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

  creacionRef!: DynamicDialogRef;
  idNota: number = 0;
  idOds: number = 0;
  datos!: DetalleNotaRemision;
  servicios: ArticulosServicios[] = [];
  cancelarRemisionForm!: FormGroup;

  alertas = JSON.parse(localStorage.getItem('mensajes') as string) || mensajes;

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
    this.inicializarCancelarRemisionForm();
  }

  cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    this.idNota = +this.route.snapshot.params?.idNota;
    this.idOds = +this.route.snapshot.params?.idOds;

    if (!this.idNota || !this.idOds) {
      this.btnAceptarDetalle();
    }

    this.datos = respuesta[this.POSICION_DETALLE]?.datos[0];
    this.servicios = respuesta[this.POSICION_SERVICIOS]?.datos;
  }

  inicializarCancelarRemisionForm() {
    this.cancelarRemisionForm = this.formBuilder.group({
      motivoCancelacion: [{ value: null, disabled: false }, [Validators.maxLength(50), Validators.required]]
    });
  }

  regresar() {
    this.router.navigate(['/generar-nota-remision'], { relativeTo: this.activatedRoute });
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
            return msj.idMensaje == error.error.mensaje;
          })
          if (mensaje && mensaje.length > 0) {
            this.alertaService.mostrar(TipoAlerta.Error, mensaje[0].desMensaje);
          }
          this.creacionRef.close();
        }
      );
    }
  }

  btnAceptarDetalle() {
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }

  get f() {
    return this.cancelarRemisionForm.controls;
  }
}
