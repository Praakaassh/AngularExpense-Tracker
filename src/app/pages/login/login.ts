import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterLink], // <-- Add ReactiveFormsModule and CommonModule here
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      console.log('Login form submitted:', this.loginForm.value);
      this.router.navigate(['/home']);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}