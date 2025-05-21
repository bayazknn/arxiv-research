import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseMessageLike } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { MessagesAnnotation } from "@langchain/langgraph";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { initChatModel } from "langchain/chat_models/universal";
import { tool } from "@langchain/core/tools";
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { z } from "zod";
import { extractText, getDocumentProxy } from "unpdf";

const pdfCache: Record<string, string> = {};
export function getCachedPDFText(key: string): string | undefined {
  return pdfCache[key];
}
export function cachePDFText(key: string, text: string): void {
  pdfCache[key] = text;
}

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
  maxRetries: 2,
  // other params...
});

const extractPdf = async(pdfUrl: string) => {
  const buffer = await fetch(pdfUrl).then((res) => res.arrayBuffer());
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { totalPages, text } = await extractText(pdf, { mergePages: true });
  return text
}

const getPdfTextContext = (pdfUrl:string) => {
  if (pdfUrl in pdfCache){
    return pdfCache[pdfUrl]
  } else {
    const pdfText = extractPdf(pdfUrl).then((text) => {
      pdfCache[pdfUrl] = text
      return text
    }).catch((e) => console.log(e))
  }
}

const getPdfText = tool(
  async(input:{pdfUrl: string}) => {
  if (input.pdfUrl in pdfCache){
    const cachedText = getCachedPDFText(input.pdfUrl)
    return `the pdf context text is here:\n\n\n\n ${cachedText}`
  } else {
    const buffer = await fetch(input.pdfUrl).then((res) => res.arrayBuffer());
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { totalPages, text } = await extractText(pdf, { mergePages: true });
    cachePDFText(input.pdfUrl, text)
    return `the pdf context text is:\n\n\n\n ${text}`
  }

  },
  {
      name:"getPdfText",
      schema: z.object({
          pdfUrl: z.string().describe("url of the arxiv paper")
      }),
      description: "Get the parsed text from the paper pdf"
  }
);

const prompt = (
    state: typeof MessagesAnnotation.State, config: RunnableConfig
  ): BaseMessageLike[] => {
    const pdfUrl = config.configurable?.pdfUrl;
    // const pdfText = getPdfTextContext(pdfUrl)
    const systemMsg = `"You are a scientific advisor to analyze arxiv papers. You response about the article.
    You extract text from the article using getPdfText tool. The pdf url is ${pdfUrl}. The getPdfText tool returns the extracted text from the PDF. Use this extracted text to answer the user's questions."`;
    
    return [{ role: "system", content: systemMsg },...state.messages];
  };
   
export const simpleAgent = createReactAgent({
    llm,
    tools: [getPdfText],  
    prompt 
  })
