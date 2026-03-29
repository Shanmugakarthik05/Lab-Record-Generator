import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, VerticalAlign, HeadingLevel, TextRun, ImageRun } from 'docx';
import FileSaver from 'file-saver';
import QRCode from 'qrcode';
import { CourseInfo, TheoryExperiment, ProgrammingSession } from '../App';
import collegeHeader from 'figma:asset/b4febb2531b296d5e7d0e8087088780a9a2db377.png';
import { formatDate } from './dateFormatter';
import { ensureHttpsPrefix } from './urlFormatter';

export async function generateWordDocument(
  courseInfo: CourseInfo,
  theoryExperiments: TheoryExperiment[],
  programmingSessions: ProgrammingSession[]
) {
  const isTheory = courseInfo.record_type === 'Theory Record';
  const fontFamily = courseInfo.font_family || 'Times New Roman';
  
  // Generate QR codes
  const qrCodes = await generateQRCodes(isTheory ? theoryExperiments : programmingSessions, isTheory);

  // Load college header image
  const headerImageBuffer = await loadImageAsBuffer(collegeHeader);

  const children: any[] = [];

  // Add college header image
  if (headerImageBuffer) {
    children.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: headerImageBuffer,
            transformation: {
              width: 500,
              height: 80,
            },
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      })
    );
  }

  // Course code and title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${courseInfo.course_code} - ${courseInfo.course_title}`,
          font: fontFamily,
          size: 28,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  );

  // Table of Contents heading
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'TABLE OF CONTENTS',
          font: fontFamily,
          size: 24,
          bold: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  );

  // Create table based on record type
  if (isTheory) {
    children.push(createTheoryTable(theoryExperiments, qrCodes));
  } else {
    children.push(createProgrammingTable(programmingSessions, qrCodes));
  }

  // Declaration section
  children.push(
    new Paragraph({
      text: '',
      spacing: { before: 600 },
    }),
    new Paragraph({
      text: 'I confirm that the experiments and GitHub links provided are entirely my own work.',
      spacing: { after: 300 },
    }),
    new Paragraph({
      text: `Name: ${courseInfo.student_name}`,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: 'Date:',
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: `Register Number: ${courseInfo.register_number}`,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: 'Learner Signature:',
      spacing: { after: 100 },
    })
  );

  const doc = new Document({
    sections: [{
      properties: {},
      children: children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = isTheory 
    ? `Theory_Record_${courseInfo.course_code}_${courseInfo.register_number}.docx`
    : `Programming_Record_${courseInfo.course_code}_${courseInfo.register_number}.docx`;
  
  FileSaver.saveAs(blob, fileName);
}

async function generateQRCodes(items: TheoryExperiment[] | ProgrammingSession[], isTheory: boolean): Promise<string[]> {
  const codes: string[] = [];
  
  for (const item of items) {
    const url = 'github_url' in item ? item.github_url : '';
    try {
      const qrDataUrl = await QRCode.toDataURL(ensureHttpsPrefix(url), { width: 200, margin: 1 });
      codes.push(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      codes.push('');
    }
  }
  
  return codes;
}

async function loadImageAsBuffer(imagePath: string): Promise<Uint8Array | null> {
  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    return new Uint8Array(buffer);
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
}

function createTheoryTable(experiments: TheoryExperiment[], qrCodes: string[]): Table {
  const rows: TableRow[] = [];

  // Header row
  rows.push(
    new TableRow({
      tableHeader: true,
      children: [
        createHeaderCell('Exp. No'),
        createHeaderCell('Date'),
        createHeaderCell('Experiment Title'),
        createHeaderCell('QR Code'),
        createHeaderCell('Marks'),
        createHeaderCell('Signature'),
      ],
    })
  );

  // Data rows - let Word handle page breaks naturally
  experiments.forEach((exp, index) => {
    rows.push(
      new TableRow({
        children: [
          createDataCell(exp.exp_no.toString(), AlignmentType.CENTER),
          new TableCell({
            children: [
              new Paragraph({
                text: formatDate(exp.date),
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 20, type: WidthType.PERCENTAGE }, // Set explicit width for date column
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: exp.experiment_title,
                spacing: { after: 100 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: ensureHttpsPrefix(exp.github_url),
                    size: 16,
                    color: '0969da',
                    underline: {
                      type: 'single',
                      color: '0969da',
                    },
                  }),
                ],
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
          }),
          createQRCell(qrCodes[index]),
          createDataCell(exp.marks, AlignmentType.CENTER),
          createDataCell('', AlignmentType.CENTER),
        ],
        cantSplit: true, // Prevent row from breaking across pages
      })
    );
  });

  return new Table({
    rows: rows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
  });
}

function createProgrammingTable(sessions: ProgrammingSession[], qrCodes: string[]): Table {
  const rows: TableRow[] = [];

  // Header row
  rows.push(
    new TableRow({
      tableHeader: true,
      children: [
        createHeaderCell('S.No'),
        createHeaderCell('Date'),
        createHeaderCell('List of Experiments'),
        createHeaderCell('QR Code'),
        createHeaderCell('Marks'),
        createHeaderCell('Sign'),
      ],
    })
  );

  // Data rows - let Word handle page breaks naturally
  sessions.forEach((session, index) => {
    const experimentsParagraphs: Paragraph[] = [];
    
    session.sub_experiments.forEach((sub, subIndex) => {
      experimentsParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${sub.label}. ${sub.title}`,
            }),
          ],
          spacing: { after: 200 }, // Increased spacing for visible line break
        })
      );
      
      // Add a blank line between sub-experiments (but not after the last one)
      if (subIndex < session.sub_experiments.length - 1) {
        experimentsParagraphs.push(
          new Paragraph({
            text: '',
            spacing: { after: 50 },
          })
        );
      }
    });

    experimentsParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `URL: ${ensureHttpsPrefix(session.github_url)}`,
            size: 16,
            color: '0969da',
            underline: {
              type: 'single',
              color: '0969da',
            },
          }),
        ],
        spacing: { before: 200 }, // Increased spacing before URL
      })
    );

    // Create date cell content
    const dateCellParagraphs: Paragraph[] = session.sub_experiments
      .filter(sub => sub.date)
      .map(sub => new Paragraph({
        text: formatDate(sub.date),
        spacing: { after: 50 },
      }));

    rows.push(
      new TableRow({
        children: [
          createDataCell(session.session_no.toString(), AlignmentType.CENTER),
          new TableCell({
            children: dateCellParagraphs.length > 0 ? dateCellParagraphs : [new Paragraph('')],
            verticalAlign: VerticalAlign.CENTER,
            width: { size: 20, type: WidthType.PERCENTAGE }, // Set explicit width for date column
          }),
          new TableCell({
            children: experimentsParagraphs,
            verticalAlign: VerticalAlign.CENTER,
          }),
          createQRCell(qrCodes[index]),
          createDataCell(session.marks, AlignmentType.CENTER),
          createDataCell('', AlignmentType.CENTER),
        ],
        cantSplit: true, // Prevent row from breaking across pages
      })
    );
  });

  return new Table({
    rows: rows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
  });
}

function createHeaderCell(text: string): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        text: text,
        alignment: AlignmentType.CENTER,
      }),
    ],
    shading: {
      fill: 'E5E7EB',
    },
    verticalAlign: VerticalAlign.CENTER,
  });
}

function createDataCell(text: string, alignment: AlignmentType = AlignmentType.LEFT): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        text: text,
        alignment: alignment,
      }),
    ],
    verticalAlign: VerticalAlign.CENTER,
  });
}

function createQRCell(qrDataUrl: string): TableCell {
  const children: any[] = [];

  if (qrDataUrl) {
    // Extract base64 data from data URL
    const base64Data = qrDataUrl.split(',')[1];
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    children.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: buffer,
            transformation: {
              width: 100,
              height: 100,
            },
          }),
        ],
        alignment: AlignmentType.CENTER,
      })
    );
  }

  return new TableCell({
    children: children,
    verticalAlign: VerticalAlign.CENTER,
  });
}