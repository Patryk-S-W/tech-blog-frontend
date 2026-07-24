import {
  Component,
  computed,
  inject,
  OnInit,
  OnDestroy,
  signal,
  effect,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { AnnouncementStore } from '../../core/store/announcement.store';
import { AnnouncementService } from '../../core/services/announcement.service';
import { FormStore } from '../../core/store/form.store';
import {
  UpdateAnnouncementRequest,
  AnnouncementDto,
} from '../../core/models/announcement.model';

@Component({
  selector: 'app-post-editor',
  templateUrl: './post-editor.component.html',
  styleUrls: ['./post-editor.component.scss'],
  imports: [FormsModule, MarkdownPipe],
})
export class PostEditorComponent implements OnInit, OnDestroy {
  private readonly store = inject(AnnouncementStore);
  private readonly service = inject(AnnouncementService);
  private readonly formStore = inject(FormStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

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

  private readonly editId = signal<number | undefined>(undefined);

  private readonly announcementResource = rxResource<AnnouncementDto, number>({
    params: () => this.editId(),
    stream: ({ params }) => this.service.getMyAnnouncementById(params),
  });

  readonly isLoading = this.announcementResource.isLoading;
  readonly error = computed(
    () => this.announcementResource.error()?.message ?? null
  );

  private readonly loadEffect = effect(() => {
    const item = this.announcementResource.value();
    if (item && !this.title) {
      this.title = item.title;
      this.image = item.image;
      this.text = item.text;
      this.category = item.category;
      this.duration = item.duration;
      this.button = item.button;
      this.formStore.initialize({
        id: item.id,
        title: item.title,
        image: item.image,
        text: item.text,
        category: item.category,
        duration: item.duration,
        button: item.button,
      });
    }
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.announcementId = +id;
      this.editId.set(+id);
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
    this.loadEffect.destroy();
    this.formStore.reset();
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

  async onSubmit(): Promise<void> {
    if (!this.title || !this.text) return;

    if (this.isEditMode) {
      await this.store.updateAnnouncement({
        id: this.announcementId,
        title: this.title,
        image: this.image,
        text: this.text,
        category: this.category,
        duration: this.duration,
        button: this.button,
      });
    } else {
      await this.store.createAnnouncement({
        title: this.title,
        image: this.image,
        text: this.text,
        category: this.category,
        duration: this.duration,
        button: this.button,
      });
    }

    this.router.navigate(['/admin']);
  }
}
