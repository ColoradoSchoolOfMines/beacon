/**
 * @file WYSIWYG markdown editor
 */

import "@milkdown/theme-nord/style.css";

import {
  defaultValueCtx,
  Editor,
  editorViewOptionsCtx,
  rootCtx,
} from "@milkdown/core";
import {listener, listenerCtx} from "@milkdown/plugin-listener";
import {commonmark} from "@milkdown/preset-commonmark";
import {gfm} from "@milkdown/preset-gfm";
import {Milkdown, MilkdownProvider, useEditor} from "@milkdown/react";
import {nord} from "@milkdown/theme-nord";
import {replaceAll} from "@milkdown/utils";
import {
  ProsemirrorAdapterProvider,
  usePluginViewFactory,
} from "@prosemirror-adapter/react";
import React, {useEffect} from "react";

import {Mentions, slashMentions} from "~/components/markdown/Mentions";

/**
 * Props for WYSIWYG markdown editor
 */
interface MarkdownProps {
  /**
   * Github-Flavored Markdown (GFM) content
   * @default "" (empty string)
   */
  content?: string;

  /**
   * Content change event handler
   * @param value New value
   */
  onChange?: (value: string) => void;

  /**
   * Whether or not the editor is read-only
   * @default false
   */
  readonly?: boolean;
}

/**
 * Internal Milkdown editor
 * @returns JSX
 */
const MilkdownEditor: React.FC<MarkdownProps> = ({
  content,
  onChange,
  readonly,
}) => {
  const pluginViewFactory = usePluginViewFactory();

  // Hooks
  const {get} = useEditor(root =>
    Editor.make()
      .config(nord)
      .config(ctx => {
        // Set the root element
        ctx.set(rootCtx, root);

        // Set the slash view
        ctx.set(slashMentions.key, {
          view: pluginViewFactory({
            component: Mentions,
          }),
        });

        // Set the default content
        if (content !== undefined) {
          ctx.set(defaultValueCtx, content);
        }

        // Listen to content changes
        const listener = ctx.get(listenerCtx);

        listener.markdownUpdated((_, newContent, oldContent) => {
          if (onChange !== undefined && newContent !== oldContent) {
            onChange(newContent);
          }
        });
      })
      .use(commonmark)
      .use(gfm)
      .use(listener)
      .use(slashMentions)
  );

  // Effects
  useEffect(() => {
    // Get the editor instance
    const editor = get();

    if (editor === undefined) {
      return;
    }

    editor.ctx.update(editorViewOptionsCtx, prev => ({
      ...prev,
      /**
       * Whether or not the editor is editable
       * @returns Whether or not the editor is editable
       */
      editable: () => !readonly,
    }));
  });

  useEffect(() => {
    if (content === undefined) {
      return;
    }

    // Get the editor instance
    const editor = get();

    if (editor === undefined) {
      return;
    }

    // Replace all content
    editor.action(replaceAll(content));
  }, [content]);

  return <Milkdown />;
};

/**
 * WYSIWYG markdown editor
 * @returns JSX
 */
export const Markdown: React.FC<MarkdownProps> = (
  {content, onChange, readonly} = {
    content: "",
    readonly: false,
  }
) => (
  <MilkdownProvider>
    <ProsemirrorAdapterProvider>
      <MilkdownEditor
        content={content}
        onChange={onChange}
        readonly={readonly}
      />
    </ProsemirrorAdapterProvider>
  </MilkdownProvider>
);
