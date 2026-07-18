import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { AnnouncementStore } from '../../core/store/announcement.store';
import { FormStore } from '../../core/store/form.store';
import { UpdateAnnouncementRequest } from '../../core/models/announcement.model';

@Component({
  selector: 'app-post-editor',
  templateUrl: './post-editor.component.html',
  styleUrls: ['./post-editor.component.scss'],
  imports: [FormsModule, MarkdownPipe],
})
export class PostEditorComponent implements OnInit, OnDestroy {
  private readonly announcementStore = inject(AnnouncementStore);
  private readonly formStore = inject(FormStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  isEditMode = false;
  announcementId = 0;

  title = '';
  image = '';
  text = '';
  category = '';
  duration = '';
  button = '';

  readonly canUndo = this.formStore.canUndo;
  readonly canRedo = this.formStore.canRedo;
  readonly currentValues = this.formStore.currentValues;
  readonly isLoading = this.announcementStore.isLoading;
  readonly error = this.announcementStore.error;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.announcementId = +id;
      this.announcementStore.loadMyAnnouncements();
      // Load existing data
      setTimeout(() => {
        const existing = this.announcementStore
          .announcements()
          .find((a) => a.id === this.announcementId);
        if (existing) {
          this.title = existing.title;
          this.image = existing.image;
          this.text = existing.text;
          this.category = existing.category;
          this.duration = existing.duration;
          this.button = existing.button;
          this.formStore.initialize({
            id: existing.id,
            title: existing.title,
            image: existing.image,
            text: existing.text,
            category: existing.category,
            duration: existing.duration,
            button: existing.button,
          });
        }
      }, 500);
    } else {
      this.formStore.initialize({
        id: 0,
        title: '',
        image: '',
        text: '',
        category: '',
        duration: '',
        button: '',
      });
    }
  }

  ngOnDestroy(): void {
    this.formStore.reset();
    this.announcementStore.clearCurrentAnnouncement();
  }

  onFieldChange(field: string, value: string): void {
    this.formStore.updateField(field as keyof UpdateAnnouncementRequest, value);
  }

  undo(): void {
    this.formStore.undo();
    this.syncFromHistory();
  }

  redo(): void {
    this.formStore.redo();
    this.syncFromHistory();
  }

  private syncFromHistory(): void {
    const values = this.formStore.currentValues();
    if (values) {
      this.title = values.title;
      this.image = values.image;
      this.text = values.text;
      this.category = values.category;
      this.duration = values.duration;
      this.button = values.button;
    }
  }

  onSubmit(): void {
    if (!this.title || !this.text) return;

    if (this.isEditMode) {
      this.announcementStore.updateAnnouncement({
        id: this.announcementId,
        title: this.title,
        image: this.image,
        text: this.text,
        category: this.category,
        duration: this.duration,
        button: this.button,
      });
    } else {
      this.announcementStore.createAnnouncement({
        title: this.title,
        image: this.image,
        text: this.text,
        category: this.category,
        duration: this.duration,
        button: this.button,
      });
    }

    setTimeout(() => this.router.navigate(['/admin']), 500);
  }
}
