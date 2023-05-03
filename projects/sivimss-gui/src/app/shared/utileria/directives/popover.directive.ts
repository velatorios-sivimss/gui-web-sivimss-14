import {Directive, ElementRef, HostListener, Input, ViewContainerRef} from '@angular/core';
import {PopoverComponent} from "../../popover/popover.component";

@Directive({
  selector: '[appPopover]'
})
export class PopoverDirective {
  @Input() popoverTitle!: string;
  @Input() popoverZIndex: number = 10;

  private popoverRef: any;

  constructor(
    private elementRef: ElementRef,
    private viewContainerRef: ViewContainerRef,
  ) {
  }

  @HostListener('click') onClick(): void {
    if (!this.popoverRef) {
      this.popoverRef = this.viewContainerRef.createComponent(PopoverComponent);
      this.popoverRef.instance.title = this.popoverTitle;
      this.popoverRef.instance.zIndex = this.popoverZIndex;
      this.popoverRef.instance.closed.subscribe(() => {
        this.popoverRef.destroy();
        this.popoverRef = null;
      });
      this.popoverRef.location.nativeElement.classList.add('popover');

      // Calculate the position of the popover element
      const buttonRect = this.elementRef.nativeElement.getBoundingClientRect();
      const buttonLeft = buttonRect.left + window.scrollX;
      const buttonTop = buttonRect.bottom + window.scrollY;
      const popoverWidth = this.popoverRef.location.nativeElement.offsetWidth;
      const popoverHeight = this.popoverRef.location.nativeElement.offsetHeight;
      const popoverLeft: number = buttonLeft + (buttonRect.width / 2) - (popoverWidth / 2);
      console.log(buttonLeft, (buttonRect.width / 2), (popoverWidth / 2))
      const popoverTop: number = buttonTop - popoverHeight - 10; // Adjust for padding

      // Set the position of the popover element
      this.popoverRef.location.nativeElement.style.position = 'absolute';
      this.popoverRef.location.nativeElement.style.top = `${popoverTop}px`;
      this.popoverRef.location.nativeElement.style.left = `-${popoverLeft}px`;

      window.addEventListener('resize', () => {
        // Recalculate the position of the popover element on window resize
        const buttonRect = this.elementRef.nativeElement.getBoundingClientRect();
        const buttonLeft = buttonRect.left + window.scrollX;
        const buttonTop = buttonRect.bottom + window.scrollY;
        const popoverWidth = this.popoverRef.location.nativeElement.offsetWidth;
        const popoverHeight = this.popoverRef.location.nativeElement.offsetHeight;
        const popoverLeft: number = buttonLeft + (buttonRect.width / 2) - (popoverWidth / 2);
        const popoverTop: number = buttonTop - popoverHeight - 10; // Adjust for padding

        // Set the position of the popover element
        this.popoverRef.location.nativeElement.style.top = `${popoverTop}px`;
        this.popoverRef.location.nativeElement.style.left = `${popoverLeft}px`;
      });
    }

    this.popoverRef.instance.toggle();
  }
}
