import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute} from '@angular/router';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {OverlayPanel} from "primeng/overlaypanel";
import {DiasDescanso, Promotor} from '../../models/promotores.interface';
import {CURP} from 'projects/sivimss-gui/src/app/utils/regex';
import {mapearArregloTipoDropdown} from 'projects/sivimss-gui/src/app/utils/funciones';
import {TipoDropdown} from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import * as moment from 'moment';
import {UsuarioService} from '../../../usuarios/services/usuario.service';
import {LoaderService} from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import {MensajesSistemaService} from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import {PromotoresService} from '../../services/promotores.service';
import {finalize} from 'rxjs';
import {HttpRespuesta} from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import {HttpErrorResponse} from '@angular/common/http';

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
  readonly POSICION_CATALOGOS_ENTIDADES: number = 3;
  readonly NOT_FOUND_RENAPO: string = "CURP no válido.";

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  public promotor!: Promotor;
  public catalogoVelatorios: TipoDropdown[] = [];
  public entidadFederativa: TipoDropdown[] = [];
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
            this.promotor.promotorDiasDescanso?.forEach((element: DiasDescanso) => {
              arraydiasDescanso.push(new Date(moment(element.fecDescanso, 'DD/MM/YYYY').format('YYYY/MM/DD')));
            });

            this.modificarPromotorForm.patchValue({
              ...this.promotor,
              id: this.promotor.idPromotor,
              velatorio: this.promotor.idVelatorio,
              entidadFederativa: this.promotor.idLugarNac,
              fechaNacimiento: this.promotor.fecNac ? new Date(moment(this.promotor.fecNac, 'DD/MM/YYYY').format('YYYY/MM/DD')) : null,
              fechaIngreso: this.promotor.fecIngreso ? new Date(moment(this.promotor.fecIngreso, 'DD/MM/YYYY').format('YYYY/MM/DD')) : null,
              fechaBaja: this.promotor.fecBaja ? new Date(moment(this.promotor.fecBaja, 'DD/MM/YYYY').format('YYYY/MM/DD')) : null,
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
      id: [{value: null, disabled: true}],
      numEmpleado: [{value: null, disabled: true}, [Validators.maxLength(10), Validators.required]],
      curp: [{value: null, disabled: true}, [Validators.maxLength(18), Validators.required, Validators.pattern(CURP)]],
      nombre: [{value: null, disabled: true}, [Validators.maxLength(30), Validators.required]],
      primerApellido: [{value: null, disabled: true}, [Validators.maxLength(20), Validators.required]],
      segundoApellido: [{value: null, disabled: true}, [Validators.maxLength(20), Validators.required]],
      fechaNacimiento: [{value: null, disabled: true}, Validators.required],
      entidadFederativa: [{value: null, disabled: true}, Validators.required],
      fechaIngreso: [{value: null, disabled: false}, Validators.required],
      fechaBaja: [{value: null, disabled: true}],
      sueldoBase: [{value: null, disabled: false}, [Validators.maxLength(10), Validators.required]],
      velatorio: [{value: null, disabled: false}, [Validators.required]],
      categoria: [{value: null, disabled: false}, [Validators.maxLength(20)]],
      antiguedad: [{value: null, disabled: true}, [Validators.maxLength(50)]],
      correo: [{
        value: null,
        disabled: false
      }, [Validators.maxLength(30), Validators.pattern('[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}')]],
      puesto: [{value: null, disabled: false}, [Validators.maxLength(20), Validators.required]],
      diasDescanso: [{value: null, disabled: false}, []],
      estatus: [{value: true, disabled: true}, []],
    });
  }

  cargarCatalogo(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta[this.POSICION_CATALOGO_VELATORIO].datos, "velatorio", "idVelatorio");
    this.entidadFederativa = respuesta[this.POSICION_CATALOGOS_ENTIDADES];
  }

  cerrarDialogo() {
    this.ref.close();
  }

  confirmarGuardar() {
    this.modificarPromotorForm.markAllAsTouched();
    if (this.modificarPromotorForm.invalid) return;
    this.modificarPromotorForm.markAsDirty();
    this.mostrarModalConfirmacion = true;
    this.mensajeModal = `¿Está seguro de modificar el Promotor?`;
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
          this.alertaService.mostrar(TipoAlerta.Exito, `Agregado correctamente Promotor.`);
          this.ref.close({estatus: true});
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
    let fecPromotorDiasDescanso: DiasDescanso[] = [];
    if (this.promotor.promotorDiasDescanso && this.promotor.promotorDiasDescanso.length > 0) {
      let diasDescansoTemp: string[] = [];
      this.mpf.diasDescanso.value?.forEach((fecha: Object) => diasDescansoTemp.push(moment(fecha).format('DD/MM/YYYY')));
      this.promotor.promotorDiasDescanso.forEach((promotorDiaDescanso: DiasDescanso) => {
        let foundIndex = diasDescansoTemp.findIndex((diaDescanso: string) => diaDescanso === promotorDiaDescanso.fecDescanso);
        if (foundIndex > -1) {
          fecPromotorDiasDescanso.push({
            id: promotorDiaDescanso.id,
            fecDescanso: promotorDiaDescanso.fecDescanso,
            estatus: 1
          });
          diasDescansoTemp.splice(foundIndex, 1);
        } else {
          fecPromotorDiasDescanso.push({
            id: promotorDiaDescanso.id,
            fecDescanso: promotorDiaDescanso.fecDescanso,
            estatus: 0
          });
        }
      });

      if (diasDescansoTemp.length > 0) {
        diasDescansoTemp.forEach((diaDescanso: string) => {
          fecPromotorDiasDescanso.push({id: null, fecDescanso: diaDescanso, estatus: null});
        });
      }
    } else {
      this.mpf.diasDescanso.value?.forEach((diaDescanso: string) => {
        fecPromotorDiasDescanso.push({id: null, fecDescanso: moment(diaDescanso).format('DD/MM/YYYY'), estatus: null});
      });
    }

    return {
      idPromotor: this.promotor.idPromotor,
      correo: this.mpf.correo.value.trim(),
      puesto: this.mpf.puesto.value.trim(),
      categoria: this.mpf.categoria.value.trim(),
      fecIngreso: this.mpf.fechaIngreso.value ? moment(this.mpf.fechaIngreso.value).format('DD/MM/YYYY') : null,
      sueldoBase: +this.mpf.sueldoBase.value,
      idVelatorio: this.mpf.velatorio.value,
      fecPromotorDiasDescanso,
      estatus: this.mpf.estatus.value ? 1 : 0,
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
          this.mpf.curp.setErrors({'incorrect': true});
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
        this.mpf.curp.setErrors({'incorrect': true});
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
