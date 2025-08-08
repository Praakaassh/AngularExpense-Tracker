import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Find and update this interface
export interface Transaction {
  name: string;
  date: string;
  amount: number;
  status: string; // We can keep this for now
  type: 'income' | 'expense'; // <-- ADD THIS LINE
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit {
  userEmail: string = '...';
  balance: number = 0;
  totalIncome: number = 0;
  totalExpenses: number = 0;
  transactions: Transaction[] = [];
  isLoading: boolean = true;
  
  isModalOpen = false;
  transactionForm: FormGroup;
  expenseCategories = ['Groceries', 'Utilities', 'Rent', 'Entertainment', 'Transportation', 'Health', 'Other'];

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.transactionForm = this.fb.group({
      type: ['expense', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      incomeDescription: [''],
      expenseCategory: [''],
      customExpenseDescription: ['']
    });
  }

  ngOnInit(): void {
    this.fetchDashboardData();
    this.setupDynamicValidators();
  }

  setupDynamicValidators(): void {
    const typeControl = this.transactionForm.get('type');
    const incomeDescControl = this.transactionForm.get('incomeDescription');
    const expenseCatControl = this.transactionForm.get('expenseCategory');
    const customDescControl = this.transactionForm.get('customExpenseDescription');

    typeControl?.valueChanges.subscribe(type => {
      if (type === 'income') {
        incomeDescControl?.setValidators([Validators.required]);
        expenseCatControl?.clearValidators();
        customDescControl?.clearValidators();
      } else { 
        incomeDescControl?.clearValidators();
        expenseCatControl?.setValidators([Validators.required]);
        if (expenseCatControl?.value === 'Other') {
          customDescControl?.setValidators([Validators.required]);
        }
      }
      incomeDescControl?.updateValueAndValidity();
      expenseCatControl?.updateValueAndValidity();
      customDescControl?.updateValueAndValidity();
    });

    expenseCatControl?.valueChanges.subscribe(category => {
      if (category === 'Other') {
        customDescControl?.setValidators([Validators.required]);
      } else {
        customDescControl?.clearValidators();
      }
      customDescControl?.updateValueAndValidity();
    });
    
    typeControl?.setValue(typeControl.value);
  }

  onSubmitTransaction(): void {
    if (this.transactionForm.invalid) {
      this.snackBar.open('Please fill out all fields correctly.', 'Close', { duration: 3000 });
      return;
    }
    
    const userId = localStorage.getItem('userId');
    const formValue = this.transactionForm.value;
    
    let finalDescription = '';
    if (formValue.type === 'income') {
      finalDescription = formValue.incomeDescription;
    } else { 
      finalDescription = formValue.expenseCategory === 'Other' 
        ? formValue.customExpenseDescription 
        : formValue.expenseCategory;
    }

    const transactionData = {
      userId: userId,
      description: finalDescription,
      amount: formValue.amount,
      type: formValue.type
    };

    this.http.post('http://localhost:3000/api/transactions', transactionData)
      .subscribe({
        next: () => {
          this.snackBar.open('Transaction added successfully!', 'Close', { duration: 3000 });
          this.closeModal();
          this.fetchDashboardData();
        },
        error: (error) => {
          console.error('Failed to add transaction:', error);
          this.snackBar.open('Failed to add transaction. Please try again.', 'Close', { duration: 5000 });
        }
      });
  }
  
  // FIX: This method now contains the necessary logic to fetch data
  // and stop the loading indicator.
  fetchDashboardData(): void {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.snackBar.open('You are not logged in. Redirecting...', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true; // Start loading
    this.http.get<any>(`http://localhost:3000/api/dashboard/${userId}`)
      .subscribe({
        next: (data) => {
          // Populate our component properties with data from the API
          this.userEmail = data.user.email;
          this.balance = data.balance;
          this.totalIncome = data.totalIncome;
          this.totalExpenses = data.totalExpenses;
          this.transactions = data.recentTransactions;
          this.isLoading = false; // Stop loading on success
        },
        error: (error) => {
          console.error('Failed to fetch dashboard data:', error);
          this.snackBar.open('Could not load dashboard data. Please try again.', 'Close', { duration: 5000 });
          this.isLoading = false; // Stop loading on error
        }
      });
  }

  openModal(): void {
    this.isModalOpen = true;
  }
  
  closeModal(): void {
    this.isModalOpen = false;
    this.transactionForm.reset({ type: 'expense', expenseCategory: '', incomeDescription: '', customExpenseDescription: '' });
  }
}