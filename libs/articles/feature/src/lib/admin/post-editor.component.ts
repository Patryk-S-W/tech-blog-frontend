import {
  Component,
  computed,
  signal,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MarkdownPipe } from '@blog/shared/ui';
import { AnnouncementEditorFacade, AnnouncementsFacade } from '@blog/articles/data-access';
import { UpdateAnnouncementRequest } from '@blog/articles/entity';

@Component({
  selector: 'app-post-editor',
  templateUrl: './post-editor.component.html',
  styleUrls: ['./post-editor.component.scss'],
  imports: [FormsModule, MarkdownPipe, RouterLink, DatePipe],
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
  private readonly submitting = signal(false);
  readonly publicationPending = signal(false);
  private readonly savedBaseline = signal<UpdateAnnouncementRequest | null>(null);
  readonly isDirty = computed(() => {
    const current = this.currentValues();
    const baseline = this.savedBaseline();
    return !!current && !!baseline && editableFields.some((field) => current[field] !== baseline[field]);
  });
  readonly currentAnnouncement = this.editor.currentAnnouncement;
  readonly isLoading = computed(() => this.editor.isLoading() || this.submitting() || this.publicationPending() || this.announcementsFacade.isLoading());
  readonly error = computed(() => this.editor.error() ?? this.announcementsFacade.error());

  private readonly beforeUnload = (event: BeforeUnloadEvent): void => {
    if (!this.isDirty()) return;
    event.preventDefault();
    event.returnValue = '';
  };

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.addEventListener('beforeunload', this.beforeUnload);

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.announcementId = +id;
      void this.loadExisting();
    } else {
      const empty = {
        id: 0,
        title: '',
        image: '',
        text: '',
        category: '',
        duration: '',
        button: '',
      };
      this.editor.initialize(empty);
      this.savedBaseline.set(empty);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) window.removeEventListener('beforeunload', this.beforeUnload);
    this.editor.reset();
    this.announcementsFacade.clearCurrentAnnouncement();
    this.savedBaseline.set(null);
  }

  canEdit(): boolean {
    return !this.isEditMode || this.savedBaseline() !== null;
  }

  canSave(): boolean {
    return this.canEdit() && !this.isLoading() && this.isDirty() && !!this.title && !!this.text;
  }

  canDeactivate(): boolean {
    if (this.submitting() || this.publicationPending() || this.announcementsFacade.isLoading()) return false;
    return !this.isDirty() || !isPlatformBrowser(this.platformId) || window.confirm('You have unsaved changes. Leave this page?');
  }

  private async loadExisting(): Promise<void> {
    try {
      await this.editor.loadMyAnnouncementById(this.announcementId);
      const existing = this.editor.currentAnnouncement();
      if (!existing) return;
      const values = this.valuesFrom(existing);
      this.editor.initialize(values);
      this.savedBaseline.set({ ...values });
      this.title = values.title;
      this.image = values.image;
      this.text = values.text;
      this.category = values.category;
      this.duration = values.duration;
      this.button = values.button;
    } catch {
      // The editor facade exposes the safe load error for the template.
    }
  }

  retryLoad(): void {
    if (this.isEditMode && !this.isLoading()) void this.loadExisting();
  }

  async setPublished(publish: boolean): Promise<void> {
    const item = this.currentAnnouncement();
    if (!this.isEditMode || !item || this.isDirty() || this.isLoading()) return;
    this.publicationPending.set(true);
    this.editor.clearError();
    this.announcementsFacade.clearError();
    try {
      if (publish) await this.editor.publishAnnouncement(item.id);
      else await this.editor.unpublishAnnouncement(item.id);
    } catch {
      // The facade keeps the current publication state and exposes the safe error.
    } finally {
      this.publicationPending.set(false);
    }
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

  async onSubmit(): Promise<void> {
    if (!this.canSave()) return;
    const values = this.currentValues();
    if (!values) return;

    this.submitting.set(true);
    this.editor.clearError();
    this.announcementsFacade.clearError();
    try {
      if (this.isEditMode) await this.announcementsFacade.updateAnnouncement(values);
      else await this.announcementsFacade.createAnnouncement(values);
      this.savedBaseline.set({ ...values });
      this.submitting.set(false);
      await this.router.navigate(['/admin']);
    } catch {
      // Keep the current form and history available for retry.
    } finally {
      this.submitting.set(false);
    }
  }

  private valuesFrom(item: UpdateAnnouncementRequest): UpdateAnnouncementRequest {
    return {
      id: item.id,
      title: item.title,
      image: item.image,
      text: item.text,
      category: item.category,
      duration: item.duration,
      button: item.button,
    };
  }
}

const editableFields = ['title', 'image', 'text', 'category', 'duration', 'button'] as const;
