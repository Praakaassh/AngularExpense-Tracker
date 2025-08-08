import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // <-- Added MatSnackBar and MatSnackBarModule

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HttpClientModule, MatSnackBarModule], // <-- Added MatSnackBarModule
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss']
})
export class Signup {
  signupForm: FormGroup;
  
  // Inject FormBuilder, Router, HttpClient, and MatSnackBar in the constructor
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar // <-- Injected MatSnackBar
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  /**
   * Custom validator to check if password and confirm password match.
   */
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { mismatch: true };
  }

  /**
   * Submits the form data to the backend for user registration.
   */
  onSubmit(): void {
    if (this.signupForm.valid) {
      console.log('Sign-up form submitted:', this.signupForm.value);

      const userData = {
        email: this.signupForm.value.email,
        password: this.signupForm.value.password
      };

      // Make an HTTP POST request to your backend API
      this.http.post('http://localhost:3000/api/signup', userData)
        .subscribe({
          next: (response: any) => {
            // On successful registration, show a snackbar and navigate
            this.snackBar.open('Registration successful! Redirecting...', 'Close', {
              duration: 3000,
            });
            console.log('Registration successful:', response);
            this.router.navigate(['/login']);
          },
          error: (error) => {
            // On error, show an appropriate snackbar message
            console.error('Registration failed:', error);
            let errorMessage = 'Registration failed. Please try again.';
            if (error.status === 409) {
              errorMessage = 'This email is already in use.';
            }
            this.snackBar.open(errorMessage, 'Close', {
              duration: 5000,
            });
          }
        });

    } else {
      this.signupForm.markAllAsTouched();
      console.log('Form is invalid.');
    }
  }
}
