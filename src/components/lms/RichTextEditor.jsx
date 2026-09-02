import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

export default function RichTextEditor({ value, onChange, placeholder = 'Nhập nội dung tại đây...' }) {
  const apiKey = import.meta.env.VITE_TINYMCE_API_KEY || 'no-api-key';

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-500">
      <Editor
        apiKey={apiKey}
        value={value}
        onEditorChange={(content) => onChange(content)}
        init={{
          height: 250,
          menubar: false,
          placeholder: placeholder,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | code | help',
          content_style: 'body { font-family:Inter,Helvetica,Arial,sans-serif; font-size:14px }',
        }}
      />
    </div>
  );
}
