import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Usuario} from '../../models/usuario.interface';
import * as moment from "moment/moment";
import {HttpErrorResponse} from "@angular/common/http";
import {UsuarioService} from "../../services/usuario.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {PATRON_CORREO} from "../../../../utils/constantes";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {RespuestaModalUsuario} from "../../models/respuestaModal.interface";
import {diferenciaUTC, mapearArregloTipoDropdown} from "../../../../utils/funciones";
import {ActivatedRoute} from '@angular/router';
import {finalize} from "rxjs/operators";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";

type UsuarioModificado = Omit<Usuario, "password">
type DetalleUsuario = Usuario & { contrasenia: string, desEdoNacimiento: string }

@Component({
  selector: 'app-modificar-usuario',
  templateUrl: './modificar-usuario.component.html',
  styleUrls: ['./modificar-usuario.component.scss']
})
export class ModificarUsuarioComponent implements OnInit {

  readonly CAPTURA_DE_USUARIO: number = 1;
  readonly RESUMEN_DE_USUARIO: number = 2;

  modificarUsuarioForm!: FormGroup;
  usuarioModificado!: UsuarioModificado;
  id!: number;

  catalogoRoles: TipoDropdown[] = [];
  catalogoNiveles: TipoDropdown[] = [];
  catalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];

  fechaActual: Date = new Date();
  indice: number = 0;
  rolResumen: string = "";
  nivelResumen: string = "";
  delegacionResumen: string = "";
  velatorioResumen: string = "";

  readonly POSICION_CATALOGO_NIVELES: number = 0;
  readonly POSICION_CATALOGO_DELEGACIONES: number = 1;
  readonly MSG_USUARIO_MODIFICADO: string = "Usuario modificado correctamente.";
  pasoModificarUsuario: number = 1;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private usuarioService: UsuarioService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService
  ) {
  }

  ngOnInit(): void {
    this.id = this.config.data;
    this.obtenerUsuario(this.id);
  }

  cargarCatalogos(delegacion: string): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoNiveles = respuesta[this.POSICION_CATALOGO_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_CATALOGO_DELEGACIONES];
    if (!delegacion) return;
    this.buscarVelatorios();
  }

  inicializarModificarUsuarioForm(usuario: DetalleUsuario): void {
    this.modificarUsuarioForm = this.formBuilder.group({
      id: [{value: usuario.id, disabled: true}, [Validators.required]],
      curp: [{value: usuario.curp, disabled: true}, [Validators.required, Validators.maxLength(18)]],
      matricula: [{value: usuario.matricula, disabled: true}, [Validators.required, Validators.maxLength(10)]],
      usuario: [{value: usuario.usuario, disabled: true}],
      contrasenia: [{value: usuario.contrasenia, disabled: true}],
      desEdoNacimiento: [{value: usuario.desEdoNacimiento, disabled: true}],
      nombre: [{value: usuario.nombre, disabled: true}, [Validators.required, Validators.maxLength(20)]],
      primerApellido: [{value: usuario.paterno, disabled: true}, [Validators.required, Validators.maxLength(30)]],
      segundoApellido: [{value: usuario.materno, disabled: true}, [Validators.required, Validators.maxLength(30)]],
      correoElectronico: [{value: usuario.correo, disabled: false},
        [Validators.required, Validators.email, Validators.pattern(PATRON_CORREO)]],
      fechaNacimiento: [{value: new Date(diferenciaUTC(usuario.fecNacimiento)), disabled: true}],
      nivel: [{value: usuario.idOficina, disabled: false}, [Validators.required]],
      delegacion: [{value: usuario.idDelegacion, disabled: false}],
      velatorio: [{value: usuario.idVelatorio, disabled: false}],
      rol: [{value: usuario.idRol, disabled: false}, [Validators.required]],
      estatus: [{value: usuario.estatus, disabled: false}, [Validators.required]]
    });
    this.cargarRoles(true);
  }

  obtenerUsuario(id: number): void {
    this.cargadorService.activar();
    this.usuarioService.buscarPorId(id)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>): void => {
          const usuario = respuesta.datos[0];
          this.inicializarModificarUsuarioForm(usuario);
          this.cargarCatalogos(usuario.idDelegacion);
        },
        error: (error: HttpErrorResponse): void => {
          console.error(error);
          this.mensajesSistemaService.mostrarMensajeError(error);
        }
      });
  }

  cargarRoles(cargaInicial: boolean = false): void {
    const idNivel = this.modificarUsuarioForm.get('nivel')?.value;
    this.catalogoRoles = [];
    if (!cargaInicial) {
      this.modificarUsuarioForm.get('rol')?.patchValue(null);
      this.modificarUsuarioForm.get('velatorio')?.patchValue(null);
      this.modificarUsuarioForm.get('delegacion')?.patchValue(null);
    }
    this.cargadorService.activar();
    this.usuarioService.obtenerCatalogoRoles(idNivel).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        const roles = respuesta.datos;
        this.catalogoRoles = mapearArregloTipoDropdown(roles, "nombre", "id");
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  buscarVelatorios(): void {
    const idDelegacion = this.modificarUsuarioForm.get('delegacion')?.value;
    if (!idDelegacion) return;
    this.usuarioService.obtenerVelatorios(idDelegacion).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        const velatorios = respuesta.datos || [];
        this.catalogoVelatorios = mapearArregloTipoDropdown(velatorios, "desc", "id");
      },
      error: (error: HttpErrorResponse): void => {
        console.log(error);
        this.mensajesSistemaService.mostrarMensajeError(error);
      }
    });
  }

  crearUsuarioModificado(): UsuarioModificado {
    return {
      usuario: this.modificarUsuarioForm.get("usuario")?.value,
      claveMatricula: this.modificarUsuarioForm.get("matricula")?.value,
      correo: this.modificarUsuarioForm.get("correoElectronico")?.value,
      curp: this.modificarUsuarioForm.get("curp")?.value,
      estatus: this.modificarUsuarioForm.get("estatus")?.value ? 1 : 0,
      fecNacimiento: this.modificarUsuarioForm.get('fechaNacimiento')?.value &&
        moment(this.modificarUsuarioForm.get('fechaNacimiento')?.value).format('YYYY-MM-DD'),
      id: this.modificarUsuarioForm.get("id")?.value,
      idDelegacion: this.modificarUsuarioForm.get("delegacion")?.value,
      idOficina: this.modificarUsuarioForm.get("nivel")?.value,
      idRol: this.modificarUsuarioForm.get("rol")?.value,
      idVelatorio: this.modificarUsuarioForm.get("velatorio")?.value,
      materno: this.modificarUsuarioForm.get("segundoApellido")?.value,
      matricula: this.modificarUsuarioForm.get("matricula")?.value,
      nombre: this.modificarUsuarioForm.get("nombre")?.value,
      paterno: this.modificarUsuarioForm.get("primerApellido")?.value
    };
  }

  creacionVariablesResumen(): void {
    const idRolMod = this.modificarUsuarioForm.get("rol")?.value;
    const idNivelMod = this.modificarUsuarioForm.get("nivel")?.value;
    const idDelegacionMod = this.modificarUsuarioForm.get("delegacion")?.value;
    const idVelatorioMod = this.modificarUsuarioForm.get("velatorio")?.value;
    this.rolResumen = this.catalogoRoles.find(rol => rol.value === idRolMod)?.label ?? "";
    this.nivelResumen = this.catalogoNiveles.find(nivel => nivel.value === idNivelMod)?.label ?? "";
    this.delegacionResumen = this.catalogoDelegaciones.find(delegacion => delegacion.value === idDelegacionMod)?.label ?? "";
    this.velatorioResumen = this.catalogoVelatorios.find(velatorio => velatorio.value === idVelatorioMod)?.label ?? "";
  }

  modificarUsuario(): void {
    const mensaje: string = `${this.MSG_USUARIO_MODIFICADO}`;
    const respuesta: RespuestaModalUsuario = {mensaje, actualizar: true};
    this.cargadorService.activar();
    this.usuarioService.actualizar(this.usuarioModificado)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (): void => {
          this.ref.close(respuesta);
        },
        error: (error: HttpErrorResponse): void => {
          const ERROR: string = 'Error al guardar la información. Intenta nuevamente.';
          console.error("ERROR: ", error);
          this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
        }
      });
  }

  cancelar(): void {
    if (this.pasoModificarUsuario === this.RESUMEN_DE_USUARIO) {
      this.pasoModificarUsuario = this.CAPTURA_DE_USUARIO;
      return;
    }
    const respuesta: RespuestaModalUsuario = {};
    this.ref.close(respuesta);
  }

  confirmarModificacion(): void {
    if (this.pasoModificarUsuario === this.CAPTURA_DE_USUARIO) {
      this.pasoModificarUsuario = this.RESUMEN_DE_USUARIO;
      this.usuarioModificado = this.crearUsuarioModificado();
      this.creacionVariablesResumen();
      return;
    }
    this.modificarUsuario();
  }

  get fmu() {
    return this.modificarUsuarioForm?.controls;
  }

}
