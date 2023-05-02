import { Directive, HostBinding, Inject } from '@angular/core';
import { WIDTH_SIDEBAR } from "projects/sivimss-gui/src/app/shared/sidebar/tokens/sidebar.tokens";

@Directive({
  selector: '[appWidthMenuSidebar]'
})
export class WidthMenuSidebarDirective {

  constructor(@Inject(WIDTH_SIDEBAR) private widthMenuSidebarToken: number) { }

  @HostBinding('style.width') get widthMenuSidebar():string{
    return this.widthMenuSidebarToken + 'px';
  }

}
