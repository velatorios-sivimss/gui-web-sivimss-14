import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { OverlayPanel } from 'primeng/overlaypanel';
import { ModalEditarBeneficiarioComponent } from '../../../consulta-convenio-prevision-funeraria/pages/mi-convenio-prevision-funeraria/components/modal-editar-beneficiario/modal-editar-beneficiario.component';
import { ModalDesactivarBeneficiarioComponent } from '../../../mapa-contratar-convenio-prevision-funeraria/pages/contratar-convenio-prevision-funeraria/components/modal-desactivar-beneficiario/modal-desactivar-beneficiario.component';
import { ModalRegistrarBeneficiarioComponent } from '../../../mapa-contratar-convenio-prevision-funeraria/pages/contratar-convenio-prevision-funeraria/components/modal-registrar-beneficiario/modal-registrar-beneficiario.component';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { ContratarPSFPAService } from '../../services/contratar-psfpa.service';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { CATALOGO_NACIONALIDAD, CATALOGO_SEXO } from "projects/sivimss-gui/src/app/modules/contratantes/constants/catalogos-complementarios";
import { finalize } from 'rxjs/operators';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-contratar-plan-servicios-funerarios-pago-anticipado',
  templateUrl:
    './contratar-plan-servicios-funerarios-pago-anticipado.component.html',
  styleUrls: [
    './contratar-plan-servicios-funerarios-pago-anticipado.component.scss',
  ],
})
export class ContratarPlanServiciosFunerariosPagoAnticipadoComponent implements OnInit {
  @ViewChild('overlayPanel')
  overlayPanel!: OverlayPanel;

  readonly NOT_FOUND_RENAPO: string = "CURP no válido.";

  // dummyDropdown: { label: string; value: number }[] = [
  //   { label: 'Opción 1', value: 1 },
  //   { label: 'Opción 2', value: 2 },
  // ];

  form!: FormGroup;
  fechaActual: Date = new Date();
  beneficiarios = [];
  mostrarModalTipoArchivoIncorrecto: boolean = false;
  mostrarModalConfirmacionInformacionCapturada: boolean = false;
  ocultarBtnGuardar: boolean = false;
  mostrarModalValidacionRegistro: boolean = false;
  mostrarModalDesactivarBeneficiarioGrupo: boolean = false;
  TIPO_CONTRATACION_PERSONA: string = 'persona';
  tipoSexo: TipoDropdown[] = CATALOGO_SEXO;
  nacionalidad: TipoDropdown[] = CATALOGO_NACIONALIDAD;
  catalogoEstados: TipoDropdown[] = [];
  catalogoPaises: TipoDropdown[] = [];
  catPromotores: TipoDropdown[] = [];
  catColoniasTitular: TipoDropdown[] = [];
  catColoniasSubstituto: TipoDropdown[] = [];
  catColoniasBeneficiario1: TipoDropdown[] = [];
  catColoniasBeneficiario2: TipoDropdown[] = [];
  paquetes: any[] = [];
  catNumPagos: { label: string; value: number }[] = [
    { label: '1', value: 1 },
    { label: '3', value: 3 },
    { label: '6', value: 6 },
    { label: '9', value: 9 },
    { label: '12', value: 12 },
  ];
  idPaquete: string | null = null;
  velatorio: string = '';
  idVelatorio: number | null = null;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogService: DialogService,
    private readonly contratarPSFPAService: ContratarPSFPAService,
    private alertaService: AlertaService,
    private readonly loaderService: LoaderService,
    private rutaActiva: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.form = this.crearForm();
    this.obtenerPaises();
    this.obtenerEstados();
    this.obtenerPromotores();
    this.idVelatorio = this.rutaActiva.snapshot.queryParams.idVelatorio;
    this.velatorio = this.rutaActiva.snapshot.queryParams.velatorio;
  }

  crearForm(): FormGroup {
    return this.formBuilder.group({
      tipoContratacion: [
        {
          value: this.TIPO_CONTRATACION_PERSONA,
          disabled: false,
        },
        [Validators.nullValidator],
      ],
      datosPersonales: this.formBuilder.group({
        curp: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        rfc: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        matricula: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        nss: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        nombre: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        primerApellido: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        segundoApellido: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        sexo: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        otro: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        fechaNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        nacionalidad: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        paisNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        lugarNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        telefonoCelular: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        telefonoFijo: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        correoElectronico: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
      }),
      domicilio: this.formBuilder.group({
        calle: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        numeroExterior: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        numeroInterior: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        codigoPostal: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        asentamientoColonia: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        municipio: [
          {
            value: null,
            disabled: true,
          },
          [Validators.required],
        ],
        estado: [
          {
            value: null,
            disabled: true,
          },
          [Validators.required],
        ],
      }),
      datosPersonalesTitularSubstituto: this.formBuilder.group({
        sonDatosTitular: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        curp: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        rfc: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        matricula: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        nss: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],

        nombre: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        primerApellido: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        segundoApellido: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        sexo: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        otro: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        fechaNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        nacionalidad: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        paisNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        lugarNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        telefonoCelular: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        telefonoFijo: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        correoElectronico: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
      }),
      domicilioTitularSubstituto: this.formBuilder.group({
        calle: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        numeroExterior: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        numeroInterior: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        codigoPostal: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        asentamientoColonia: [
          {
            value: null,
            disabled: false,
          },
          [Validators.required],
        ],
        municipio: [
          {
            value: null,
            disabled: true,
          },
          [Validators.required],
        ],
        estado: [
          {
            value: null,
            disabled: true,
          },
          [Validators.required],
        ],
      }),
      datosPersonalesBeneficiario1: this.formBuilder.group({
        curp: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        rfc: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        matricula: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        nss: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        nombre: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        primerApellido: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        segundoApellido: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        sexo: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        otro: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        fechaNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        nacionalidad: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        paisNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        lugarNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        telefonoFijo: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        correoElectronico: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
      }),
      domicilioBeneficiario1: this.formBuilder.group({
        calle: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        numeroExterior: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        numeroInterior: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        codigoPostal: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        asentamientoColonia: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        municipio: [
          {
            value: null,
            disabled: true,
          },
          [Validators.nullValidator],
        ],
        estado: [
          {
            value: null,
            disabled: true,
          },
          [Validators.nullValidator],
        ],
      }),
      datosPersonalesBeneficiario2: this.formBuilder.group({
        curp: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        rfc: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        matricula: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        nss: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        nombre: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        primerApellido: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        segundoApellido: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        sexo: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        otro: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        fechaNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        nacionalidad: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        paisNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        lugarNacimiento: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        telefonoFijo: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        correoElectronico: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
      }),
      domicilioBeneficiario2: this.formBuilder.group({
        calle: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        numeroExterior: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        numeroInterior: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        codigoPostal: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        asentamientoColonia: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        municipio: [
          {
            value: null,
            disabled: true,
          },
          [Validators.nullValidator],
        ],
        estado: [
          {
            value: null,
            disabled: true,
          },
          [Validators.nullValidator],
        ],
      }),
      paquetes: this.formBuilder.group({
        paqueteEconomico: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        paqueteBasico: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
        paqueteCremacion: [
          {
            value: null,
            disabled: false,
          },
          [Validators.nullValidator],
        ],
      }),
      numeroPago: [
        {
          value: null,
          disabled: false,
        },
        [Validators.nullValidator],
      ],
      gestionadoPorPromotor: [
        {
          value: null,
          disabled: false,
        },
        [Validators.nullValidator],
      ],
      promotor: [
        {
          value: null,
          disabled: false,
        },
        [Validators.nullValidator],
      ],
    });
  }

  seleccionaPaquete(idPaquete: string): void {
    this.idPaquete = idPaquete;
  }

  obtenerEstados() {
    this.contratarPSFPAService.obtenerEstados()
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          this.catalogoEstados = mapearArregloTipoDropdown(respuesta.datos, "estado", "idEstado");
        },
        error: (error: HttpErrorResponse) => {
          console.error("ERROR: ", error);
        }
      });
  }

  obtenerPaises() {
    this.contratarPSFPAService.obtenerPaises()
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          this.catalogoPaises = mapearArregloTipoDropdown(respuesta.datos, "pais", "idPais");
        },
        error: (error: HttpErrorResponse) => {
          console.error("ERROR: ", error);
        }
      });
  }

  obtenerPromotores() {
    this.contratarPSFPAService.obtenerPaises()
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          this.catPromotores = mapearArregloTipoDropdown(respuesta.datos, "promotor", "idPromotor");
        },
        error: (error: HttpErrorResponse) => {
          console.error("ERROR: ", error);
        }
      });
  }

  abrirPanel(event: MouseEvent): void {
    this.overlayPanel.toggle(event);
  }

  obtenerCP(formGroupName?: any, catalogo?: string): void {
    if (!formGroupName.codigoPostal.value || formGroupName.codigoPostal.invalid) {
      this.setearCatalogoColonias(catalogo ?? '', []);
      formGroupName.estado.setValue(null);
      formGroupName.municipio.setValue(null);
      formGroupName.asentamientoColonia.markAsTouched();
      return
    }
    this.loaderService.activar();
    this.contratarPSFPAService.consutaCP(formGroupName.codigoPostal.value).pipe(
      finalize(() => this.loaderService.desactivar())
    ).subscribe({
      next: (respuesta: any) => {
        if (respuesta && respuesta.datos.length > 0) {
          this.setearCatalogoColonias(catalogo ?? '', mapearArregloTipoDropdown(respuesta.datos, 'nombre', 'nombre'));
          formGroupName.estado.setValue(respuesta.datos[0].municipio.entidadFederativa.nombre);
          formGroupName.municipio.setValue(respuesta.datos[0].municipio.nombre);
          formGroupName.asentamientoColonia.markAsTouched();
        } else {
          this.setearCatalogoColonias(catalogo ?? '', []);
          formGroupName.estado.setValue(null);
          formGroupName.municipio.setValue(null);
          formGroupName.asentamientoColonia.markAsTouched();
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error("ERROR: ", error);
      }
    });
  }

  setearCatalogoColonias(catalogo: string, datos: TipoDropdown[]): any {
    switch (catalogo) {
      case 'catColoniasTitular':
        this.catColoniasTitular = datos;
        break;
      case 'catColoniasSubstituto':
        this.catColoniasSubstituto = datos;
        break;
      case 'catColoniasBeneficiario1':
        this.catColoniasBeneficiario1 = datos;
        break;
      case 'catColoniasBeneficiario2':
        this.catColoniasBeneficiario2 = datos;
        break;
    }
  }

  validarCurp(formGroupName?: any) {
    if (formGroupName.curp.invalid) {
      if (formGroupName.curp.value !== '') {
        this.alertaService.mostrar(TipoAlerta.Precaucion, 'CURP no es válido.');
      }
    } else {
      this.contratarPSFPAService.validarCurpRfc({ rfc: null, curp: formGroupName.curp.value }).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          formGroupName.curp.setErrors({ 'incorrect': true });
          if (respuesta.mensaje === 'USUARIO REGISTRADO') {
            this.alertaService.mostrar(TipoAlerta.Precaucion, 'CURP ya se encuentra registrado.');
            formGroupName.curp.patchValue(null);
          } else if (respuesta.mensaje === 'NO EXISTE CURP') {
            this.alertaService.mostrar(TipoAlerta.Precaucion, this.NOT_FOUND_RENAPO);
          } else {
            formGroupName.curp.setErrors(null);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error("ERROR: ", error);
        }
      });
    }
  }

  validarRfc(formGroupName?: any) {
    if (formGroupName.rfc.value === '' || !formGroupName.rfc.value) {
      formGroupName.rfc.setErrors(null);
      formGroupName.rfc.clearValidators();
      formGroupName.rfc.updateValueAndValidity();
    } else {
      formGroupName.rfc.setValidators(Validators.maxLength(13));
      formGroupName.rfc.updateValueAndValidity();
      const regex: RegExp = new RegExp(/^([A-Z,Ñ&]{3,4}(\d{2})(0[1-9]|1[0-2])(0[1-9]|1\d|2\d|3[0-1])[A-Z|\d]{3})$/);
      if (!regex.test(formGroupName.rfc.value)) {
        this.alertaService.mostrar(TipoAlerta.Precaucion, 'R.F.C. no válido.');
        formGroupName.rfc.setErrors({ 'incorrect': true });
      } else {
        this.contratarPSFPAService.validarCurpRfc({ rfc: formGroupName.rfc.value, curp: null }).subscribe({
          next: (respuesta: HttpRespuesta<any>) => {
            formGroupName.rfc.setErrors({ 'incorrect': true });
            if (respuesta.mensaje === 'USUARIO REGISTRADO') {
              this.alertaService.mostrar(TipoAlerta.Precaucion, 'R.F.C ya se encuentra registrado.');
              formGroupName.rfc.patchValue(null);
            } else {
              formGroupName.rfc.setErrors(null);
            }
          },
          error: (error: HttpErrorResponse) => {
            console.error("ERROR: ", error);
          }
        });
      }
    }
  }

  cambioTipoSexo(formGroupName?: any) {
    formGroupName.otro.patchValue(null);
  }

  cambioNacionalidad(formGroupName?: any) {
    formGroupName.paisNacimiento.patchValue(null);
    formGroupName.lugarNacimiento.patchValue(null);
    if (formGroupName.nacionalidad.value === 1) {
      formGroupName.lugarNacimiento.setValidators(Validators.required);
      formGroupName.lugarNacimiento.updateValueAndValidity();
      formGroupName.paisNacimiento.setValue(119);
    } else {
      formGroupName.lugarNacimiento.clearValidators();
      formGroupName.lugarNacimiento.updateValueAndValidity();
    }
  }

  datosIguales(esIgual: boolean): void {
    if (!esIgual) {
      this.form.get('datosPersonalesTitularSubstituto')?.reset();
      this.form.get('domicilioTitularSubstituto')?.reset();
      this.form.get('datosPersonalesTitularSubstituto')?.get('sonDatosTitular')?.setValue(false);
      return
    }
    this.form.get('datosPersonalesTitularSubstituto')?.patchValue({
      ...this.form.get('datosPersonales')?.value
    });
    this.form.get('domicilioTitularSubstituto')?.patchValue({
      ...this.form.get('domicilio')?.value
    });
    this.obtenerCP(this.domicilioTitularSubstituto, 'catColoniasSubstituto');
  }

  guardar(): void {
    if (this.form.valid) {
      this.mostrarModalConfirmacionInformacionCapturada = true;
    }
    this.mostrarModalConfirmacionInformacionCapturada = true;
  }

  confirmarGuardar(): void {
    this.form.disable();
    this.ocultarBtnGuardar = true;
    this.mostrarModalValidacionRegistro = true;
  }

  get f() {
    return this.form.controls;
  }

  get datosPersonales() {
    return (this.form.controls['datosPersonales'] as FormGroup).controls;
  }

  get domicilio() {
    return (this.form.controls['domicilio'] as FormGroup).controls;
  }

  get datosPersonalesTitularSubstituto() {
    return (this.form.controls['datosPersonalesTitularSubstituto'] as FormGroup)
      .controls;
  }

  get domicilioTitularSubstituto() {
    return (this.form.controls['domicilioTitularSubstituto'] as FormGroup)
      .controls;
  }

  get datosPersonalesBeneficiario1() {
    return (this.form.controls['datosPersonalesBeneficiario1'] as FormGroup)
      .controls;
  }

  get domicilioBeneficiario1() {
    return (this.form.controls['domicilioBeneficiario1'] as FormGroup)
      .controls;
  }

  get datosPersonalesBeneficiario2() {
    return (this.form.controls['datosPersonalesBeneficiario2'] as FormGroup)
      .controls;
  }

  get domicilioBeneficiario2() {
    return (this.form.controls['domicilioBeneficiario2'] as FormGroup)
      .controls;
  }
}
