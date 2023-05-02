import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-overlay-panel-opcion',
  templateUrl: './overlay-panel-opcion.component.html',
  styleUrls: ['./overlay-panel-opcion.component.scss']
})
export class OverlayPanelOpcionComponent implements OnInit {

  @Input()
  titulo:string = '';

  constructor() { }

  ngOnInit(): void {
  }

}
