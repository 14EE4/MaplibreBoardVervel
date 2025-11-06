package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.NoteDTO;
import com.example.demo.service.NoteService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {
    private final NoteService noteService;

    @GetMapping
    public List<NoteDTO> getAll() {
        return noteService.getAll();
    }

    @PostMapping
    public NoteDTO save(@RequestBody NoteDTO note) {
        return noteService.save(note);
    }

    @PutMapping
    public NoteDTO update(@RequestBody NoteDTO note) {
        return noteService.update(note);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") int id) {
        noteService.delete(id);
    }
}