import { extractText, getDocumentProxy } from "unpdf";


export default async function extractPdf(url: string){
    try {
      // await downloadPdf();
    //   const pdf = require('pdf-parse');
    //   let dataBuffer = fs.readFileSync(localPath);    
    //   const text = await pdf(dataBuffer).then(function(data: any) {
   
    //           // number of pages
    // console.log(data.numpages);
    // // number of rendered pages
    // console.log(data.numrender);
    // // PDF info
    // console.log(data.info);
    // // PDF metadata
    // console.log(data.metadata); 
    // // PDF.js version
    // // check https://mozilla.github.io/pdf.js/getting_started/
    // console.log(data.version);
    // // PDF text
    // console.log(data.text); 

    // return data.text

    const buffer = await fetch(url).then((res) => res.arrayBuffer());
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { totalPages, text } = await extractText(pdf, { mergePages: true });

    console.log(`Total pages: ${totalPages}`);

    return text
}
  
  catch (error: any) {
    console.error("Error extracting PDF:", error);
    return "";
  }
}