import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { CourseInfo, TheoryExperiment, ProgrammingSession } from '../App';
import collegeHeader from 'figma:asset/b4febb2531b296d5e7d0e8087088780a9a2db377.png';
import { formatDate } from './dateFormatter';

export async function generatePDFDocument(
  courseInfo: CourseInfo,
  theoryExperiments: TheoryExperiment[],
  programmingSessions: ProgrammingSession[]
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const isTheory = courseInfo.record_type === 'Theory Record';
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Add college header image
  try {
    const imgWidth = 150; // width in mm
    const imgHeight = 24; // height in mm
    const xPos = (pageWidth - imgWidth) / 2; // center the image
    doc.addImage(collegeHeader, 'PNG', xPos, yPos, imgWidth, imgHeight);
    yPos += imgHeight + 10;
  } catch (error) {
    console.error('Error adding header image:', error);
  }

  // Course code and title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${courseInfo.course_code} - ${courseInfo.course_title}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Table of Contents heading
  doc.setFontSize(12);
  doc.text('TABLE OF CONTENTS', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  // Generate QR codes
  const qrCodes = await generateQRCodes(isTheory ? theoryExperiments : programmingSessions, isTheory);

  if (isTheory) {
    await createTheoryTable(doc, theoryExperiments, qrCodes, yPos);
  } else {
    await createProgrammingTable(doc, programmingSessions, qrCodes, yPos);
  }

  // Declaration section
  doc.addPage();
  yPos = 20;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DECLARATION', 20, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('I confirm that the experiments and GitHub links provided are entirely my own work.', 20, yPos);
  yPos += 10;

  doc.text(`Name: ${courseInfo.student_name}`, 20, yPos);
  yPos += 7;
  doc.text(`Register Number: ${courseInfo.register_number}`, 20, yPos);
  yPos += 7;
  doc.text('Learner Signature: ______________________________', 20, yPos);

  const fileName = isTheory 
    ? `Theory_Record_${courseInfo.course_code}_${courseInfo.register_number}.pdf`
    : `Programming_Record_${courseInfo.course_code}_${courseInfo.register_number}.pdf`;

  doc.save(fileName);
}

async function generateQRCodes(items: TheoryExperiment[] | ProgrammingSession[], isTheory: boolean): Promise<string[]> {
  const codes: string[] = [];
  
  for (const item of items) {
    const url = 'github_url' in item ? item.github_url : '';
    try {
      const qrDataUrl = await QRCode.toDataURL(url, { width: 300, margin: 1 });
      codes.push(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      codes.push('');
    }
  }
  
  return codes;
}

async function createTheoryTable(doc: jsPDF, experiments: TheoryExperiment[], qrCodes: string[], startY: number) {
  const tableData = experiments.map((exp, index) => [
    exp.exp_no.toString(),
    formatDate(exp.date),
    `${exp.experiment_title}\n${exp.github_url}`,
    '', // Empty string for QR code cell - image will be drawn in didDrawCell
    exp.marks,
    '',
  ]);

  autoTable(doc, {
    startY: startY,
    head: [['Exp. No', 'Date', 'Experiment Title', 'QR Code', 'Marks', 'Signature']],
    body: tableData,
    theme: 'grid',
    margin: { left: 15, right: 15 },
    tableWidth: 'auto',
    headStyles: {
      fillColor: [229, 231, 235],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { halign: 'center', cellWidth: 18 },
      2: { cellWidth: 'auto' },
      3: { halign: 'center', cellWidth: 25 },
      4: { halign: 'center', cellWidth: 12 },
      5: { halign: 'center', cellWidth: 20 },
    },
    didDrawCell: (data) => {
      if (data.column.index === 3 && data.section === 'body') {
        const qrCode = qrCodes[data.row.index];
        if (qrCode) {
          const padding = 2;
          const size = Math.min(data.cell.width, data.cell.height) - padding * 2;
          doc.addImage(
            qrCode,
            'PNG',
            data.cell.x + (data.cell.width - size) / 2,
            data.cell.y + (data.cell.height - size) / 2,
            size,
            size
          );
        }
      }
    },
  });
}

async function createProgrammingTable(doc: jsPDF, sessions: ProgrammingSession[], qrCodes: string[], startY: number) {
  const tableData = sessions.map((session, index) => {
    const experiments = session.sub_experiments
      .map(sub => `${sub.label}. ${sub.title}${sub.date ? ` (${formatDate(sub.date)})` : ''}`)
      .join('\n');
    
    const dates = session.sub_experiments
      .filter(sub => sub.date)
      .map(sub => formatDate(sub.date))
      .join('\n');
    
    return [
      session.session_no.toString(),
      dates,
      `${experiments}\n\nURL: ${session.github_url}`,
      '', // Empty string for QR code cell - image will be drawn in didDrawCell
      session.marks,
      '',
    ];
  });

  autoTable(doc, {
    startY: startY,
    head: [['S.No', 'Date', 'List of Experiments', 'QR Code', 'Marks', 'Sign']],
    body: tableData,
    theme: 'grid',
    margin: { left: 15, right: 15 },
    tableWidth: 'auto',
    headStyles: {
      fillColor: [229, 231, 235],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'center', cellWidth: 18 },
      2: { cellWidth: 'auto' },
      3: { halign: 'center', cellWidth: 22 },
      4: { halign: 'center', cellWidth: 12 },
      5: { halign: 'center', cellWidth: 15 },
    },
    didDrawCell: (data) => {
      if (data.column.index === 3 && data.section === 'body') {
        const qrCode = qrCodes[data.row.index];
        if (qrCode) {
          const padding = 2;
          const size = Math.min(data.cell.width, data.cell.height) - padding * 2;
          doc.addImage(
            qrCode,
            'PNG',
            data.cell.x + (data.cell.width - size) / 2,
            data.cell.y + (data.cell.height - size) / 2,
            size,
            size
          );
        }
      }
    },
  });
}