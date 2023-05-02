import { Component, OnInit } from '@angular/core';
import {DynamicDialogRef} from "primeng/dynamicdialog";
import {Router} from "@angular/router";

@Component({
  selector: 'app-registrar-donacion',
  templateUrl: './registrar-donacion.component.html',
  styleUrls: ['./registrar-donacion.component.scss']
})
export class RegistrarDonacionComponent implements OnInit {

  constructor(
    private router: Router,
    private readonly ref: DynamicDialogRef,
  ) { }

  ngOnInit(): void {
  }

  aceptacionDonacion(): void {
    this.ref.close();
    this.router.navigate(["consulta-donaciones/aceptacion-donacion"]);
  }

  controlSalidaDonaciones(): void {
    this.ref.close();
    this.router.navigate(["consulta-donaciones/control-salida-donaciones"]);
  }

  cancelar(): void {
    this.ref.close();
  }

}
