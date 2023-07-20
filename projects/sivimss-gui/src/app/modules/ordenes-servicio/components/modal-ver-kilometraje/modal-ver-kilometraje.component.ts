import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

import 'leaflet';
import 'leaflet-control-geocoder';

declare var L: any;

@Component({
  selector: 'app-modal-ver-kilometraje',
  templateUrl: './modal-ver-kilometraje.component.html',
  styleUrls: ['./modal-ver-kilometraje.component.scss']
})
export class ModalVerKilometrajeComponent implements OnInit {

  dummy!: string;
  map: any = null;

  constructor(
    private readonly ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig
  ) {
  }

  ngOnInit(): void {
    //Obtener la info que le pasa el componente que abre el modal
    this.dummy = this.config.data.dummy;
  }

  cerrarModal() {
    //Pasar info a quien abrio el modal en caso de que se requiera. Se esta pasando un boolean de ejemplo
    this.ref.close(true);
  }

  inicializarMapa(): void {
    try {
      L.Icon.Default.imagePath = 'assets/images/leaflet/';

      this.map = L.map('map').setView([19.4326296, -99.1331785], 13);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(this.map);

      let geoCoderOptions = {
        collapsed: false,
        placeholder: 'Buscar dirección',
        geocoder: L.Control.Geocoder.nominatim({
          geocodingQueryParams: {
            countrycodes: 'mx',
          },
        }),
      };
    } catch (error) {
      console.log(error);
    }
  }
}
