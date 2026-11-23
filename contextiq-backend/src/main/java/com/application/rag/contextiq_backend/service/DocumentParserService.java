package com.application.rag.contextiq_backend.service;


import com.application.rag.contextiq_backend.exception.DocumentProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.reader.pdf.config.PdfDocumentReaderConfig;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@Slf4j
public class DocumentParserService
{


    public List<Document> parse(MultipartFile file)
    {
        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        String contentType = file.getContentType() !=null ? file.getContentType().toLowerCase() : "application/octet-stream";

        log.info("parsing document: {}, size: {} bytes, content type: {}", fileName, file.getSize(), contentType);

        try
        {

            //converting the MultipartFile to a Resource for parsing
            Resource resource = new ByteArrayResource(file.getBytes())
            {
                @Override
                public String getFilename()
                {
                    return fileName;
                }
            };


            //we will create 2 methods one is to parse the pdf file and the other is to parse any other type of file.
            if (fileName.toLowerCase().endsWith(".pdf") || contentType.contains("pdf"))
            {
                return parsePdf(resource);
            }
            else
            {
                return parseGenericFile(resource);
            }

        }
        catch (IOException e)
        {
            log.error("Failed to read file bytes {}", fileName, e);
            throw new DocumentProcessingException("Could not read the uploaded file:" +fileName, e);
        }
        catch (Exception e)
        {
            log.error("Error during document parsing {}", fileName, e);
            throw new DocumentProcessingException("Failed to parse document content:" +fileName, e);
        }

        //return null;

    }

    private List<Document> parsePdf(Resource resource)
    {
        PdfDocumentReaderConfig config = PdfDocumentReaderConfig.builder()
                .withPageBottomMargin(0)
                .withPageTopMargin(0)
                .build();

        PagePdfDocumentReader documentReader = new PagePdfDocumentReader(resource, config);//passing the reosurce and the configuration to the document reader.

        return documentReader.read();//pdf document reader implments the document reader class.
    }

    private List<Document> parseGenericFile(Resource resource)//for reading the document except PDF type.
    {
        TikaDocumentReader tikaDocumentReader = new TikaDocumentReader(resource);
        return tikaDocumentReader.read();
    }

}
