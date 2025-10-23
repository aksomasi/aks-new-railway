import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem, CustomizationOption } from '../../models/interfaces';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-customize-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customize-modal.component.html',
  styleUrls: ['./customize-modal.component.scss']
})
export class CustomizeModalComponent {
  @Input() item: MenuItem | null = null;
  @Input() options: CustomizationOption[] = [];
  @Output() closeModal = new EventEmitter<void>();

  selectedOptions: { [key: string]: CustomizationOption } = {};

  constructor(private cartService: CartService) {}

  get availableOptions(): CustomizationOption[] {
    return this.options; // Show all options but disable unavailable ones
  }

  get totalPrice(): number {
    const basePrice = this.item ? this.item.price : 0;
    const customPrice = Object.values(this.selectedOptions).reduce((sum, opt) => sum + (+opt.price), 0);
    return basePrice + customPrice;
  }

  isSelected(optionId: string): boolean {
    return !!this.selectedOptions[optionId];
  }

  toggleOption(option: CustomizationOption): void {
    if (this.selectedOptions[option.id]) {
      delete this.selectedOptions[option.id];
    } else {
      this.selectedOptions[option.id] = option;
    }
  }

  addToCart(): void {
    if (!this.item) return;

    const customPrice = Object.values(this.selectedOptions).reduce((sum, opt) => sum + (+opt.price), 0);
    const customizations = Object.values(this.selectedOptions);

    this.cartService.addItem({
      ...this.item,
      qty: 1,
      customizations,
      customPrice,
      cartId: Date.now()
    });

    this.close();
  }

  close(): void {
    this.selectedOptions = {};
    this.closeModal.emit();
  }
}