package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.ui.Model;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.service.BoardService;

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
	@GetMapping("/rasterMap2")
	public String rasterMap2() {
		System.out.println("rasterMap2 method call");
		return "rasterMap2"; // Thymeleaf will resolve to templates/rasterMap.html
	}

	@Autowired
	private BoardService boardService;

	@GetMapping("/boards")
	public String boards(@RequestParam(name = "grid_x", required = false) Integer gridX,
						 @RequestParam(name = "grid_y", required = false) Integer gridY,
						 @RequestParam(name = "id", required = false) Long id,
						 Model model) {
		System.out.println("boards method call");
		// If explicit id provided, render board view (client will use id param)
		if (id != null) {
			return "board";
		}

		// If grid coordinates provided, try to resolve to a board id and redirect
		if (gridX != null && gridY != null) {
			Long foundId = boardService.findBoardIdByGrid(gridX, gridY);
			if (foundId != null) {
				return "redirect:/boards?id=" + foundId;
			}
			// not found: render board view, client will show "not found" message
		}
		return "board"; // default render
	}

	// Fallback mapping: catch any path under /boards (e.g. /boards/something)
	@GetMapping("/boards/**")
	public String boardsFallback() {
		System.out.println("boards fallback called");
		return "board";
	}

	// Alternate simple mapping to avoid potential static-resource collision on '/boards'
	@GetMapping("/board")
	public String boardById(@RequestParam(name = "id", required = false) Long id, Model model) {
		System.out.println("/board called with id=" + id);
		// let the client-side read the id from query string; we simply render the view
		return "board";
	}

	// New explicit mapping that should not collide with static resources
	@GetMapping("/board-view")
	public String boardView(@RequestParam(name = "id", required = false) Long id, Model model) {
		System.out.println("/board-view called with id=" + id);
		return "board";
	}
	
}