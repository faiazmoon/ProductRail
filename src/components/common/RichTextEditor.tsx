import React, { useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  RotateCcw,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write requirements, user story, or details...',
  minHeight = '140px',
  disabled = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  // Sync external value changes into the editor if not initiated from within
  useEffect(() => {
    if (editorRef.current && !isInternalUpdate.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
    isInternalUpdate.current = false;
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isInternalUpdate.current = true;
      const html = editorRef.current.innerHTML;
      onChange(html === '<br>' ? '' : html);
    }
  };

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (disabled) return;
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const promptLink = () => {
    if (disabled) return;
    const url = prompt('Enter hyperlink URL: (e.g. https://...):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const promptHeading = (tag: string) => {
    if (disabled) return;
    executeCommand('formatBlock', `<${tag}>`);
  };

  return (
    <div className={`w-full rounded-xl border border-white/[0.12] bg-[#10141e] overflow-hidden transition-all focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50 ${
      disabled ? 'opacity-70 cursor-not-allowed' : ''
    }`}>
      {/* Formatting Toolbar */}
      {!disabled && (
        <div className="flex flex-wrap items-center gap-0.5 p-1.5 bg-[#141926] border-b border-white/[0.08] text-slate-300">
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className="p-1.5 rounded hover:bg-white/[0.08] hover:text-white transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold size={13} />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className="p-1.5 rounded hover:bg-white/[0.08] hover:text-white transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic size={13} />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('underline')}
            className="p-1.5 rounded hover:bg-white/[0.08] hover:text-white transition-colors"
            title="Underline"
          >
            <Underline size={13} />
          </button>

          <span className="w-[1px] h-4 bg-white/[0.1] mx-1" />

          <button
            type="button"
            onClick={() => promptHeading('h3')}
            className="p-1.5 rounded hover:bg-white/[0.08] hover:text-white transition-colors font-bold text-xs"
            title="Heading 1"
          >
            <Heading1 size={13} />
          </button>
          <button
            type="button"
            onClick={() => promptHeading('h4')}
            className="p-1.5 rounded hover:bg-white/[0.08] hover:text-white transition-colors font-bold text-xs"
            title="Heading 2"
          >
            <Heading2 size={13} />
          </button>

          <span className="w-[1px] h-4 bg-white/[0.1] mx-1" />

          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-1.5 rounded hover:bg-white/[0.08] hover:text-white transition-colors"
            title="Bullet List"
          >
            <List size={13} />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            className="p-1.5 rounded hover:bg-white/[0.08] hover:text-white transition-colors"
            title="Numbered List"
          >
            <ListOrdered size={13} />
          </button>

          <span className="w-[1px] h-4 bg-white/[0.1] mx-1" />

          <button
            type="button"
            onClick={() => promptHeading('blockquote')}
            className="p-1.5 rounded hover:bg-white/[0.08] hover:text-white transition-colors"
            title="Blockquote"
          >
            <Quote size={13} />
          </button>
          <button
            type="button"
            onClick={() => promptHeading('pre')}
            className="p-1.5 rounded hover:bg-white/[0.08] hover:text-white transition-colors"
            title="Code Block"
          >
            <Code size={13} />
          </button>
          <button
            type="button"
            onClick={promptLink}
            className="p-1.5 rounded hover:bg-white/[0.08] hover:text-white transition-colors"
            title="Hyperlink"
          >
            <LinkIcon size={13} />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('removeFormat')}
            className="p-1.5 rounded hover:bg-white/[0.08] hover:text-white transition-colors"
            title="Clear Formatting"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      )}

      {/* Editable Canvas */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onBlur={handleInput}
        style={{ minHeight }}
        data-placeholder={placeholder}
        className="p-3 text-xs text-slate-100 leading-relaxed focus:outline-none overflow-y-auto max-h-72 prose prose-invert prose-xs max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-500 empty:before:pointer-events-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-white [&_h3]:my-1.5 [&_h4]:text-xs [&_h4]:font-bold [&_h4]:text-slate-200 [&_h4]:my-1 [&_blockquote]:border-l-2 [&_blockquote]:border-blue-500 [&_blockquote]:pl-2.5 [&_blockquote]:italic [&_blockquote]:text-slate-300 [&_pre]:bg-black/50 [&_pre]:p-2 [&_pre]:rounded [&_pre]:font-mono [&_pre]:text-[11px] [&_a]:text-blue-400 [&_a]:underline"
      />
    </div>
  );
};
