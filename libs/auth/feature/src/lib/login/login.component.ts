import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthFacade } from '@blog/auth/data-access';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [FormsModule],
})
export class LoginComponent {
  private readonly auth = inject(AuthFacade);
  private readonly router = inject(Router);

  username = '';
  password = '';

  readonly isLoading = this.auth.isLoading;
  readonly error = this.auth.error;

  onSubmit(): void {
    if (!this.username || !this.password) return;

    void this.auth.login({
      username: this.username,
      password: this.password,
    }).then(() => this.router.navigate(['/'])).catch(() => {});
  }
}
