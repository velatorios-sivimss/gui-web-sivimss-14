import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NumberDirective} from './directives/only-numbers.directive';
import {TwoDigitDecimaNumbersDirective} from './directives/two-digit-decimal-numbers.directive';
import {LettersDirective} from './directives/only-letters.directive';
import {AlphanumericDirective} from './directives/only-alphanumeric.directive';
import {TrimmerDirective} from './directives/trimmer.directive';
import {TextDirective} from './directives/only-text.directive';
import {OnCloseOnNavigationDirective} from "./directives/close-on-navigation.directive";
import {PopoverDirective} from "./directives/popover.directive";
import {TextColorDirective} from "./directives/text-color.directive";
import { FolioODSAlphanumericDirective } from './directives/folio-ods-alphanumeric.directive';
import {LettersDirectiveTextArea} from "./directives/only-letters-text-area.directive";
import { WithoutSpecialCharDirective } from './directives/without-special-char.directive';

@NgModule({
  declarations: [
    NumberDirective,
    TwoDigitDecimaNumbersDirective,
    LettersDirective,
    LettersDirectiveTextArea,
    AlphanumericDirective,
    TrimmerDirective,
    TextDirective,
    OnCloseOnNavigationDirective,
    PopoverDirective,
    TextColorDirective,
    FolioODSAlphanumericDirective,
    WithoutSpecialCharDirective,
  ],
  imports: [
    CommonModule
  ],
    exports: [
        NumberDirective,
        TwoDigitDecimaNumbersDirective,
        LettersDirective,
        LettersDirectiveTextArea,
        AlphanumericDirective,
        TrimmerDirective,
        TextDirective,
        OnCloseOnNavigationDirective,
        PopoverDirective,
        TextColorDirective,
        FolioODSAlphanumericDirective,
        WithoutSpecialCharDirective,
    ]
})
export class UtileriaModule {
}
