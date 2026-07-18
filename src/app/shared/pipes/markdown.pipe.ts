import { Pipe, PipeTransform } from '@angular/core';
import { Marked } from 'marked';

const marked = new Marked();

@Pipe({ name: 'markdown', standalone: true })
export class MarkdownPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';

    const result = marked.parse(value);
    if (typeof result === 'string') return result;

    // marked.parse can return a Promise in some configs; sync mode returns string
    return '';
  }
}
