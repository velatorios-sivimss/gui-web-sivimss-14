import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-convenio-header',
  templateUrl: './convenio-header.component.html',
  styleUrls: ['./convenio-header.component.scss']
})
export class ConvenioHeaderComponent implements OnInit {
  @Input() tipoContratacion: string = '';
  @Input() numeroFolio: string = '';

  constructor() { }

  ngOnInit(): void {
  }

}
