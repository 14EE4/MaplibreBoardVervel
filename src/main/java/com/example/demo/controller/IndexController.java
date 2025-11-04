package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import com.example.demo.Test2Application;
import lombok.extern.slf4j.Slf4j;

@Controller
@Slf4j


public class IndexController {
	
	@GetMapping("/")	
	public String index() {
		//log.info("index method call");
		//System.out.println();
		System.out.println("index method call");
		return "index";
	}
	
	@GetMapping("/map")
	public String map() {
		System.out.println("map method call");
		return "map"; // Thymeleaf will resolve to templates/map.html
	}
	
	@GetMapping("/mapGlobe")
	public String mapGlobe() {
		System.out.println("mapGlobe method call");
		return "mapGlobe"; // Thymeleaf will resolve to templates/mapGlobe.html
	}
	
	@GetMapping("/satelliteMap")
	public String satelliteMap() {
		System.out.println("satelliteMap method call");
		return "satelliteMap"; // Thymeleaf will resolve to templates/satelliteMap.html
	}
	
	@GetMapping("/map3D")
	public String map3D() {
		System.out.println("map3D method call");
		return "map3D"; // Thymeleaf will resolve to templates/map3D.html
	}
	
	@GetMapping("/rasterMap")
	public String rasterMap() {
		System.out.println("rasterMap method call");
		return "rasterMap"; // Thymeleaf will resolve to templates/rasterMap.html
	}
	
}