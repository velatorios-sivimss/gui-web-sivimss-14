import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { AutenticacionService } from "projects/sivimss-gui/src/app/services/autenticacion.service";
import { LoaderService } from "projects/sivimss-gui/src/app/shared/loader/services/loader.service";
import { Observable, Subscription } from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

  existeUnaSesion$!: Observable<boolean>;
  paginaCargada: boolean = false;
  subs!: Subscription;
  serviciosEnLinea: boolean = false;

  constructor(
    private primengConfig: PrimeNGConfig,
    private translateService: TranslateService,
    private autenticacionService: AutenticacionService,
    private loaderService: LoaderService
  ) {
  }

  ngOnInit(): void {
    this.existeUnaSesion$ = this.autenticacionService.existeUnaSesion$;
    const pathname = window.location.pathname;
    this.serviciosEnLinea = false;
    if (pathname.includes('/externo-privado')) {
      this.serviciosEnLinea = true;
    }

    this.loaderService.activar();
    this.autenticacionService.paginaCargada$.subscribe((paginaCargada: boolean) => {
      this.paginaCargada = paginaCargada;
      if (this.paginaCargada) {
        this.loaderService.desactivar();
      }
    });
    this.permitirAnimacionRippleComponentesPrime();
    this.establecerIdiomaGeneral('es');
  }

  ngAfterViewInit(): void {
    this.establecerIdiomaComponentesPrime('es');
  }

  establecerIdiomaGeneral(idiomaGeneral: string) {
    this.translateService.setDefaultLang(idiomaGeneral);
  }

  permitirAnimacionRippleComponentesPrime() {
    this.primengConfig.ripple = true;
  }

  establecerIdiomaComponentesPrime(idioma: string) {
    this.translateService.use(idioma);
    this.translateService.get('primeng').subscribe(res => this.primengConfig.setTranslation(res));
  }

  ngOnDestroy(): void {
    if (this.subs) {
      this.subs.unsubscribe();
    }
  }

}
