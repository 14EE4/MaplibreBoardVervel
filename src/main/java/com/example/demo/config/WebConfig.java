package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(@NonNull ViewControllerRegistry registry) {
        // explicit view controllers to avoid static resource conflicts
        registry.addViewController("/board-view").setViewName("board");
        registry.addViewController("/board").setViewName("board");
        registry.addViewController("/boards").setViewName("board");
    }
}
