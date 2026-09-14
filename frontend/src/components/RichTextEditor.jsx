import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const TOOLBAR_OPTIONS = [
  [{ 'header': [1, 2, 3, 4, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'color': [] }, { 'background': [] }],
  ['blockquote', 'code-block'],
  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  [{ 'indent': '-1' }, { 'indent': '+1' }],
  ['link', 'image'],
  [{ 'align': [] }],
  ['clean']
];

export default function RichTextEditor({ value, onChange, placeholder }) {
  const modules = useMemo(() => ({
    toolbar: TOOLBAR_OPTIONS,
    clipboard: {
      matchVisual: false,
    },
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'blockquote', 'code-block',
    'list', 'bullet', 'indent',
    'link', 'image', 'align'
  ];

  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || 'Start writing your article content...'}
      />
    </div>
  );
}
