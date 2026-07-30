import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";

import { saveAs } from 'file-saver';

// DOCX
import { Document, Packer, Paragraph } from 'docx';

// PDF
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// import functions
export const handleImport = async (
    e: React.ChangeEvent<HTMLInputElement>
) => {
    const file = e.target.files?.[0];
    let data = "";

    if (!file) return;

    if (
        file.name.endsWith(".docx")
    ) {
        data = await importWord(file);
    }

    if (
        file.name.endsWith(".pdf")
    ) {
        data = await importPDF(file);
    }

    return data;
};

// Import PDF
const importPDF = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
    }).promise;

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);

        const content = await page.getTextContent();

        text += content.items
            .map((item: any) => item.str)
            .join(" ");

        text += "<br/><br/>";
    }

    // if (editorRef.current) {
    //     editorRef.current.setContent(`<p>${text}</p>`);
    // }

    return `<p>${text}</p>`;
};

const importWord = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();

    const result = await mammoth.convertToHtml({
        arrayBuffer,
    });

    // if (editorRef.current) {
    //     editorRef.current.setContent(result.value);
    // }

    return result.value
};

// export functions

// 👉 Convert HTML → plain text
const htmlToText = (html: any) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
};

// 📘 Download Word (.docx)
export const downloadWord = async (content: any) => {
    const html = content;

    const temp = document.createElement('div');
    temp.innerHTML = html;

    const children: any = [];

    Array.from(temp.childNodes).forEach((node) => {
        if (node.nodeType === 1) {
            const el: any = node;

            // HEADINGS
            if (/H[1-6]/.test(el.tagName)) {
                children.push(
                    new Paragraph({
                        text: el.innerText,
                        heading: 'Heading1',
                    })
                );
            }

            // PARAGRAPH
            else if (el.tagName === 'P') {
                children.push(
                    new Paragraph({
                        text: el.innerText,
                    })
                );
            }

            // LISTS
            else if (el.tagName === 'UL' || el.tagName === 'OL') {
                Array.from(el.children).forEach((li: any) => {
                    children.push(
                        new Paragraph({
                            text: '• ' + li.innerText,
                        })
                    );
                });
            }

            // IMAGES (LIMITATION)
            else if (el.tagName === 'IMG') {
                children.push(
                    new Paragraph({
                        text: '[Image: ' + (el.src || '') + ']',
                    })
                );
            }
        }
    });

    const doc = new Document({
        sections: [
            {
                children: children.length
                    ? children
                    : [new Paragraph(' ')],
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, 'document.docx');
};

// Download PDF
export const downloadPDF = async (content: any) => {
    const html = content;

    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
    });

    document.body.removeChild(container);

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');

    const width = 210;
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save('document.pdf');
};

//  📄 Download TXT
export const downloadTxt = (content: any) => {
    const html = content;
    const text = htmlToText(html);

    const blob = new Blob([text], {
        type: 'text/plain;charset=utf-8',
    });

    saveAs(blob, 'content.txt');
};
