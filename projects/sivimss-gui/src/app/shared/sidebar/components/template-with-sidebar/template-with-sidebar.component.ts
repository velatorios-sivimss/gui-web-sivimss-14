import { Component, Inject, OnInit } from '@angular/core';
import { MenuSidebarService } from "projects/sivimss-gui/src/app/shared/sidebar/services/menu-sidebar.service";
import { WIDTH_SIDEBAR } from "projects/sivimss-gui/src/app/shared/sidebar/tokens/sidebar.tokens";
import { Observable } from "rxjs";

@Component({
  selector: 'app-template-with-sidebar',
  templateUrl: './template-with-sidebar.component.html',
  styleUrls: ['./template-with-sidebar.component.scss']
})
export class TemplateWithSidebarComponent implements OnInit {
  sidebarActivo$!: Observable<boolean>;
  marginLeft: number = 0;

  constructor(
    @Inject(WIDTH_SIDEBAR) private widthSidebarToken: number,
    private menuSidebarService: MenuSidebarService
  ) {
  }

  ngOnInit(): void {
    this.marginLeft = this.widthSidebarToken;
    this.sidebarActivo$ = this.menuSidebarService.menuSidebar$;
  }

}
