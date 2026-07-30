import { useRef } from 'react';

import { Editor } from '@tinymce/tinymce-react';
import { saveAs } from 'file-saver';

// sever based libray use it in backend
// import HTMLtoDOCX from "html-to-docx";
import jsPDF from 'jspdf';

// imports 
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function TextEditor() {
  const editorRef = useRef<any>(null);
  const inputFileRef = useRef<any>(null);

  // 👉 Get content from editor
  const getContent = () => {
    if (!editorRef.current) return '';
    return editorRef.current.getContent();
  };

  // 👉 Convert HTML → plain text
  const htmlToText = (html: any) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  // 📄 Download TXT
  const downloadTxt = () => {
    const html = getContent();
    const text = htmlToText(html);

    const blob = new Blob([text], {
      type: 'text/plain;charset=utf-8',
    });

    saveAs(blob, 'content.txt');
  };

  // 📘 Download Word (.docx)
  const downloadWord = async () => {
    const html = getContent();

    // const fileBuffer = await HTMLtoDOCX(html);

    // saveAs(
    //   new Blob([fileBuffer]),
    //   "document.docx"
    // );
    console.log("Server based libraray html to wordx should be in backend.", html);
  };

  const downloadPDF = async () => {
    const html = getContent();

    const pdf = new jsPDF("p", "mm", "a4");

    const container = document.createElement("div");
    container.innerHTML = html;

    await pdf.html(container, {
      callback: (doc) => {
        doc.save("document.pdf");
      },
      margin: [10, 10, 10, 10],
      width: 190,       // printable width in mm
      windowWidth: 800, // CSS layout width
      autoPaging: "text",
    });
  };



  const handleImport = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    console.log("File is ", file);

    if (!file) return;

    if (
      file.name.endsWith(".docx")
    ) {
      await importWord(file);
    }

    if (
      file.name.endsWith(".pdf")
    ) {
      await importPDF(file);
    }
  };

  const importWord = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();

    const result = await mammoth.convertToHtml({
      arrayBuffer,
    });

    if (editorRef.current) {
      editorRef.current.setContent(result.value);
    }
  };

  const importPDF = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();

    console.log(arrayBuffer);

    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
    }).promise;

    console.log(pdf);

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);

      const content = await page.getTextContent();

      console.log("Content:", content);
      console.log("Items:", content.items);

      text += content.items
        .map((item: any) => item.str)
        .join(" ");

      text += "<br/><br/>";
    }

    console.log(`Text is `, text);

    if (editorRef.current) {
      editorRef.current.setContent(`${text}`);
    }
  };

  return (
    <>
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        licenseKey="gpl"
        onInit={(_evt, editor) => (editorRef.current = editor)}
        initialValue="<p>This is the initial content of the editor.</p>"
        init={{
          skin: 'oxide',
          content_style: `
          body {
              font-family: Helvetica, Arial, sans-serif;
              font-size: 18px;
              margin: 5px;
          }
          `,
          height: '100vh',
          // menubar: true,
          menubar: 'file insert edit format table help',

          // adding custom tabs in menubar
          menu: {
            export: {
              title: 'File',
              items: 'importword exportpdf exportword exporttxt'
            }
          },

          setup: (editor: any) => {

            editor.ui.registry.addMenuItem('importword', {
              text: 'Import from Word',
              onAction: () => inputFileRef.current?.click()
            });

            editor.ui.registry.addMenuItem('exportpdf', {
              text: 'Export to PDF',
              onAction: downloadPDF
            });

            editor.ui.registry.addMenuItem('exportword', {
              text: 'Export to Word',
              onAction: downloadWord
            });

            editor.ui.registry.addMenuItem('exporttxt', {
              text: 'Export to TXT',
              onAction: downloadTxt
            });

          },

          // logo disable in text editor
          branding: false,
          promotion: false,
          plugins: [
            'advlist',
            'autolink',
            'lists',
            'link',
            'image',
            'charmap',
            'anchor',
            'searchreplace',
            'visualblocks',
            'code',
            'fullscreen',
            'insertdatetime',
            'media',
            'table',
            'preview',
            'help',
            'wordcount',
          ],
          toolbar:
            'undo redo | blocks | bold italic forecolor | ' +
            'alignleft aligncenter alignright | bullist numlist | ' +
            'removeformat | help'
        }}
      />

      {/* <button onClick={() => inputFileRef.current?.click()}>click</button> */}

      <input
        type="file"
        style={{ display: 'none' }}
        ref={inputFileRef}
        onChange={(e: any) => handleImport(e)}
      />

      {/* Preview box */}
      {/* <h3>Preview:</h3>
      <div
        style={{
          border: '1px solid #ccc',
          padding: 10,
          marginTop: 10,
          minHeight: 100,
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      /> */}
    </>
  );
}