import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-overlay-panel-opcion',
  templateUrl: './overlay-panel-opcion.component.html',
  styleUrls: ['./overlay-panel-opcion.component.scss']
})
export class OverlayPanelOpcionComponent {

  @Input()
  titulo: string = '';


}
