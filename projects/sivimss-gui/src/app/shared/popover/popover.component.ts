import {Component, Input, Output, EventEmitter, HostListener, ElementRef} from '@angular/core';

@Component({
  selector: 'app-popover',
  template: `
    <div class="popover" [style.zIndex]="zIndex" [ngClass]="{ 'popover-visible': visible }">
      <div class="popover-content">
        <ng-content></ng-content>
      </div>
      <div class="flex justify-content-end">
        <button class="ml-4 mt-3 btn btn-primary btn-md"  (click)="close()">
          Aceptar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .popover {
      position: absolute;
      z-index: 10;
      background-color: #fff;
      border: 1px solid #ccc;
      border-radius: 3px;
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
      width: 530px;
      max-width:700px;
      max-height: 800px;
      padding: 10px;
      display: none;
      overflow-y: auto;
    }

    .popover-visible {
      display: block;
    }

    /* Styles for the jagger */
    .popover::before {
      content: '';
      position: absolute;
      top: -5px;
      right: 10%;
      transform: translateX(-50%);
      margin-top: -5px;
      border-top: none;
      border-bottom: 10px solid #fff;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
    }

  `]
})
export class PopoverComponent {
  @Input() title!: string;
  @Input() zIndex: number = 10;
  @Output() closed: EventEmitter<void> = new EventEmitter<void>();
  visible: boolean = false;

  constructor(private elementRef: ElementRef) {
  }

  toggle(event: MouseEvent): void {
    event?.stopPropagation(); // Stop event propagation
    this.visible = !this.visible;
  }

  close(): void {
    this.visible = false;
    this.closed.emit();
  }

  @HostListener('document:click', ['$event.target'])
  onClick(target: HTMLElement): void {
    if (!this.visible || this.elementRef.nativeElement.contains(target)) {
      return;
    }
    this.close();
  }
}
