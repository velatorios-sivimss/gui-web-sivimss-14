import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { ArticulosServicios, DetalleNotaRemision } from '../../models/nota-remision.interface';

@Component({
  selector: 'app-detalle-formato-generar-nota-remision',
  templateUrl: './detalle-formato-generar-nota-remision.component.html',
  styleUrls: ['./detalle-formato-generar-nota-remision.component.scss']
})
export class DetalleFormatoGenerarNotaRemisionComponent implements OnInit {
  readonly POSICION_DETALLE: number = 0;
  readonly POSICION_SERVICIOS: number = 1;

  @Input() generarNotaRemision: boolean = false;

  @Input() datos!: DetalleNotaRemision;

  @Input() servicios: ArticulosServicios[] = [];

  @Output() regresar = new EventEmitter();

  @Output() aceptar = new EventEmitter();

  notaRemisionForm!: FormGroup;
  idNota: number = 0;
  idOds: number = 0;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
  ) { }

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data['respuesta'];
    this.idNota = +this.route.snapshot.params?.idNota;
    this.idOds = +this.route.snapshot.params?.idOds;

    if ((!this.idNota || !this.idOds) && !this.generarNotaRemision) {
      this.btnAceptarDetalle();
    }

    this.datos = respuesta[this.POSICION_DETALLE]?.datos[0];
    this.servicios = respuesta[this.POSICION_SERVICIOS]?.datos;
  }

  btnRegresar() {
    this.regresar.emit();
  }

  btnAceptar() {
    this.aceptar.emit();
  }

  btnAceptarDetalle() {
    this.router.navigate(['/generar-nota-remision'], { relativeTo: this.activatedRoute });
  }
}
