import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import 'leaflet';
import 'leaflet-control-geocoder';

declare let L: any;

@Component({
  selector: 'app-mapa-contratar-plan-servicios-funerarios-pago-anticipado',
  templateUrl:
    './mapa-contratar-plan-servicios-funerarios-pago-anticipado.component.html',
  styleUrls: [
    './mapa-contratar-plan-servicios-funerarios-pago-anticipado.component.scss',
  ],
})
export class MapaContratarPlanServiciosFunerariosPagoAnticipadoComponent
  implements OnInit
{
  map: any = null;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.inicializarMapa();
  }

  inicializarMapa(): void {
    L.Icon.Default.imagePath = 'assets/images/leaflet/';

    this.map = L.map('map').setView([19.4326296, -99.1331785], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(this.map);
    this.agregarMarker();

    let geoCoderOptions = {
      collapsed: false,
      placeholder: 'Buscar dirección',
      geocoder: L.Control.Geocoder.nominatim({
        geocodingQueryParams: {
          countrycodes: 'mx',
        },
      }),
    };
  }

  agregarMarker() {
    L.marker([19.4326296, -99.1331785])
      .addTo(this.map)
      .bindPopup(
        `
      <div class="custom-popup">
        <span class="popup-title">No. 01 Doctores</span>
        <span class="popup-description">Dr. Rafael Lucio No. 237, esquina Dr Isidro Olvera, Col. Doctores,
            C.P. 06720, Ciudad de México</span>
        <span class="popup-telephone">55 5607 3412</span>
        <hr>
        <span class="info-title">Servicios disponibles</span>
        <ul>
          <li class="info-description">Contratar convenio de previsión funeraria</li> 
          <li class="info-description">Contratar plan de servicios funerarios pagos anticipados</li>
        </ul>
        <div class="flex justify-content-end">
          <button class="btn btn-primary btn-md" id="seleccionar" data-funeraria="idFuneraria">Continuar</button>
        </div>   
     </div>
`
      )
      .openPopup();
    //Ojo, asegurate que el html ya se haya cargado antes de ejecutar este querySelector.

    const buttonElement = this.el.nativeElement.querySelector('#seleccionar');
    if (buttonElement) {
      this.renderer.listen(buttonElement, 'click', this.seleccionar.bind(this));
    }
  }

  seleccionar(e: any) {
    //Con esto podriamos obtener el id de la funeraria mostrada en el popup
    console.log(e.target.dataset.funeraria);
    this.router.navigate(
      ['registro-contratacion-plan-de-servicios-funerarios-pago-anticipado'],
      {
        relativeTo: this.activatedRoute,
      }
    );
  }
}
