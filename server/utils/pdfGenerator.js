import PDFDocument from 'pdfkit';

export const generateAnalysisPDF = (analysis) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', reject);

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('Analysis Report', { align: 'center' });
      doc.fontSize(12).font('Helvetica').fillColor('#666666');
      doc.text(`Generated: ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, { align: 'center' });
      doc.moveDown();

      // Resume Name
      doc.fontSize(11).fillColor('#000000').font('Helvetica-Bold').text('Resume:', { continued: false });
      doc.font('Helvetica').text(analysis.resumeFileName, { continued: false });
      doc.moveDown(0.5);

      // Match Score Section
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e40af').text('Match Score');
      doc.rect(doc.x, doc.y, 100, 60).fill('#e8f1ff').stroke();
      doc.fontSize(48).fillColor('#1e40af').font('Helvetica-Bold').text(
        `${analysis.matchScore}%`,
        doc.x + 35,
        doc.y + 5,
        { width: 100, align: 'center' }
      );
      doc.moveDown(3.5);
      doc.moveDown();

      // Score Breakdown (if available)
      if (analysis.scoreBreakdown) {
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000').text('Score Breakdown:');
        doc.fontSize(10).font('Helvetica').fillColor('#333333');
        doc.list([
          `Technical Skills: ${analysis.scoreBreakdown.technical || 0}%`,
          `Soft Skills: ${analysis.scoreBreakdown.soft || 0}%`,
          `Experience Keywords: ${analysis.scoreBreakdown.experience || 0}%`,
          `Education Relevance: ${analysis.scoreBreakdown.education || 0}%`
        ]);
        doc.moveDown(0.5);
      }

      // Matched Skills
      if (analysis.matchedSkills && analysis.matchedSkills.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#16a34a').text('✓ Matched Skills');
        doc.fontSize(10).font('Helvetica').fillColor('#333333');
        const skillsPerRow = 3;
        const skills = analysis.matchedSkills;
        for (let i = 0; i < skills.length; i += skillsPerRow) {
          const row = skills.slice(i, i + skillsPerRow);
          doc.text(row.join('  •  '));
        }
        doc.moveDown();
      }

      // Missing Skills
      if (analysis.missingSkills && analysis.missingSkills.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#dc2626').text('✗ Skills to Develop');
        doc.fontSize(10).font('Helvetica').fillColor('#333333');
        const skillsPerRow = 3;
        const skills = analysis.missingSkills;
        for (let i = 0; i < skills.length; i += skillsPerRow) {
          const row = skills.slice(i, i + skillsPerRow);
          doc.text(row.join('  •  '));
        }
        doc.moveDown();
      }

      // Improvement Tips
      if (analysis.improvementTips && analysis.improvementTips.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e40af').text('Improvement Tips');
        doc.fontSize(10).font('Helvetica').fillColor('#333333');
        analysis.improvementTips.forEach((tip, index) => {
          doc.text(`${index + 1}. ${tip}`);
        });
        doc.moveDown();
      }

      // Keyword Suggestions
      if (analysis.keywordSuggestions && analysis.keywordSuggestions.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e40af').text('Keywords to Add');
        doc.fontSize(10).font('Helvetica').fillColor('#333333');
        const keywordsText = analysis.keywordSuggestions.slice(0, 15).join(', ');
        doc.text(keywordsText, { width: 500 });
        doc.moveDown();
      }

      // Footer
      doc.fontSize(8).fillColor('#999999').text(
        '© CareerMatch AI Platform | Confidential Report',
        { align: 'center' }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
