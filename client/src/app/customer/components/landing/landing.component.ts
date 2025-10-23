import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Customer } from '../../models/interfaces';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  @Output() continue = new EventEmitter<Customer>();

  customer: Customer = {
    fullName: '',
    plate: '',
    carDetails: ''
  };

  errors: any = {};

  onPlateKeydown(event: any): void {
    // Prevent space key
    if (event.key === ' ' || event.keyCode === 32) {
      event.preventDefault();
    }
  }

  onPlateInput(event: any): void {
    const inputValue = event.target.value;
    // Remove spaces only
    const cleanValue = inputValue.replace(/\s/g, '');
    this.customer.plate = cleanValue;
    event.target.value = cleanValue;
  }

  onFullNameChange(): void {
    if (this.errors.fullName && this.customer.fullName.trim().length >= 2) {
      delete this.errors.fullName;
    }
  }

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    if (!this.customer.fullName.trim()) {
      this.errors.fullName = 'Full name is required';
      isValid = false;
    } else if (this.customer.fullName.trim().length < 2) {
      this.errors.fullName = 'Full name must be at least 2 characters';
      isValid = false;
    }

    return isValid;
  }

  continueToMenu(): void {
    if (this.validateForm()) {
      this.continue.emit(this.customer);
    }
  }
}