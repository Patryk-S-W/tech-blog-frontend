import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '../../core/store/auth.store';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [FormsModule],
})
export class LoginComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  username = '';
  password = '';

  readonly isLoading = this.authStore.isLoading;
  readonly error = this.authStore.error;

  onSubmit(): void {
    if (!this.username || !this.password) return;

    this.authStore.login({
      username: this.username,
      password: this.password,
    });

    // Navigate after successful login
    const checkAuth = setInterval(() => {
      if (this.authStore.isAuthenticated()) {
        clearInterval(checkAuth);
        this.router.navigate(['/']);
      }
    }, 100);
  }
}
