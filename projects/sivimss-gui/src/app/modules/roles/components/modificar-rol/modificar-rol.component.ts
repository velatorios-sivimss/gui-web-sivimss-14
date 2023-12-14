import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {HttpErrorResponse} from "@angular/common/http";
import {RolService} from "../../services/rol.service";
import {Rol} from '../../models/rol.interface';
import {RespuestaModalRol} from "../../models/respuestaModal.interface";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {ActivatedRoute} from "@angular/router";

type RolModificado = Omit<Rol, "password">

@Component({
  selector: 'app-modificar-rol',
  templateUrl: './modificar-rol.component.html',
  styleUrls: ['./modificar-rol.component.scss']
})
export class ModificarRolComponent implements OnInit {

  readonly CAPTURA_DE_ROL: number = 1;
  readonly RESUMEN_DE_ROL: number = 2;

  modificarRolForm!: FormGroup;
  rolModificado!: RolModificado;
  catalogo_nivelOficina!: TipoDropdown[];
  indice: number = 0;
  datosConfirmacion!: Rol;
  pasoModificarRol: number = 1;

  readonly POSICION_CATALOGO_NIVELES: number = 1;

  constructor(
    private alertaService: AlertaService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private rolService: RolService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private mensajesSistemaService: MensajesSistemaService
  ) {
  }

  ngOnInit(): void {
    const rol = this.config.data;
    this.cargarCatalogos();
    this.inicializarModificarRolForm(rol);
  }

  inicializarModificarRolForm(rol: Rol): void {
    this.modificarRolForm = this.formBuilder.group({
      id: [{value: rol.idRol, disabled: true}, [Validators.required]],
      nombre: [{value: rol.desRol, disabled: false}, [Validators.required, Validators.maxLength(100)]],
      nivel: [{value: rol.nivelOficina, disabled: false}, [Validators.required]],
      estatus: [{value: rol.estatusRol, disabled: false}],
      fechaCreacion: [{value: rol.fCreacion, disabled: true}]
    });
  }

  cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogo_nivelOficina = respuesta[this.POSICION_CATALOGO_NIVELES];
  }

  crearUsuarioModificado(): any {
    return {
      idRol: this.modificarRolForm.get("id")?.value,
      desRol: this.modificarRolForm.get("nombre")?.value,
      nivel: this.modificarRolForm.get("nivel")?.value,
      estatusRol: this.modificarRolForm.get("estatus")?.value ? 1 : 0
    }
  }

  modificarRol(event?: boolean): void {
    if (!event) return;
    this.rolModificado = this.crearUsuarioModificado();
    const solicitudUsuario: string = JSON.stringify(this.rolModificado);
    this.rolService.actualizar(solicitudUsuario).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => this.manejarRespuestaCorrecta(respuesta),
      error: (error: HttpErrorResponse): void => this.manejarMensajeError(error)
    });
  }

  manejarRespuestaCorrecta(respuesta: HttpRespuesta<any>): void {
    const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(respuesta.mensaje));
    this.alertaService.mostrar(TipoAlerta.Exito, msg);
    this.ref.close({actualizar: true});
  }

  private manejarMensajeError(error: HttpErrorResponse): void {
    console.error(error);
    this.alertaService.mostrar(TipoAlerta.Error, 'Actualización incorrecta');
  }

  noEspaciosAlPrincipio(): void {
    const nombre: string = this.modificarRolForm.get("nombre")?.value;
    this.modificarRolForm.get('nombre')?.setValue(nombre.trimStart());
  }

  cancelar(): void {
    const respuesta: RespuestaModalRol = {};
    this.ref.close(respuesta);
  }

  confirmarModificacion(): void {
    if (this.pasoModificarRol !== this.CAPTURA_DE_ROL) return;
    this.pasoModificarRol = this.RESUMEN_DE_ROL;
    this.datosConfirmacion = {
      desRol: this.modificarRolForm.get('nombre')?.value,
      fCreacion: this.modificarRolForm.get('fechaCreacion')?.value,
      nivelOficina: this.tomarNivel(),
      estatusRol: this.modificarRolForm.get('estatus')?.value,
      idRol: this.modificarRolForm.get('id')?.value
    }
  }

  tomarNivel(): string {
    const nivel: number = this.modificarRolForm.get('nivel')?.value as number;
    if (nivel === 1) {
      return "CENTRAL"
    }
    if (nivel === 2) {
      return "DELEGACIONAL"
    }
    if (nivel === 3) {
      return "VELATORIOS"
    }
    return "";
  }

  get f() {
    return this.modificarRolForm.controls;
  }
}
