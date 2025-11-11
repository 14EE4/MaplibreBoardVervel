package com.example.demo.controller;

import com.example.demo.dto.BoardDTO;
import com.example.demo.dto.PostDTO;
import com.example.demo.service.BoardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/boards")
public class BoardController {

    @Autowired
    private BoardService boardService;

    @GetMapping
    public ResponseEntity<List<Map<String,Object>>> listBoards() {
        return ResponseEntity.ok(boardService.listBoards());
    }

    @PostMapping
    public ResponseEntity<Map<String,Object>> createBoard(@RequestBody BoardDTO b) {
        Long id = boardService.createBoard(b);
        Map<String,Object> resp = new HashMap<>(); resp.put("id", id);
        return ResponseEntity.created(Objects.requireNonNull(URI.create("/api/boards/" + id))).body(resp);
    }

    @GetMapping("/{boardId}/posts")
    public ResponseEntity<List<Map<String,Object>>> listPosts(@PathVariable("boardId") Long boardId) {
        return ResponseEntity.ok(boardService.listPosts(boardId));
    }

    @PostMapping("/{boardId}/posts")
    public ResponseEntity<Map<String,Object>> createPost(@PathVariable("boardId") Long boardId, @RequestBody PostDTO p) {
        Long id = boardService.createPost(boardId, p);
        Map<String,Object> resp = new HashMap<>(); resp.put("id", id);
        return ResponseEntity.created(Objects.requireNonNull(URI.create("/api/boards/" + boardId + "/posts/" + id))).body(resp);
    }

    @GetMapping("/{boardId}/activity")
    public ResponseEntity<List<Map<String,Object>>> activity(@PathVariable("boardId") Long boardId, @RequestParam(name = "hours", required = false, defaultValue = "24") int hours) {
        return ResponseEntity.ok(boardService.activity(boardId, hours));
    }
}
