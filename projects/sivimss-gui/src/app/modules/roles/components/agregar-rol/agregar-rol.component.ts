import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {OverlayPanel} from "primeng/overlaypanel";
import {AlertaService, TipoAlerta} from "projects/sivimss-gui/src/app/shared/alerta/services/alerta.service";
import {BreadcrumbService} from "projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {HttpErrorResponse} from "@angular/common/http";
import {RolService} from '../../services/rol.service';
import {Rol} from "../../models/rol.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {ROLES_BREADCRUMB} from "../../constants/breadcrumb";

type NuevoRol = Omit<Rol, "idRol">;

@Component({
  selector: 'app-agregar-rol',
  templateUrl: './agregar-rol.component.html',
  styleUrls: ['./agregar-rol.component.scss']
})
export class AgregarRolComponent implements OnInit {

  readonly CAPTURA_DE_ROL: number = 1;
  readonly RESUMEN_DE_ROL: number = 2;

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  catalogo_nivelOficina!: TipoDropdown[];
  agregarRolForm!: FormGroup;

  formFuncionalidad!: FormGroup;

  confirmacion: boolean = false;
  pasoAgregarRol: number = 1;

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
    this.breadcrumbService.actualizar(ROLES_BREADCRUMB);
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
      desRol: this.agregarRolForm.get("nombre")?.value,
      nivel: this.agregarRolForm.get("nivel")?.value
    };
  }

  agregarRol(): void {
    const rolBo: NuevoRol = this.crearNuevoRol();
    const solicitudRol: string = JSON.stringify(rolBo);
    this.rolService.guardar(solicitudRol).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => {
        const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(respuesta.mensaje));
        this.alertaService.mostrar(TipoAlerta.Exito, msg + " " + this.f.nombre.value);
        this.router.navigate(["roles"]);
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
        this.mensajesSistemaService.mostrarMensajeError(error.message);
      }
    });
  }

  noEspaciosAlPrincipio(): void {
    this.f.nombre.setValue(this.f.nombre.value.trimStart());
  }

  get f() {
    return this.agregarRolForm.controls;
  }

  get funcionalidad() {
    return this.formFuncionalidad.controls;
  }

}
