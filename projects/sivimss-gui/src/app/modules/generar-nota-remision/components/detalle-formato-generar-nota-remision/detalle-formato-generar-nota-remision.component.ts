import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { DetalleNotaRemision } from '../../models/nota-remision.interface';

@Component({
  selector: 'app-detalle-formato-generar-nota-remision',
  templateUrl: './detalle-formato-generar-nota-remision.component.html',
  styleUrls: ['./detalle-formato-generar-nota-remision.component.scss']
})
export class DetalleFormatoGenerarNotaRemisionComponent implements OnInit {
  readonly POSICION_DETALLE: number = 0;
  readonly POSICION_SERVICIOS: number = 1;

  @Input() generarNotaRemision: boolean = false;

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
    if (!this.generarNotaRemision) {
      const respuesta = this.route.snapshot.data['respuesta'];
      this.idNota = +this.route.snapshot.params?.idNota;
      this.idOds = +this.route.snapshot.params?.idOds;

      if (!this.idNota || !this.idOds) {
        this.btnAceptarDetalle();
      }

      const detalleNotaRemision = respuesta[this.POSICION_DETALLE].datos;
      const serviciosNotaRemision = respuesta[this.POSICION_SERVICIOS].datos;
      this.inicializarNotaRemisionForm(detalleNotaRemision, serviciosNotaRemision);
    } else {
      this.inicializarNotaRemisionForm();
    }
  }

  inicializarNotaRemisionForm(detalle?: DetalleNotaRemision, servicios?: any) {
    this.notaRemisionForm = this.formBuilder.group({
      versionDocumento: [{ value: null, disabled: true }],
      fecha: [{ value: new Date(), disabled: true }],
      velatorio: [{ value: null, disabled: true }],
      remisionServicios: [{ value: null, disabled: true }],
      direccion: [{ value: null, disabled: true }],
      nombreSolicitante: [{ value: null, disabled: true }],
      direccionSolicitante: [{ value: null, disabled: true }],
      curpSolicitante: [{ value: null, disabled: true }],
      velatorioSolicitante: [{ value: null, disabled: true }],
      finado: [{ value: null, disabled: true }],
      parentesco: [{ value: null, disabled: true }],
      folioOds: [{ value: null, disabled: true }],
      nombreConformidad: [{ value: null, disabled: true }],
      nombreRepresentante: [{ value: null, disabled: true }],
    });
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
