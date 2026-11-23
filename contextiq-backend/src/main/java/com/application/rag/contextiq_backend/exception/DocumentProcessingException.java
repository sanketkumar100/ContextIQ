package com.application.rag.contextiq_backend.exception;

public class DocumentProcessingException extends RuntimeException
{
    public DocumentProcessingException(String message)
    {
        super(message);
    }

    public DocumentProcessingException()
    {

        super("Error in proceessing the documents !!");
    }

    public DocumentProcessingException(String message, Throwable ex)
    {

        super(message, ex);
    }
}
