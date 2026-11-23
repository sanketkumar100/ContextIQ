package com.application.rag.contextiq_backend.config;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "app")  //getting the app properties from application-dev.properties file.
public class AppProperties
{
    //here, make sure the name rag and cors should be same as in the application-dev.properties file.
    private RagProperties rag=new RagProperties();
    private CorsProperties cors=new CorsProperties();

    //cors properties from the application-dev.properties file.
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CorsProperties
    {
        private String allowedOrigins="*";
        private String allowedMethods="GET,POST,PUT,DELETE,OPTIONS";
        private String allowedHeaders="*";
    }

    //rag properties from the application-dev.properties file.
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RagProperties
    {
        private int chunkSize=700;
        private int minChunkSizeChars=350;
        private int minChunkLengthToEmbed=5;
        private int maxNumChunks=10000;

        //private int chunkOverlap=100;
        private int topK=5;
        private double similarityThreshold=0.60;
    }

}
