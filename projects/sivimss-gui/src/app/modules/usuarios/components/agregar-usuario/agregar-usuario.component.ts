import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {PATRON_CORREO, PATRON_CURP} from "../../../../utils/constantes";
import {Usuario} from "../../models/usuario.interface";
import * as moment from "moment/moment";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {HttpErrorResponse} from "@angular/common/http";
import {UsuarioService} from "../../services/usuario.service";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {RespuestaModalUsuario} from "../../models/respuestaModal.interface";
import {MENSAJES_CURP} from "../../constants/validacionCURP";
import {MENSAJES_MATRICULA} from "../../constants/validacionMatricula";
import {ActivatedRoute} from '@angular/router';
import {finalize} from "rxjs/operators";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {mapearArregloTipoDropdown} from "../../../../utils/funciones";
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";

type NuevoUsuario = Omit<Usuario, "id" | "password" | "estatus" | "matricula">;
type SolicitudCurp = Pick<Usuario, "curp">;
type SolicitudMatricula = Pick<Usuario, "claveMatricula">;

@Component({
  selector: 'app-agregar-usuario',
  templateUrl: './agregar-usuario.component.html',
  styleUrls: ['./agregar-usuario.component.scss']
})
export class AgregarUsuarioComponent implements OnInit {

  agregarUsuarioForm!: FormGroup;

  curpValida: boolean = false;
  matriculaValida: boolean = false;

  catalogoRoles: TipoDropdown[] = [];
  catalogoNiveles: TipoDropdown[] = [];
  catalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];

  nuevoUsuario!: NuevoUsuario;
  fechaActual: Date = new Date();
  indice: number = 0;
  rolResumen: string = "";
  nivelResumen: string = "";
  delegacionResumen: string = "";
  velatorioResumen: string = "";

  readonly POSICION_CATALOGO_ROLES: number = 0;
  readonly POSICION_CATALOGO_NIVELES: number = 1;
  readonly POSICION_CATALOGO_DELEGACIONES: number = 2;

  constructor(
    private route: ActivatedRoute,
    private alertaService: AlertaService,
    private formBuilder: FormBuilder,
    public ref: DynamicDialogRef,
    private usuarioService: UsuarioService,
    private cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService
  ) {
  }

  ngOnInit(): void {
    this.inicializarAgregarUsuarioForm();
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    const roles = respuesta[this.POSICION_CATALOGO_ROLES].datos
    this.catalogoRoles = mapearArregloTipoDropdown(roles, "nombre", "id");
    this.catalogoNiveles = respuesta[this.POSICION_CATALOGO_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_CATALOGO_DELEGACIONES];
  }

  inicializarAgregarUsuarioForm(): void {
    this.agregarUsuarioForm = this.formBuilder.group({
      curp: [{value: null, disabled: false},
        [Validators.required, Validators.maxLength(18), Validators.pattern(PATRON_CURP)]],
      matricula: [{value: null, disabled: false}, [Validators.required, Validators.maxLength(10)]],
      nombre: [{value: null, disabled: true}, [Validators.required, Validators.maxLength(20)]],
      primerApellido: [{value: null, disabled: true}, [Validators.required, Validators.maxLength(30)]],
      segundoApellido: [{value: null, disabled: true}, [Validators.required, Validators.maxLength(30)]],
      correoElectronico: [{value: null, disabled: false},
        [Validators.required, Validators.email, Validators.pattern(PATRON_CORREO)]],
      fechaNacimiento: [{value: null, disabled: false}, [Validators.required]],
      nivel: [{value: null, disabled: false}, [Validators.required]],
      delegacion: [{value: null, disabled: false}, [Validators.required]],
      velatorio: [{value: null, disabled: false}, [Validators.required]],
      rol: [{value: null, disabled: false}, [Validators.required]],
      estatus: [{value: true, disabled: false}, [Validators.required]]
    });
  }

  buscarVelatorios(): void {
    const delegacion = this.agregarUsuarioForm.get('delegacion')?.value;
    this.agregarUsuarioForm.get('velatorio')?.patchValue("");
    this.cargadorService.activar();
    this.usuarioService.obtenerVelatorios(delegacion)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          const velatorios = respuesta.datos || [];
          this.catalogoVelatorios = mapearArregloTipoDropdown(velatorios, "desc", "id");
        },
        error: (error: HttpErrorResponse): void => {
          this.mostrarMensajeError("", error.message);
          console.log(error);
        }
      });
  }

  crearUsuario(): NuevoUsuario {
    return {
      claveMatricula: this.agregarUsuarioForm.get("matricula")?.value,
      correo: this.agregarUsuarioForm.get("correoElectronico")?.value,
      curp: this.agregarUsuarioForm.get("curp")?.value,
      fecNacimiento: this.agregarUsuarioForm.get('fechaNacimiento')?.value &&
        moment(this.agregarUsuarioForm.get('fechaNacimiento')?.value).format('YYYY-MM-DD'),
      idDelegacion: this.agregarUsuarioForm.get("delegacion")?.value,
      idOficina: this.agregarUsuarioForm.get("nivel")?.value,
      idRol: this.agregarUsuarioForm.get("rol")?.value,
      idVelatorio: this.agregarUsuarioForm.get("velatorio")?.value,
      materno: this.agregarUsuarioForm.get("segundoApellido")?.value,
      nombre: this.agregarUsuarioForm.get("nombre")?.value,
      paterno: this.agregarUsuarioForm.get("primerApellido")?.value,
    };
  }

  creacionVariablesResumen(): void {
    const idRol = this.agregarUsuarioForm.get("rol")?.value;
    const idNivel = this.agregarUsuarioForm.get("nivel")?.value;
    const idDelegacion = this.agregarUsuarioForm.get("delegacion")?.value;
    const idVelatorio = this.agregarUsuarioForm.get("velatorio")?.value;
    this.rolResumen = this.catalogoRoles.find(rol => rol.value === idRol)?.label || "";
    this.nivelResumen = this.catalogoNiveles.find(nivel => nivel.value === idNivel)?.label || "";
    this.delegacionResumen = this.catalogoDelegaciones.find(delegacion => delegacion.value === idDelegacion)?.label || "";
    this.velatorioResumen = this.catalogoVelatorios.find(velatorio => velatorio.value === idVelatorio)?.label || "";
  }

  validarCurp(): void {
    const consulta: SolicitudCurp = {curp: this.agregarUsuarioForm.get("curp")?.value};
    if (!consulta.curp) return;
    if (!PATRON_CURP.test(consulta.curp)) return;
    this.usuarioService.validarCurp(consulta).pipe(
      finalize(() => this.validarCurpRenapo(consulta.curp))
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        if (!respuesta.datos || respuesta.datos.length === 0) return;
        const {valor} = respuesta.datos[0];
        if (!MENSAJES_CURP.has(valor)) return;
        const {mensaje, tipo, valido} = MENSAJES_CURP.get(valor);
        this.curpValida = valido;
        if (!valido) {
          this.alertaService.mostrar(tipo, mensaje);
        }
      },
      error: (error: HttpErrorResponse): void => {
        this.mostrarMensajeError("Ocurrio un error", error.message);
        console.error("ERROR: ", error)
      }
    });
  }

  validarCurpRenapo(curp: string): void {
    if (!this.curpValida) return;
    this.cargadorService.activar();
    this.usuarioService.consultarCurpRenapo(curp).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        if (!respuesta.datos) return;
        const {apellido1, apellido2, nombre} = respuesta.datos;
        this.agregarUsuarioForm.get("nombre")?.patchValue(nombre);
        this.agregarUsuarioForm.get("primerApellido")?.patchValue(apellido1);
        this.agregarUsuarioForm.get("segundoApellido")?.patchValue(apellido2);
      },
      error: (error: HttpErrorResponse): void => {
        this.mostrarMensajeError("Ocurrio un error", error.message);
        console.error("ERROR: ", error)
      }
    });
  }

  validarMatricula(): void {
    const consulta: SolicitudMatricula = {claveMatricula: this.agregarUsuarioForm.get("matricula")?.value};
    if (!consulta.claveMatricula) return;
    this.usuarioService.validarMatricula(consulta).pipe(
      finalize(() => this.validarMatriculaSiap(consulta.claveMatricula))
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        if (!respuesta.datos || respuesta.datos.length === 0) return;
        const {valor} = respuesta.datos[0];
        if (!MENSAJES_MATRICULA.has(valor)) return;
        const {mensaje, tipo, valido} = MENSAJES_MATRICULA.get(valor);
        this.matriculaValida = valido;
        if (!valido) {
          this.alertaService.mostrar(tipo, mensaje);
        }
      },
      error: (error: HttpErrorResponse): void => {
        this.mostrarMensajeError("Matricula no valida", error.message);
        console.error("ERROR: ", error)
      }
    });
  }

  validarMatriculaSiap(matricula: string): void {
    if (!this.matriculaValida) return;
    this.cargadorService.activar();
    this.usuarioService.consultarMatriculaSiap(matricula).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        console.log(respuesta)
      },
      error: (error: HttpErrorResponse): void => {
        this.mostrarMensajeError("Ocurrio un error", error.message);
        console.error("ERROR: ", error)
      }
    });
  }

  agregarUsuario(): void {
    const respuesta: RespuestaModalUsuario = {mensaje: "Usuario agregado correctamente", actualizar: true}
    this.cargadorService.activar();
    this.usuarioService.guardar(this.nuevoUsuario)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (): void => {
          this.ref.close(respuesta)
        },
        error: (error: HttpErrorResponse): void => {
          this.mostrarMensajeError("Alta incorrecta", error.message);
          console.error("ERROR: ", error)
        }
      });
  }

  cancelar(): void {
    const respuesta: RespuestaModalUsuario = {};
    this.ref.close(respuesta);
  }

  confirmarCreacion(): void {
    if (this.indice === 0) {
      this.indice++;
      this.nuevoUsuario = this.crearUsuario();
      this.creacionVariablesResumen();
      return;
    }
    this.agregarUsuario();
  }

  get fau() {
    return this.agregarUsuarioForm?.controls;
  }

  mostrarMensajeError(defaultError: string = '', codigoError: string): void {
    const errorMsg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(codigoError));
    if (errorMsg !== '') {
      this.alertaService.mostrar(TipoAlerta.Error, errorMsg);
      return;
    }
    if (defaultError !== '') {
      this.alertaService.mostrar(TipoAlerta.Error, defaultError);
      return;
    }
    this.alertaService.mostrar(TipoAlerta.Error, "Error Desconocido");
  }

}
