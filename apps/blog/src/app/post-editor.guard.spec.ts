import { canDeactivatePostEditor } from './post-editor.guard';

describe('canDeactivatePostEditor', () => {
  it('uses the editor decision for stay, leave, clean and pending states', () => {
    const editor = { canDeactivate: jest.fn().mockReturnValue(false) };
    expect(canDeactivatePostEditor(editor, {} as never, {} as never, {} as never)).toBe(false);
    editor.canDeactivate.mockReturnValue(true);
    expect(canDeactivatePostEditor(editor, {} as never, {} as never, {} as never)).toBe(true);
    expect(editor.canDeactivate).toHaveBeenCalledTimes(2);
  });
});
