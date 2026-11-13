import { CanDeactivateFn } from '@angular/router';

interface CanLeaveEditor {
  canDeactivate(): boolean;
}

export const canDeactivatePostEditor: CanDeactivateFn<CanLeaveEditor> = (component) =>
  component.canDeactivate();
