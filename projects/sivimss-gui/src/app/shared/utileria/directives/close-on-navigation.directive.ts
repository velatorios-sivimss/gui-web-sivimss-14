import {Directive, OnInit, OnDestroy, ComponentRef} from '@angular/core';
import {Router, NavigationStart} from '@angular/router';
import {DialogService, DynamicDialogComponent, DynamicDialogRef} from 'primeng/dynamicdialog';
import {Subscription} from 'rxjs';

@Directive({
  selector: '[onCloseOnNavigation]'
})
export class OnCloseOnNavigationDirective implements OnInit, OnDestroy {
  private subscription!: Subscription;

  constructor(
    private router: Router,
    private dialogService: DialogService
  ) {
  }

  ngOnInit(): void {
    this.subscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        const dialogs: Map<DynamicDialogRef, ComponentRef<DynamicDialogComponent>> = this.dialogService.dialogComponentRefMap;
        dialogs.forEach((dialog: ComponentRef<DynamicDialogComponent>) => {
          dialog.destroy();
        });
        history.back();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
