import { OverlayRef } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { MdKeyboardContainerComponent } from './keyboard-container.component';

// TODO(josephperrott): Implement onAction observable.

/**
 * Reference to a keyboard dispatched from the keyboard service.
 */
export class MdKeyboardRef<T> {
  private _instance: T;

  /** The instance of the component making up the content of the keyboard. */
  get instance(): T {
    return this._instance;
  }

  /**
   * The instance of the component making up the content of the keyboard.
   * @docs-private
   */
  containerInstance: MdKeyboardContainerComponent;

  /** Subject for notifying the user that the keyboard has closed. */
  private _afterClosed: Subject<any> = new Subject();

  /** Subject for notifying the user that the keyboard has opened and appeared. */
  private _afterOpened: Subject<any>;

  /** Subject for notifying the user that the keyboard action was called. */
  private _onAction: Subject<any> = new Subject();

  constructor(instance: T,
              containerInstance: MdKeyboardContainerComponent,
              private _overlayRef: OverlayRef) {
    // Sets the readonly instance of the keyboard content component.
    this._instance = instance;
    this.containerInstance = containerInstance;
    // Dismiss keyboard on action.
    this.onAction().subscribe(() => this.dismiss());
    containerInstance._onExit().subscribe(() => this._finishDismiss());
  }

  /** Dismisses the keyboard. */
  dismiss(): void {
    if (!this._afterClosed.closed) {
      this.containerInstance.exit();
    }
  }

  /** Marks the keyboard action clicked. */
  _action(): void {
    if (!this._onAction.closed) {
      this._onAction.next();
      this._onAction.complete();
    }
  }

  /** Marks the keyboard as opened */
  _open(): void {
    if (!this._afterOpened.closed) {
      this._afterOpened.next();
      this._afterOpened.complete();
    }
  }

  /** Cleans up the DOM after closing. */
  private _finishDismiss(): void {
    this._overlayRef.dispose();
    this._afterClosed.next();
    this._afterClosed.complete();
  }

  /** Gets an observable that is notified when the keyboard is finished closing. */
  afterDismissed(): Observable<void> {
    return this._afterClosed.asObservable();
  }

  /** Gets an observable that is notified when the keyboard has opened and appeared. */
  afterOpened(): Observable<void> {
    return this.containerInstance._onEnter();
  }

  /** Gets an observable that is notified when the keyboard action is called. */
  onAction(): Observable<void> {
    return this._onAction.asObservable();
  }
}