import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterLink], // Use ReactiveFormsModule for form handling
  templateUrl: './signup.html', // Reference to the HTML template
  styleUrls: ['./signup.scss'] // Reference to the CSS file
})
export class Signup{
  // A FormGroup to hold the form controls
  signupForm: FormGroup;

  // Inject FormBuilder and Router in the constructor
  constructor(private fb: FormBuilder, private router: Router) {
    // Initialize the form group with controls and validators
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      // Add a custom validator for password confirmation
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
   * Submits the form data.
   * In a real application, this would call a registration service.
   */
  onSubmit(): void {
    if (this.signupForm.valid) {
      console.log('Sign-up form submitted:', this.signupForm.value);

      // Simulate a successful registration
      alert('Registration successful! Navigating to login...');

      // Navigate to the login page after successful sign-up
      this.router.navigate(['/login']);
    } else {
      // Mark all form controls as touched to display validation errors
      this.signupForm.markAllAsTouched();
      console.log('Form is invalid.');
    }
  }
}
