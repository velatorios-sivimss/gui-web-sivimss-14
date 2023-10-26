import { Directive, ElementRef, HostListener } from "@angular/core";

@Directive({
    selector: 'input[twoDigitDecimaNumber]'
})
export class TwoDigitDecimaNumbersDirective {
    public text:string = '';

    private regex: RegExp = new RegExp(/^\d*\.?\d{0,2}$/g);
    private specialKeys: Array<string> = ['Backspace', 'Tab'];

    constructor(private el: ElementRef) {
    }
    @HostListener('keypress', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        if (this.specialKeys.indexOf(event.key) !== -1) {
            return;
        }
        const current: string = this.el.nativeElement.value;
        const next: string = current.concat(event.key);

        if (next.includes('.')) {
            if (this.text == next) {
                event.preventDefault();
            }
            this.text = next;
        }
        if ((next && !RegExp(this.regex).exec(String(next)))) {
            event.preventDefault();
        }
    }
}
