import {
  Component,
  computed,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MarkdownPipe } from '@blog/shared/ui';
import { AnnouncementEditorFacade, AnnouncementsFacade } from '@blog/articles/data-access';
import { UpdateAnnouncementRequest } from '@blog/articles/entity';

@Component({
  selector: 'app-post-editor',
  templateUrl: './post-editor.component.html',
  styleUrls: ['./post-editor.component.scss'],
  imports: [FormsModule, MarkdownPipe],
})
export class PostEditorComponent implements OnInit, OnDestroy {
  private readonly announcementsFacade = inject(AnnouncementsFacade);
  private readonly editor = inject(AnnouncementEditorFacade);
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

  readonly canUndo = this.editor.canUndo;
  readonly canRedo = this.editor.canRedo;
  readonly currentValues = this.editor.currentValues;
  readonly isLoading = computed(() => this.editor.isLoading() || this.announcementsFacade.isLoading());
  readonly error = computed(() => this.editor.error() ?? this.announcementsFacade.error());

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.announcementId = +id;
      void this.editor.loadMyAnnouncementById(this.announcementId).then(() => {
        const existing = this.editor.currentAnnouncement();
        if (!existing) return;
        this.editor.initialize(existing);
        this.title = existing.title;
        this.image = existing.image;
        this.text = existing.text;
        this.category = existing.category;
        this.duration = existing.duration;
        this.button = existing.button;
      }).catch(() => {});
    } else {
      this.editor.initialize({
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
    this.editor.reset();
    this.announcementsFacade.clearCurrentAnnouncement();
  }

  onFieldChange(field: string, value: string): void {
    this.editor.updateField(field as keyof UpdateAnnouncementRequest, value);
  }

  undo(): void {
    this.editor.undo();
    this.syncFromHistory();
  }

  redo(): void {
    this.editor.redo();
    this.syncFromHistory();
  }

  private syncFromHistory(): void {
    const values = this.editor.currentValues();
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
      void this.announcementsFacade.updateAnnouncement({
        id: this.announcementId,
        title: this.title,
        image: this.image,
        text: this.text,
        category: this.category,
        duration: this.duration,
        button: this.button,
      }).then(() => this.router.navigate(['/admin'])).catch(() => {});
    } else {
      void this.announcementsFacade.createAnnouncement({
        title: this.title,
        image: this.image,
        text: this.text,
        category: this.category,
        duration: this.duration,
        button: this.button,
      }).then(() => this.router.navigate(['/admin'])).catch(() => {});
    }
  }
}
