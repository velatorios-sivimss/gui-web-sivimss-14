import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { OverlayPanel } from "primeng/overlaypanel";
import { Funcionalidad } from "projects/sivimss-gui/src/app/modules/roles/models/funcionalidad.interface";
import { AlertaService, TipoAlerta } from "projects/sivimss-gui/src/app/shared/alerta/services/alerta.service";
import { BreadcrumbService } from "projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {HttpErrorResponse} from "@angular/common/http";
import {RolService} from '../../services/rol.service';
import {Rol} from "../../models/rol.interface";
import {USUARIOS_BREADCRUMB} from '../../../usuarios/constants/breadcrumb';
import { CATALOGO_NIVEL } from '../../../articulos/constants/dummies';
import {ActivatedRoute, Router} from "@angular/router";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";

type NuevoRol = Omit<Rol, "idRol" >;

@Component({
  selector: 'app-agregar-rol',
  templateUrl: './agregar-rol.component.html',
  styleUrls: ['./agregar-rol.component.scss']
})
export class AgregarRolComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  catalogo_nivelOficina!: TipoDropdown[];
  catRol: TipoDropdown[] = [];
  agregarRolForm!: FormGroup;

  formFuncionalidad!: FormGroup;
  permisos : any;

  funcionalidades: Funcionalidad[] = [];
  funcionalidadSeleccionada!: Funcionalidad;

  contadorFuncionalidades = 1;

  constructor(
    private route: ActivatedRoute,
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    private formBuilder: FormBuilder,
    private mensajesSistemaService: MensajesSistemaService,
    private rolService: RolService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    const roles = this.route.snapshot.data["respuesta"];
    this.breadcrumbService.actualizar(USUARIOS_BREADCRUMB);
    this.catalogo_nivelOficina = roles[1].map((nivel: any) => ({label: nivel.label, value: nivel.value})) || [];
    this.inicializarAgregarRolForm();
  }

  inicializarAgregarRolForm(): void {
    this.agregarRolForm = this.formBuilder.group({
      nombre: [{value: null, disabled: false}, [Validators.required]],
      nivel: [{value: null, disabled: false}, [Validators.required]]
    });
  }

  crearNuevoRol(): any {
    return {
      desRol : this.agregarRolForm.get("nombre")?.value,
      nivel: this.agregarRolForm.get("nivel")?.value
    };
  }

  agregarRol(): void {
    const rolBo: NuevoRol = this.crearNuevoRol();
    const solicitudRol: string = JSON.stringify(rolBo);
    this.rolService.guardar(solicitudRol).subscribe(
      (respuesta: HttpRespuesta<any>) => {
        const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(respuesta.mensaje));
        this.alertaService.mostrar(TipoAlerta.Exito, msg);
        this.router.navigate(["roles"]);
      },
      (error: HttpErrorResponse) => {
        const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(error.error.mensaje));
        this.alertaService.mostrar(TipoAlerta.Error, msg);
        console.error("ERROR: ", error)
      }
    );
  }

  noEspaciosAlPrincipio(): void {
    this.f.nombre.setValue(
      this.f.nombre.value.trimStart()
    );
  }

  get f() {
    return this.agregarRolForm.controls;
  }

  get funcionalidad() {
    return this.formFuncionalidad.controls;
  }

}
