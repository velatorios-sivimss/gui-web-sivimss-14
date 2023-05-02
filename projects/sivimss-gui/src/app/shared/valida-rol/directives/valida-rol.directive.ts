import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AutenticacionService } from "projects/sivimss-gui/src/app/services/autenticacion.service";
import { funcionalidades, permisos } from "projects/sivimss-gui/src/app/utils/constantes-funcionalidades-permisos";

@Directive({
  selector: '[appValidaRol]'
})
export class ValidaRolDirective {

  elementoRenderizado: boolean = false;

  constructor(
    private readonly viewContainerRef: ViewContainerRef,
    private readonly templateRef: TemplateRef<unknown>,
    private readonly aut: AutenticacionService
  ) {
  }

  @Input('appValidaRol') set validar(funcionalidadPermiso: [funcionalidad: string, permiso: string]) {
    const [funcionalidad, permiso] = funcionalidadPermiso;
    const idFuncionalidad: string = funcionalidades[funcionalidad];
    const idPermiso: string = permisos[permiso];
    if (!this.elementoRenderizado && this.aut.existeFuncionalidadConPermiso(idFuncionalidad, idPermiso)) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
      this.elementoRenderizado = true;
    } else if (this.elementoRenderizado && !this.aut.existeFuncionalidadConPermiso(idFuncionalidad, idPermiso)) {
      this.viewContainerRef.clear();
      this.elementoRenderizado = false;
    }
  }

}
