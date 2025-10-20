import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ModalService, ModalData } from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit, OnDestroy {
  modalData: ModalData | null = null;
  private subscription: Subscription = new Subscription();

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    this.subscription = this.modalService.modal$.subscribe(data => {
      this.modalData = data;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onConfirm(): void {
    if (this.modalData?.onConfirm) {
      this.modalData.onConfirm();
    }
    this.modalService.close();
  }

  onCancel(): void {
    if (this.modalData?.onCancel) {
      this.modalData.onCancel();
    }
    this.modalService.close();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  getIconClass(): string {
    switch (this.modalData?.type) {
      case 'success': return 'icon-success';
      case 'error': return 'icon-error';
      case 'warning': return 'icon-warning';
      default: return 'icon-info';
    }
  }

  getModalClass(): string {
    return `modal-${this.modalData?.type || 'info'}`;
  }
}

