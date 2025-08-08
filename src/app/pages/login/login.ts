import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HttpClientModule, MatSnackBarModule],
  templateUrl: './login.html', // This should be the path to your login HTML template
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const userData = this.loginForm.value;

      this.http.post('http://localhost:3000/api/login', userData)
        .subscribe({
          next: (response: any) => {
            console.log('Login successful:', response);
            this.snackBar.open('Login successful! Redirecting...', 'Close', {
              duration: 3000,
            });
            // You can store user data here, e.g., in a service or local storage
            this.router.navigate(['/home']);
          },
          error: (error) => {
            console.error('Login failed:', error);
            let errorMessage = 'Invalid email or password. Please try again.';
            this.snackBar.open(errorMessage, 'Close', {
              duration: 5000,
            });
          }
        });
    } else {
      this.loginForm.markAllAsTouched();
      console.log('Form is invalid.');
    }
  }
}
