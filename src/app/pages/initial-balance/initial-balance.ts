import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-initial-balance',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    HttpClientModule, 
    MatSnackBarModule
  ],
  templateUrl: './initial-balance.html',
  styleUrls: ['./initial-balance.scss']
})
export class InitialBalance implements OnInit {
  balanceForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.balanceForm = this.fb.group({
      initialBalance: [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    // No initialization logic needed here for now.
  }

  onSubmit(): void {
    if (this.balanceForm.valid) {
      // Retrieve the userId from local storage.
      // This userId must be saved there after a successful login.
      const userId = localStorage.getItem('userId');

      if (!userId) {
        this.snackBar.open('User not logged in. Please log in again.', 'Close', { duration: 5000 });
        this.router.navigate(['/login']);
        return;
      }

      // Prepare the data to be sent to the backend.
      // It now includes both the balance and the userId.
      const balanceData = {
        initialBalance: this.balanceForm.value.initialBalance,
        userId: userId
      };

      this.http.post('http://localhost:3000/api/user/balance', balanceData)
        .subscribe({
          next: (response: any) => {
            console.log('Balance saved successfully:', response);
            this.snackBar.open('Balance saved! Redirecting to home...', 'Close', {
              duration: 3000,
            });
            this.router.navigate(['/home']);
          },
          error: (error) => {
            console.error('Failed to save balance:', error);
            let errorMessage = 'Failed to save balance. Please try again.';
            this.snackBar.open(errorMessage, 'Close', {
              duration: 5000,
            });
          }
        });
    } else {
      this.balanceForm.markAllAsTouched();
      console.log('Form is invalid.');
    }
  }
}