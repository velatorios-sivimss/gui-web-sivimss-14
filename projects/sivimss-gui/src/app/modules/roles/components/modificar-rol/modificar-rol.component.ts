import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {CATALOGOS} from "../../../usuarios/constants/catalogos_dummies";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {HttpErrorResponse} from "@angular/common/http";
import {RolService} from "../../services/rol.service";
import {Rol} from '../../models/rol.interface';
import {RespuestaModalRol} from "../../models/respuestaModal.interface";

type RolModificado = Omit<Rol, "password">

@Component({
  selector: 'app-modificar-rol',
  templateUrl: './modificar-rol.component.html',
  styleUrls: ['./modificar-rol.component.scss']
})
export class ModificarRolComponent implements OnInit {

  modificarRolForm!: FormGroup;
  rolModificado!: RolModificado;
  opciones: TipoDropdown[] = CATALOGOS;
  indice: number = 0;

  constructor(
    private alertaService: AlertaService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private rolService: RolService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    const rol =  this.config.data;
    this.inicializarModificarRolForm(rol);
  }

  inicializarModificarRolForm(rol:Rol): void {
    this.modificarRolForm = this.formBuilder.group({
      id: [{value: rol.idRol, disabled: true}, [Validators.required]],
      nombre: [{value: rol.desRol, disabled: false}, [Validators.required, Validators.maxLength(100)]],
      nivel: [{value: rol.nivelOficina, disabled: false}, [Validators.required]],
      estatus : [{value: rol.estatusRol, disabled: false}],
    });
  }

  crearUsuarioModificado(): any {
    return {
      idRol: this.modificarRolForm.get("id")?.value,
      desRol: this.modificarRolForm.get("nombre")?.value,
      nivel: this.modificarRolForm.get("nivel")?.value,
      estatusRol: this.modificarRolForm.get("estatus")?.value ? 1 : 0
    }
  }

  modificarRol(): void {
    const respuesta: RespuestaModalRol = {mensaje: "Actualización satisfactoria", actualizar: true}
    const solicitudUsuario = JSON.stringify(this.rolModificado);
    this.rolService.actualizar(solicitudUsuario).subscribe(
      () => {
        this.ref.close(respuesta)
      },
      (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, 'Actualización incorrecta');
        console.error("ERROR: ", error)
      }
    );
  }

  get f() {
    return this.modificarRolForm.controls;
  }

  cancelar(): void {
    if (this.indice === 1) {
      this.indice--;
      return;
    }
    const respuesta: RespuestaModalRol = {};
    this.ref.close(respuesta);
  }

  confirmarModificacion(): void {
    if (this.indice === 0) {
      this.indice++;
      this.rolModificado = this.crearUsuarioModificado();
      this.modificarRol();
      return;
    }

  }
}
