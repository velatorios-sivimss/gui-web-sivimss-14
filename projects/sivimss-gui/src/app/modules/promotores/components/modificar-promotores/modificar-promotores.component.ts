import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { OverlayPanel } from "primeng/overlaypanel";
import { VerDetallePromotoresComponent } from '../ver-detalle-promotores/ver-detalle-promotores.component';
import { Promotor } from '../../models/promotores.interface';
import { Accion } from 'projects/sivimss-gui/src/app/utils/constantes';
import { CURP, EMAIL } from 'projects/sivimss-gui/src/app/utils/regex';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import * as moment from 'moment';
import { UsuarioService } from '../../../usuarios/services/usuario.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { PromotoresService } from '../../services/promotores.service';
import { finalize } from 'rxjs';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';

interface HttpResponse {
  respuesta: string;
  promotor: Promotor;
}

@Component({
  selector: 'app-modificar-promotores',
  templateUrl: './modificar-promotores.component.html',
  styleUrls: ['./modificar-promotores.component.scss'],
  providers: [DialogService]
})
export class ModificarPromotoresComponent implements OnInit {

  readonly POSICION_CATALOGO_VELATORIO: number = 2;
  readonly NOT_FOUND_RENAPO: string = "CURP no válido.";

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  public promotor!: Promotor;
  public catalogoVelatorios: TipoDropdown[] = [];
  public modificarPromotorForm!: FormGroup;
  public mostrarModalConfirmacion: boolean = false;
  public mostrarModalPromotorDuplicado: boolean = false;
  public mensajeModal: string = "";

  constructor(
    private formBuilder: FormBuilder,
    public dialogService: DialogService,
    private route: ActivatedRoute,
    public ref: DynamicDialogRef,
    private usuarioService: UsuarioService,
    private loaderService: LoaderService,
    private alertaService: AlertaService,
    private mensajesSistemaService: MensajesSistemaService,
    private promotoresService: PromotoresService,
    public config: DynamicDialogConfig,
  ) {
  }

  ngOnInit(): void {
    this.inicializarModificarPromotorForm();
    if (this.config?.data) {
      this.promotor = this.config.data.promotor;
      this.obtenerDetallePromotor();
      this.cargarCatalogo();
    }
  }

  obtenerDetallePromotor() {
    if (this.promotor.idPromotor) {
      this.promotoresService.obtenerDetallePromotor(this.promotor.idPromotor).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.codigo === 200) {
            this.promotor = respuesta?.datos || [];

            let arraydiasDescanso: Date[] = [];
            this.promotor.promotorDiasDescanso?.forEach((element: any) => {
              arraydiasDescanso.push(new Date(moment(element.fecDescanso, 'DD/MM/YYYY').format('YYYY/MM/DD')));
            });

            this.modificarPromotorForm.patchValue({
              ...this.promotor,
              id: this.promotor.idPromotor,
              velatorio: this.promotor.idVelatorio,
              fechaNacimiento: new Date(moment(this.promotor.fecBaja, 'DD/MM/YYYY').format('YYYY/MM/DD')),
              fechaIngreso: new Date(moment(this.promotor.fecNac, 'DD/MM/YYYY').format('YYYY/MM/DD')),
              fechaBaja: new Date(moment(this.promotor.fecIngreso, 'DD/MM/YYYY').format('YYYY/MM/DD')),
              diasDescanso: arraydiasDescanso,
            });
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        }
      });
    }
  }

  inicializarModificarPromotorForm() {
    this.modificarPromotorForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      numEmpleado: [{ value: null, disabled: true }, [Validators.maxLength(10), Validators.required]],
      curp: [{ value: null, disabled: true }, [Validators.maxLength(18), Validators.required, Validators.pattern(CURP)]],
      nombre: [{ value: null, disabled: true }, [Validators.maxLength(30), Validators.required]],
      primerApellido: [{ value: null, disabled: true }, [Validators.maxLength(20), Validators.required]],
      segundoApellido: [{ value: null, disabled: true }, [Validators.maxLength(20), Validators.required]],
      fechaNacimiento: [{ value: null, disabled: true }, Validators.required],
      fechaIngreso: [{ value: null, disabled: false }, Validators.required],
      fechaBaja: [{ value: null, disabled: true }],
      sueldoBase: [{ value: null, disabled: false }, [Validators.maxLength(10), Validators.required]],
      velatorio: [{ value: null, disabled: false }, [Validators.required]],
      categoria: [{ value: null, disabled: false }, [Validators.maxLength(20)]],
      antiguedad: [{ value: null, disabled: true }, [Validators.maxLength(50)]],
      correo: [{ value: null, disabled: false }, [Validators.maxLength(30), Validators.pattern('[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}')]],
      puesto: [{ value: null, disabled: false }, [Validators.maxLength(20), Validators.required]],
      diasDescanso: [{ value: null, disabled: false }, []],
      estatus: [{ value: true, disabled: true }, []],
    });
  }

  cargarCatalogo(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta[this.POSICION_CATALOGO_VELATORIO].datos, "velatorio", "idVelatorio");
  }
  cerrarDialogo() {
    this.ref.close();
  }

  confirmarGuardar() {
    this.modificarPromotorForm.markAllAsTouched();
    if (this.modificarPromotorForm.invalid) return;
    this.mostrarModalConfirmacion = true;
    this.mensajeModal = `¿Estás seguro de modificar el registro? Promotor`;
  }

  guardarPromotor() {
    this.loaderService.activar();
    this.promotoresService.actualizar(this.datosModificar()).pipe(
      finalize(() => {
        this.mostrarModalConfirmacion = false;
        this.loaderService.desactivar()
      })
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.codigo === 200 && !respuesta.error) {
          this.alertaService.mostrar(TipoAlerta.Exito, `Agregado correctamente. Promotor`);
          this.ref.close({ estatus: true });
        } else {
          this.mensajeModal = this.mensajesSistemaService.obtenerMensajeSistemaPorId(+respuesta.mensaje);
          this.mostrarModalPromotorDuplicado = true;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error, 'Error al guardar la información. Intenta nuevamente.');
      }
    });
  }

  datosModificar() {
    let fecPromotorDiasDescanso: string[] = [];
    this.mpf.diasDescanso.value?.forEach((element: Object) => {
      fecPromotorDiasDescanso.push(moment(element).format('DD/MM/YYYY'));

    });
    return {
      curp: this.mpf.curp.value,
      nomPromotor: this.mpf.nombre.value,
      aPaterno: this.mpf.primerApellido.value,
      aMaterno: this.mpf.segundoApellido.value,
      fecNac: this.mpf.fechaNacimiento.value ? moment(this.mpf.fechaNacimiento.value).format('DD/MM/YYYY') : null,
      correo: this.mpf.correo.value,
      numEmpleado: this.mpf.numEmpleado.value,
      puesto: this.mpf.puesto.value,
      categoria: this.mpf.categoria.value,
      fecIngreso: this.mpf.fechaIngreso.value ? moment(this.mpf.fechaIngreso.value).format('DD/MM/YYYY') : null,
      fecBaja: this.mpf.fechaBaja.value ? moment(this.mpf.fechaBaja.value).format('DD/MM/YYYY') : null,
      sueldoBase: this.mpf.sueldoBase.value,
      idVelatorio: this.mpf.velatorio.value,
      fecPromotorDiasDescanso,
    }
  }

  validarCurpRenapo(): void {
    if (this.mpf.curp.invalid) return;
    this.loaderService.activar();
    this.limpiarCamposRenapo();
    this.usuarioService.consultarCurpRenapo(this.mpf.curp.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        if (respuesta.datos?.message !== '') {
          this.alertaService.mostrar(TipoAlerta.Precaucion, this.NOT_FOUND_RENAPO);
          this.mpf.curp.setErrors({ 'incorrect': true });
        } else {
          this.mpf.curp.setErrors(null);
          this.mpf.nombre.setValue(respuesta.datos?.nombre);
          this.mpf.primerApellido.setValue(respuesta.datos?.apellido1);
          this.mpf.segundoApellido.setValue(respuesta.datos?.apellido2);
          this.mpf.fechaNacimiento.setValue(respuesta.datos?.fechNac);
        }
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
        this.mpf.curp.setErrors({ 'incorrect': true });
      }
    });
  }

  limpiarCamposRenapo() {
    this.mpf.nombre.setValue(null);
    this.mpf.primerApellido.setValue(null);
    this.mpf.segundoApellido.setValue(null);
    this.mpf.fechaNacimiento.setValue(null);
  }

  handleFechaIngreso() {
    const monthDiff = moment().month() - moment(this.mpf.fechaIngreso.value).month();
    const yearDiff = moment().year() - moment(this.mpf.fechaIngreso.value).year();
    if (yearDiff < 1) {
      this.mpf.antiguedad.setValue(`${monthDiff} ${monthDiff > 0 && monthDiff < 10 ? 'mes' : 'meses'}`);
    } else {
      this.mpf.antiguedad.setValue(`${yearDiff} ${yearDiff < 2 ? 'año' : 'años'}`);
    }
  }

  get mpf() {
    return this.modificarPromotorForm.controls;
  }
}
