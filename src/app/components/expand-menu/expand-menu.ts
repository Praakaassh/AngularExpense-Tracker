import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-expand-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expand-menu.html',
  styleUrls: ['./expand-menu.scss']
})
export class ExpandMenu {
  @Input() isMenuOpen = false;
  @Output() menuClosed = new EventEmitter<void>();

  constructor(private router: Router, private snackBar: MatSnackBar) {}

  closeMenu() {
    this.menuClosed.emit();
  }

  logout(): void {
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
    this.snackBar.open('You have been logged out.', 'Close', { duration: 3000 });
  }
  loanPredictor(): void {
    this.router.navigate(['/loan']);
  }
}