package com.application.rag.contextiq_backend.exception;

public class ResourceNotFoundException extends RuntimeException
{
    public ResourceNotFoundException()
    {
        super("Resource you are looking for not found !!");
    }

    public ResourceNotFoundException(String message)
    {
        super(message);
    }

    public ResourceNotFoundException(String message, Throwable ex)
    {
        super(message, ex);
    }

}
