import {Component, Input, OnInit} from '@angular/core';
import {Velatorio} from "../../models/velatorio.interface";

@Component({
  selector: 'app-detalle-velatorio',
  templateUrl: './detalle-velatorio.component.html',
  styleUrls: ['./detalle-velatorio.component.scss']
})
export class DetalleVelatorioComponent implements OnInit {

  @Input() velatorio!: Velatorio;
  @Input() estatus: boolean = false;
  constructor() { }

  ngOnInit(): void {
  }

}
