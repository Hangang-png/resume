// index.js（外部JS文件）
async function generatePDF() {
  const { PDFDocument, rgb, PageSizes } = PDFLib;
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const fontBytes = await fetch('SIMHEI.TTF').then(res => res.arrayBuffer());
  const customFont = await pdfDoc.embedFont(fontBytes);
  const page = pdfDoc.addPage(PageSizes.A4);
  const { width, height } = page.getSize();
  const margin = 30;

  page.drawRectangle({
    x: margin,
    y: margin,
    width: width - 2 * margin,
    height: height - 2 * margin,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  });

  let y = height - 40;

  const imageBytes = await fetch('female.jpeg').then(res => res.arrayBuffer());
  const image = await pdfDoc.embedJpg(imageBytes);
  const imageDims = image.scale(0.1);
  page.drawImage(image, {
    x: 70,
    y: y - imageDims.height,
    width: imageDims.width,
    height: imageDims.height,
  });

  const name = document.getElementById('hName').innerText || '姓名';
  const titleFontSize = 32;
  const textWidth = customFont.widthOfTextAtSize(name, titleFontSize);
  const centerX = (width - textWidth) / 2;
  page.drawText(name, { x: centerX, y: y - 75, size: titleFontSize, font: customFont, color: rgb(0, 0, 0.8) });
  y -= imageDims.height + 70;

  const skillItems = document.querySelectorAll('.section ul:nth-of-type(1) li');
  const skills = Array.from(skillItems).map(li => li.innerText);  

  const educationItems = document.querySelectorAll('.section1 ul:nth-of-type(1) li');
  const education = Array.from(educationItems).map(li => li.innerText);

  const selfIntro1 = document.querySelector('.section1 p').innerText;
  const selfIntro = document.querySelector('.section p').innerText;

  page.drawText('技能专长', { x: 50, y: y, size: 20, font: customFont, color: rgb(0, 0.5, 0) });
  y -= 30;
  skills.forEach(skill => {
    page.drawText('• ' + skill, { x: 60, y: y, size: 14, font: customFont, color: rgb(0, 0, 0) });
    y -= 40;
  });

  page.drawText('项目经验', { x: 50, y: y, size: 20, font: customFont, color: rgb(0.5, 0.2, 0) });
  y -= 30;
  y = drawMultilineText(selfIntro, 480, 14, 60, y);
  y -= 20;

  page.drawText('教育背景', { x: 50, y: y, size: 20, font: customFont, color: rgb(0.3, 0, 0.5) });
  y -= 30;
  education.forEach(line => {
    page.drawText('• ' + line, { x: 60, y: y, size: 14, font: customFont, color: rgb(0, 0, 0) });
    y -= 40;
  });

  page.drawText('自我评价', { x: 50, y: y, size: 20, font: customFont, color: rgb(0.5, 0.2, 0) });
  y -= 30;
  y = drawMultilineText(selfIntro1, 480, 14, 60, y);
  
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = '简历_Maria.pdf';
  link.click();

  function drawMultilineText(text, maxWidth, fontSize, xStart, yStart) {
    const words = text.split('');
    let line = '';
    let y = yStart;
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i];
      const testWidth = customFont.widthOfTextAtSize(testLine, fontSize);
      if (testWidth > maxWidth) {
        page.drawText(line, { x: xStart, y: y, size: fontSize, font: customFont, color: rgb(0, 0, 0) });
        y -= fontSize + 6;
        line = words[i];
      } else {
        line = testLine;
      }
    }
    if (line) {
      page.drawText(line, { x: xStart, y: y, size: fontSize, font: customFont, color: rgb(0, 0, 0) });
      y -= fontSize + 6;
    }
    return y;
  }
}
