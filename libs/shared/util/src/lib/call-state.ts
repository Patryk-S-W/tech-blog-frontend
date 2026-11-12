import { patchState, signalStoreFeature, withMethods, withState } from '@ngrx/signals';

export function withCallState() {
  return signalStoreFeature(
    withState({ isLoading: false, error: null as string | null }),
    withMethods((store) => ({
      startCall(): void { patchState(store, { isLoading: true, error: null }); },
      finishCall(): void { patchState(store, { isLoading: false }); },
      failCall(message: string): void { patchState(store, { isLoading: false, error: message }); },
      clearError(): void { patchState(store, { error: null }); },
    }))
  );
}
