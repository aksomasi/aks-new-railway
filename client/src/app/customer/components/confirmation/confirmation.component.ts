import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Customer } from '../../models/interfaces';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent {
  @Input() orderNumber!: string;
  @Input() customer!: Customer;
  @Output() newOrder = new EventEmitter<void>();
  @Output() resetOrder = new EventEmitter<void>();
}