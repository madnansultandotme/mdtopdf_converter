import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { generatePdfFromMarkdown } from "../pdfGenerator";
import { DEFAULT_HEADING_STYLES, DEFAULT_CODE_BLOCK_STYLES, DEFAULT_TABLE_STYLES } from "../../drizzle/schema";

export const converterRouter = router({
  generatePdf: protectedProcedure
    .input(
      z.object({
        markdown: z.string().min(1, "Markdown content is required"),
        fontFamily: z.string().default("Inter"),
        fontSize: z.number().default(12),
        lineHeight: z.number().default(1.5),
        pageSize: z.string().default("A4"),
        marginTop: z.number().default(20),
        marginBottom: z.number().default(20),
        marginLeft: z.number().default(20),
        marginRight: z.number().default(20),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const startTime = Date.now();

      try {
        // Build formatting rule from input
        const formattingRule = {
          fontFamily: input.fontFamily,
          fontSize: input.fontSize,
          lineHeight: input.lineHeight.toString(),
          headingStyles: DEFAULT_HEADING_STYLES,
          pageSize: input.pageSize,
          marginTop: input.marginTop,
          marginBottom: input.marginBottom,
          marginLeft: input.marginLeft,
          marginRight: input.marginRight,
          headerText: null,
          footerText: null,
          codeBlockStyles: DEFAULT_CODE_BLOCK_STYLES,
          tableStyles: DEFAULT_TABLE_STYLES,
          pageBreakBeforeHeadings: "h1",
          preventOrphanHeadings: 1,
          keepCodeBlocksTogether: 1,
        };

        // Generate actual PDF using Puppeteer
        const pdfBuffer = await generatePdfFromMarkdown(input.markdown, formattingRule as any);

        // Return PDF as base64 data URL
        const pdfDataUrl = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;

        const generationTime = Date.now() - startTime;
        console.log(`[Conversion] User ${ctx.user.id} converted ${Buffer.byteLength(input.markdown, "utf-8")} bytes in ${generationTime}ms`);

        return {
          success: true,
          pdfUrl: pdfDataUrl,
          generationTimeMs: generationTime,
        };
      } catch (error) {
        console.error("Error generating PDF:", error);
        throw error;
      }
    }),
});
