import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { CommonModule, CurrencyPipe, TitleCasePipe, DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpandMenu } from '../../components/expand-menu/expand-menu';
import { Chart } from 'chart.js/auto';

export interface Transaction {
  name: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
}

// Interface for our new categorized data
export interface ExpenseBreakdown {
  category: string;
  totalAmount: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule, CurrencyPipe, TitleCasePipe, DatePipe, ExpandMenu],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit, AfterViewChecked {
  userEmail: string = '...';
  balance: number = 0;
  totalIncome: number = 0;
  totalExpenses: number = 0;
  transactions: Transaction[] = [];
  expenseBreakdown: ExpenseBreakdown[] = []; // <-- ADDED THIS
  isLoading: boolean = true;
  
  isModalOpen = false;
  isMenuOpen = false;
  transactionForm: FormGroup;
  expenseCategories = ['Groceries', 'Utilities', 'Rent', 'Entertainment', 'Transportation', 'Health', 'Other'];
  expenseChart: Chart | undefined;
  private chartDrawn = false;

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

  ngAfterViewChecked(): void {
    if (!this.isLoading && !this.chartDrawn) {
      this.createChart();
    }
  }

  createChart(): void {
    const chartElement = document.getElementById('expenseChart') as HTMLCanvasElement;
    if (!chartElement) {
      return;
    }
    
    if (this.expenseChart) {
      this.expenseChart.destroy();
    }

    // Handle case with no expense data
    if (!this.expenseBreakdown || this.expenseBreakdown.length === 0) {
        const ctx = chartElement.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, chartElement.width, chartElement.height);
            ctx.textAlign = 'center';
            ctx.font = '16px sans-serif';
            ctx.fillText('No expense data to display.', chartElement.width / 2, chartElement.height / 2);
        }
        this.chartDrawn = true;
        return;
    }

    const labels = this.expenseBreakdown.map(item => item.category);
    const data = this.expenseBreakdown.map(item => item.totalAmount);
    
    // A consistent color palette for the chart slices
    const colorPalette = [
      'rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)', 'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)',
      'rgba(201, 203, 207, 0.8)', 'rgba(10, 150, 132, 0.8)'
    ];

    const backgroundColors = labels.map((_, index) => colorPalette[index % colorPalette.length]);
    const borderColors = backgroundColors.map(color => color.replace('0.8', '1'));

    this.expenseChart = new Chart(chartElement, {
      type: 'pie', // Changed to 'pie' for a better category view
      data: {
        labels: labels,
        datasets: [{
          label: 'Amount in USD',
          data: data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right', // Legend on the side works well for pie charts
          },
          // Add a title directly to the chart
          title: {
             display: true,
             text: 'Expense Breakdown by Category',
             font: { size: 18 }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                // Calculate total to show percentage
                const total = context.dataset.data.reduce((acc, current) => acc + (current as number), 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : 0;
                
                const formattedValue = new Intl.NumberFormat('en-US', { 
                  style: 'currency', currency: 'USD' 
                }).format(value);

                return `${label}: ${formattedValue} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    this.chartDrawn = true;
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
  
  fetchDashboardData(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.snackBar.open('You are not logged in. Redirecting...', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.chartDrawn = false;
    
    this.http.get<any>(`http://localhost:3000/api/dashboard/mysql/${userId}`)
      .subscribe({
        next: (data) => {
          this.userEmail = data.userEmail;
          this.balance = data.balance;
          this.totalIncome = data.totalIncome;
          this.totalExpenses = data.totalExpenses;
          this.transactions = data.recentTransactions;
          this.expenseBreakdown = data.expenseBreakdown; // <-- ADDED THIS
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to fetch dashboard data from MySQL:', error);
          this.snackBar.open('Could not load dashboard data. Please check the backend.', 'Close', { duration: 5000 });
          this.isLoading = false;
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

  openMenu(): void {
    this.isMenuOpen = true;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  logout(): void {
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
    this.snackBar.open('You have been logged out.', 'Close', { duration: 3000 });
  }
}