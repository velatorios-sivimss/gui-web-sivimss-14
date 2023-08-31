import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BreadcrumbService } from "../../../../shared/breadcrumb/services/breadcrumb.service";
import { AlertaService, TipoAlerta } from "../../../../shared/alerta/services/alerta.service";
import { OverlayPanel } from "primeng/overlaypanel";
import { DiasDescanso, Promotor } from '../../models/promotores.interface';
import { CURP } from 'projects/sivimss-gui/src/app/utils/regex';
import { UsuarioService } from '../../../usuarios/services/usuario.service';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { finalize } from 'rxjs';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import * as moment from 'moment';
import { PromotoresService } from '../../services/promotores.service';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';

interface HttpResponse {
  respuesta: string;
  promotor: Promotor;
}

@Component({
  selector: 'app-agregar-promotores',
  templateUrl: './agregar-promotores.component.html',
  styleUrls: ['./agregar-promotores.component.scss'],
  providers: [DialogService]
})
export class AgregarPromotoresComponent implements OnInit {
  readonly POSICION_CATALOGO_VELATORIO: number = 2;
  readonly POSICION_CATALOGOS_ENTIDADES: number = 3;
  readonly NOT_FOUND_RENAPO: string = "CURP no válido.";
  readonly HREF_RENAPO: string = "https://www.gob.mx/curp/";

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  public catalogoVelatorios: TipoDropdown[] = [];
  public entidadFederativa: TipoDropdown[] = [];
  public tipoArticulos: any[] = [];
  public tituloEliminar: string = '';
  public intentoPorGuardar: boolean = false;
  public agregarPromotorForm!: FormGroup;
  public mostrarModalConfirmacion: boolean = false;
  public mostrarModalPromotorDuplicado: boolean = false;
  public mensajeModal: string = "";

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private route: ActivatedRoute,
    public ref: DynamicDialogRef,
    private usuarioService: UsuarioService,
    private loaderService: LoaderService,
    private alertaService: AlertaService,
    private mensajesSistemaService: MensajesSistemaService,
    private promotoresService: PromotoresService,
  ) {
  }

  ngOnInit(): void {
    this.inicializarAgregarPromotorForm();
    this.cargarCatalogo();
  }

  inicializarAgregarPromotorForm() {
    this.agregarPromotorForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      numEmpleado: [{ value: null, disabled: false }, [Validators.maxLength(10), Validators.required]],
      curp: [{ value: null, disabled: false }, [Validators.maxLength(18), Validators.required, Validators.pattern(CURP)]],
      nombre: [{ value: null, disabled: true }, [Validators.maxLength(30), Validators.required]],
      primerApellido: [{ value: null, disabled: true }, [Validators.maxLength(20), Validators.required]],
      segundoApellido: [{ value: null, disabled: true }, [Validators.maxLength(20), Validators.required]],
      fechaNacimiento: [{ value: null, disabled: false }],
      entidadFederativa: [{ value: null, disabled: false }, Validators.required],
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
    this.entidadFederativa = respuesta[this.POSICION_CATALOGOS_ENTIDADES];
  }

  cerrarDialogo() {
    this.ref.close();
  }

  confirmarGuardar() {
    this.agregarPromotorForm.markAllAsTouched();
    if (this.agregarPromotorForm.invalid) return;
    this.mostrarModalConfirmacion = true;
    this.mensajeModal = `¿Estás seguro de agregar este nuevo registro? Promotor`;
  }

  guardarPromotor() {
    this.loaderService.activar();
    this.promotoresService.guardar(this.datosGuardar()).pipe(
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

  datosGuardar() {
    let fecPromotorDiasDescanso: DiasDescanso[] = [];
    this.apf.diasDescanso.value?.forEach((element: Object) => {
      fecPromotorDiasDescanso.push({ id: null, fecDescanso: moment(element).format('DD/MM/YYYY') });

    });
    return {
      curp: this.apf.curp.value,
      nomPromotor: this.apf.nombre.value,
      aPaterno: this.apf.primerApellido.value,
      aMaterno: this.apf.segundoApellido.value,
      fecNac: this.apf.fechaNacimiento.value,
      idLugarNac: this.apf.entidadFederativa.value,
      correo: this.apf.correo.value,
      numEmpleado: this.apf.numEmpleado.value,
      puesto: this.apf.puesto.value,
      categoria: this.apf.categoria.value,
      fecIngreso: moment(this.apf.fechaIngreso.value).format('DD/MM/YYYY'),
      sueldoBase: +this.apf.sueldoBase.value,
      idVelatorio: this.apf.velatorio.value,
      fecPromotorDiasDescanso,
    }
  }

  validarCurpRenapo(): void {
    if (this.apf.curp.invalid) return;
    this.loaderService.activar();
    this.limpiarCamposRenapo();
    this.usuarioService.consultarCurpRenapo(this.apf.curp.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        if (respuesta.datos?.message !== '') {
          this.alertaService.mostrar(TipoAlerta.Precaucion, this.NOT_FOUND_RENAPO);
          this.apf.curp.setErrors({ 'incorrect': true });
        } else {
          this.apf.curp.setErrors(null);
          this.apf.nombre.setValue(respuesta.datos?.nombre);
          this.apf.primerApellido.setValue(respuesta.datos?.apellido1);
          this.apf.segundoApellido.setValue(respuesta.datos?.apellido2);
        }
      },
      error: (error: HttpErrorResponse): void => {
        console.error("ERROR: ", error);
        this.apf.curp.setErrors({ 'incorrect': true });
      }
    });
  }

  limpiarCamposRenapo() {
    this.apf.nombre.setValue(null);
    this.apf.primerApellido.setValue(null);
    this.apf.segundoApellido.setValue(null);
  }

  handleFechaIngreso() {
    const monthDiff = moment().month() - moment(this.apf.fechaIngreso.value).month();
    const yearDiff = moment().year() - moment(this.apf.fechaIngreso.value).year();
    if (yearDiff < 1) {
      this.apf.antiguedad.setValue(`${monthDiff} ${monthDiff > 0 && monthDiff < 10 ? 'mes' : 'meses'}`);
    } else {
      this.apf.antiguedad.setValue(`${yearDiff} ${yearDiff < 2 ? 'año' : 'años'}`);
    }
  }

  get apf() {
    return this.agregarPromotorForm.controls;
  }
}
