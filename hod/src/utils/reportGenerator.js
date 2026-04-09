import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';
import api from '../api'; // Assuming api is at src/api.js

export const downloadStudentReport = async (studentId, setIsDownloading = () => {}) => {
  setIsDownloading(true);
  try {
    const response = await api.get(`/assessments/report/${studentId}`);
    const { studentProfile, mentorName, kpiTotals, finalScores } = response.data;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(
      'Vel Tech Multi Tech Dr.Rangarajan Dr.Sakunthala Engineering College',
      doc.internal.pageSize.getWidth() / 2,
      15,
      { align: 'center' }
    );
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      '(Approved by AICTE, New Delhi & Affiliated to Anna University, Chennai)',
      doc.internal.pageSize.getWidth() / 2,
      20,
      { align: 'center' }
    );
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(
      'STUDENT MENTORING ASSESSMENT SHEET',
      doc.internal.pageSize.getWidth() / 2,
      30,
      { align: 'center' }
    );

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Department: ${studentProfile.department}`, 14, 40);
    doc.text(`Mentor Name: ${mentorName}`, 14, 45);
    doc.text(`Mentee Name: ${studentProfile.name}`, 14, 50);
    doc.text(`Mentee VM No: ${studentProfile.vmNumber}`, 14, 55);
    doc.text(`Batch: ${studentProfile.batch}`, 100, 55);

    const tableBody = [
      ['1', 'CGPA', studentProfile.latestCgpa || kpiTotals.latestCgpa || '-', '', '', finalScores?.cgpaScore || 0],
      ['2', '% Attendance', `${(finalScores?.attendanceScore || 0).toFixed(2)}%`, '', '', finalScores?.attendanceScore || 0],
      ['3', 'Workshop', kpiTotals?.workshop?.participated || 0, '', '', ''],
      ['4', 'Seminar', kpiTotals?.seminar?.participated || 0, '', '', ''],
      [
        '5',
        'Conference',
        `${kpiTotals?.conference?.participated || 0} (P) / ${kpiTotals?.conference?.presented || 0} (Pr) / ${kpiTotals?.conference?.prizesWon || 0} (W)`,
        '', '', ''
      ],
      [
        '6',
        'Symposium',
        `${kpiTotals?.symposium?.participated || 0} (P) / ${kpiTotals?.symposium?.presented || 0} (Pr) / ${kpiTotals?.symposium?.prizesWon || 0} (W)`,
        '', '', ''
      ],
      [
        '7',
        'Professional Body activities',
        `${kpiTotals?.profBodyActivities?.participated || 0} (P) / ${kpiTotals?.profBodyActivities?.presented || 0} (Pr) / ${kpiTotals?.profBodyActivities?.prizesWon || 0} (W)`,
        '', '', ''
      ],
      ['', '', '', '', 'Score', finalScores?.coCurricularScore || 0],
      ['8', 'Talks/Lectures', kpiTotals?.talksLectures?.participated || 0, '', '', ''],
      [
        '9',
        'Project Expo',
        `${kpiTotals?.projectExpo?.presented || 0} (Pr) / ${kpiTotals?.projectExpo?.prizesWon || 0} (W)`,
        '', '', ''
      ],
      [
        '10',
        'NPTEL/SWAYAM',
        `${kpiTotals?.nptelSwayam?.completed || 0} (C) / ${kpiTotals?.nptelSwayam?.miniprojects || 0} (MP)`,
        '', '', ''
      ],
      [
        '11',
        'Certification Courses',
        `${kpiTotals?.otherCertifications?.completed || 0} (C) / ${kpiTotals?.otherCertifications?.miniprojects || 0} (MP)`,
        '', '', ''
      ],
      ['', '', '', '', 'Score', finalScores?.certificationScore || 0],
      [
        '12',
        'Culturals',
        `${kpiTotals?.culturals?.participated || 0} (P) / ${kpiTotals?.culturals?.prizesWon || 0} (W)`,
        '', '', ''
      ],
      [
        '13',
        'Sports',
        `${kpiTotals?.sports?.participated || 0} (P) / ${kpiTotals?.sports?.prizesWon || 0} (W)`,
        '', '', ''
      ],
      ['14', 'NCC', `${kpiTotals?.ncc?.participated || 0} (P) / ${kpiTotals?.ncc?.prizesWon || 0} (W)`, '', '', ''],
      ['15', 'NSS', `${kpiTotals?.nss?.participated || 0} (P) / ${kpiTotals?.nss?.prizesWon || 0} (W)`, '', '', ''],
      ['', '', '', '', 'Score', finalScores?.extraCurricularScore || 0]
    ];

    autoTable(doc, {
      startY: 60,
      head: [['Sl. No', 'KPI', 'Earned / No. of events attended', 'Remarks', 'Average Score', 'Score']],
      body: tableBody,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 1.5, halign: 'center' },
      headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' },
      columnStyles: {
        1: { halign: 'left' },
        2: { halign: 'left' }
      },
      didParseCell: data => {
        if (data.cell.raw === 'Score') {
          data.cell.colSpan = 2;
          data.cell.halign = 'right';
          data.cell.fontStyle = 'bold';
        }
      }
    });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const finalY = doc.lastAutoTable.finalY || 200;
    doc.text('Overall Score (out of 50)', 140, finalY + 10);
    doc.text((finalScores?.totalScore || 0).toString(), 190, finalY + 10, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text('Mentor', 30, finalY + 30);
    doc.text('Head of the Department', 160, finalY + 30);

    doc.save(`Mentoring_Report_${studentProfile.name}.pdf`);
    toast.success('Report downloaded');
  } catch (err) {
    const msg = err?.response?.data?.message || 'Failed to download report.';
    toast.error(msg);
  } finally {
    setIsDownloading(false);
  }
};
