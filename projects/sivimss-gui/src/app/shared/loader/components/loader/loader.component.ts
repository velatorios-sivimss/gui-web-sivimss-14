import { Component, Input, OnInit } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {

  /**
   * Establece si el loader se debe mostrar cuando se navega entre rutas
   */
  @Input()
  activarLoaderNavegacionRutas = false;

  constructor(
    public loaderService: LoaderService,
    private router: Router
  ) {

  }

  ngOnInit() {
    if (this.activarLoaderNavegacionRutas) {
      this.router.events.subscribe(
        event => {
          if (
            event instanceof NavigationStart ||
            event instanceof RouteConfigLoadStart
          ) {
            this.loaderService.activar();
          } else if (
            event instanceof NavigationEnd ||
            event instanceof NavigationError ||
            event instanceof NavigationCancel ||
            event instanceof RouteConfigLoadEnd
          ) {
            this.loaderService.desactivar();
          }
        }
      )
    }
  }

}
