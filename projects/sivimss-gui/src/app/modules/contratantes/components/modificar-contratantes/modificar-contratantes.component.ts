import { Component, Input, OnInit } from '@angular/core';
import { ConfirmationService, MenuItem } from "primeng/api";
import { MENU_STEPPER } from "../../constants/menu-steppers";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { TipoCatalogo, UsuarioContratante, ValorCP } from "../../models/usuario-contratante.interface";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { TipoDropdown } from "../../../../models/tipo-dropdown";
import { ContratantesService } from '../../services/contratantes.service';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import * as moment from 'moment';
import { TIPO_SEXO, CATALOGO_NACIONALIDAD, CATALOGO_SEXO } from '../../constants/catalogos-complementarios';
import { LoaderService } from 'projects/sivimss-gui/src/app/shared/loader/services/loader.service';
import { MensajesSistemaService } from 'projects/sivimss-gui/src/app/services/mensajes-sistema.service';
import { finalize } from 'rxjs';
import { mapearArregloTipoDropdown } from 'projects/sivimss-gui/src/app/utils/funciones';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-modificar-contratantes',
  templateUrl: './modificar-contratantes.component.html',
  styleUrls: ['./modificar-contratantes.component.scss'],
  providers: [DatePipe, ConfirmationService]
})
export class ModificarContratantesComponent implements OnInit {
  readonly ID_CATALOGO_PAISES: number = 1;
  readonly ID_CATALOGO_ESTADOS: number = 2;

  @Input() contratante!: UsuarioContratante;
  @Input() origen!: string;

  contratanteModificado: UsuarioContratante = {};
  mensajeRegistroDuplicado: string | undefined;
  menuStep: MenuItem[] = MENU_STEPPER;
  indice: number = 0;
  vistaConfirmarCambio: boolean = false;
  datosGeneralesForm!: FormGroup;
  domicilioForm!: FormGroup;
  colonias: TipoDropdown[] = [];
  tipoSexo: TipoDropdown[] = CATALOGO_SEXO;
  nacionalidad: TipoDropdown[] = CATALOGO_NACIONALIDAD;
  catalogoEstados: TipoDropdown[] = [];
  catalogoPaises: TipoDropdown[] = [];

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private formBuilder: FormBuilder,
    private contratantesService: ContratantesService,
    private alertaService: AlertaService,
    private loaderService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService,
    private datePipe: DatePipe,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit(): void {
    if (this.config?.data) {
      this.contratante = this.config.data.contratante;
      this.obtenerDetalleContratante();
    }
  }

  modalRegistroDuplicado() {
    this.confirmationService.confirm({
      message: this.mensajeRegistroDuplicado,
      accept: () => { },
    });
  }

  obtenerDetalleContratante() {
    if (this.contratante.idContratante) {
      this.contratantesService.obtenerDetalleContratante(this.contratante.idContratante).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta.codigo === 200) {
            this.contratante = respuesta?.datos[0] || [];
            this.incializarDatosGeneralesForm(this.contratante);
            this.inicializarDomicilioForm(this.contratante);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        }
      });
    }
  }

  incializarDatosGeneralesForm(contratante: UsuarioContratante): void {
    let fechaNacimiento = moment(contratante.fecNacimiento, 'DD-MM-YYYY').format('YYYY-MM-DD');
    this.datosGeneralesForm = this.formBuilder.group({
      curp: [{ value: contratante.curp, disabled: true }, []],
      rfc: [{ value: contratante.rfc, disabled: false }, [Validators.maxLength(13)]],
      nss: [{ value: contratante.nss, disabled: true }, []],
      nombre: [{ value: contratante.nombre, disabled: false }, [Validators.maxLength(30)]],
      paterno: [{ value: contratante.paterno, disabled: false }, [Validators.maxLength(30)]],
      materno: [{ value: contratante.materno, disabled: false }, [Validators.maxLength(30)]],
      numSexo: [{ value: this.contratante.numSexo, disabled: false }, []],
      otroSexo: [{ value: this.contratante.sexo, disabled: false }, [Validators.maxLength(15)]],
      fecNacimiento: [{ value: new Date(this.diferenciaUTC(fechaNacimiento)), disabled: false }, []],
      nacionalidad: [{
        value: String(contratante.nacionalidad).toLocaleLowerCase() === 'mexicana' ? 1 : 2,
        disabled: false
      }, []],
      idEstado: [{ value: contratante.idEstado, disabled: false }, []],
      idPais: [{ value: contratante.idPais, disabled: false }, []],
      telefono: [{ value: contratante.telefono, disabled: false }, [Validators.maxLength(10)]],
      correo: [{ value: contratante.correo, disabled: false }, [Validators.email]]
    });
    if (this.dgf.nacionalidad.value === 1) {
      this.obtenerEstadosPaises(this.ID_CATALOGO_ESTADOS);
    } else {
      this.obtenerEstadosPaises(this.ID_CATALOGO_PAISES);
    }
  }

  inicializarDomicilioForm(contratante: UsuarioContratante): void {
    this.domicilioForm = this.formBuilder.group({
      cp: [{ value: contratante.cp, disabled: false }, [Validators.maxLength(5)]],
      calle: [{ value: contratante.calle, disabled: false }, [Validators.maxLength(30)]],
      numExt: [{ value: contratante.numExt, disabled: false }, [Validators.maxLength(10)]],
      numInt: [{ value: contratante.numInt, disabled: false }, [Validators.maxLength(10)]],
      colonia: [{ value: contratante.colonia, disabled: false }, []],
      municipio: [{ value: contratante.municipio, disabled: true }, []],
      estado: [{ value: contratante.estado, disabled: true }, []],
      estatus: [{ value: contratante.estatus, disabled: false }, []],
    });

    this.obtenerCP();
  }

  diferenciaUTC(fecha: string) {
    let objetoFecha = new Date(fecha);
    return objetoFecha.setMinutes(objetoFecha.getMinutes() + objetoFecha.getTimezoneOffset());
  }

  obtenerEstadosPaises(idCatalogo: number) {
    this.contratantesService.consultarCatalogo({ idCatalogo })
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (idCatalogo === 2) {
            this.catalogoEstados = mapearArregloTipoDropdown(respuesta.datos, "estado", "id");
          } else {
            this.catalogoPaises = mapearArregloTipoDropdown(respuesta.datos, "pais", "id");
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error("ERROR: ", error);
        }
      });
  }

  obtenerCP(): void {
    if (!this.df.cp?.value) return;
    this.loaderService.activar();
    let datos: TipoCatalogo = {
      idCatalogo: 3,
      cp: +this.df.cp?.value,
    }
    this.contratantesService.consultarCatalogo(datos)
      .pipe(finalize(() => this.loaderService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          const { datos } = respuesta;
          if (datos.length === 0 || !datos) {
            this.limpiarCP();
          }
          const { estado, municipio } = datos[0];
          this.colonias = datos.map((d: ValorCP) => ({ value: d.colonia, label: d.colonia }));
          this.df.municipio.patchValue(municipio);
          this.df.estado.patchValue(estado);
        },
        error: (error: HttpErrorResponse) => {
          this.alertaService.mostrar(TipoAlerta.Error, 'Alta incorrecta');
          console.error("ERROR: ", error);
        }
      });
  }

  limpiarCP(): void {
    this.df.municipio.patchValue("");
    this.df.estado.patchValue("");
    this.df.colonia.patchValue("");
    this.colonias = [];
  }

  cambioTipoSexo() {
    this.dgf.otroSexo.patchValue(null);
  }

  validarEmail() {
    if (this.dgf.correo.invalid) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, 'Tu correo electrónico no es válido.');
    }
  }

  validarRfc() {
    const regex = new RegExp(/^([A-Z,Ñ,&]{3,4}([0-9]{2})(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[A-Z|\d]{3})$/);
    if (!regex.test(this.dgf.rfc.value)) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, 'R.F.C.no valido.');
      this.dgf.rfc.setErrors({ 'incorrect': true });
    } else {
      this.dgf.rfc.setErrors(null);
    }
  }

  siguiente(): void {
    this.indice++;
    if (this.indice == this.menuStep.length) {
      if (this.domicilioForm.valid && this.datosGeneralesForm.valid) {
        this.datosContratante();
        this.vistaConfirmarCambio = true;
      }
    }
  }

  cancelarConfirmacion(): void {
    this.indice--;
    this.vistaConfirmarCambio = false;
  }

  cancelar(): void {
    this.ref.close({ estatus: false });
  }

  datosContratante(): void {
    this.contratanteModificado = {
      ...this.contratante,
      ...this.datosGeneralesForm.getRawValue(),
      ...this.domicilioForm.getRawValue(),
      nacionalidad: this.contratante.nacionalidad,
      lugarNacimiento: this.catalogoEstados.find(item => item.value === this.dgf.idEstado.value)?.label ?? "",
    };
  }

  datosActualizar() {
    return {
      idPersona: this.contratanteModificado.idPersona,
      nombre: this.contratanteModificado.nombre,
      paterno: this.contratanteModificado.paterno,
      materno: this.contratanteModificado.materno,
      rfc: this.contratanteModificado.rfc,
      numSexo: this.contratanteModificado.numSexo,
      otroSexo: this.contratanteModificado.otroSexo,
      fecNacimiento: moment(this.contratanteModificado.fecNacimiento).format('DD-MM-YYYY'),
      idPais: this.contratanteModificado.idPais,
      idLugarNac: this.contratanteModificado.idEstado,
      tel: this.contratanteModificado.telefono,
      correo: this.contratanteModificado.correo,
      calle: this.contratanteModificado.calle,
      numInt: this.contratanteModificado.numInt,
      numExt: this.contratanteModificado.numExt,
      cp: this.contratanteModificado.cp,
      desColonia: this.contratanteModificado.colonia,
      idDomicilio: this.contratanteModificado.idDomicilio,
    }
  }

  actualizarContratante() {
    this.contratantesService.actualizar(this.datosActualizar()).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta.codigo === 200 && !respuesta.error) {
          this.alertaService.mostrar(TipoAlerta.Exito,
            `Modificado correctamente. ${this.contratanteModificado.nombre} ${this.contratanteModificado.paterno} ${this.contratanteModificado.materno}`);
          this.vistaConfirmarCambio = false;
          this.ref.close({ estatus: true });
        } else {
          this.mensajeRegistroDuplicado = this.mensajesSistemaService.obtenerMensajeSistemaPorId(+respuesta.mensaje);
          this.modalRegistroDuplicado();
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error, 'Error al guardar la información. Intenta nuevamente.');
      }
    });
  }

  get dgf() {
    return this.datosGeneralesForm.controls;
  }

  get df() {
    return this.domicilioForm.controls;
  }

}
