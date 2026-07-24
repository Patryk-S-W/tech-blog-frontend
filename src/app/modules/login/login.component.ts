import { Component, inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../../core/store/auth.store';
import { effect } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [FormsModule],
})
export class LoginComponent implements OnDestroy {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  username = '';
  password = '';

  readonly isLoading = this.authStore.isLoading;
  readonly error = this.authStore.error;

  private readonly authEffect = effect(() => {
    if (this.authStore.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  });

  ngOnDestroy(): void {
    this.authEffect.destroy();
  }

  onSubmit(): void {
    if (!this.username || !this.password) return;

    this.authStore.login({
      username: this.username,
      password: this.password,
    });
  }
}
