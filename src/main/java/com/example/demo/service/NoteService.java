package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.dto.NoteDTO;
import com.example.demo.repository.NoteRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NoteService {
    private final NoteRepository noteRepository;

    public List<NoteDTO> getAll() {
        return noteRepository.getAll();
    }

    public NoteDTO save(NoteDTO note) {
        noteRepository.save(note);
        return note;
    }

    public NoteDTO update(NoteDTO note) {
        noteRepository.update(note);
        return note;
    }

    public void delete(int id) {
        noteRepository.deleteById(id);
    }
}