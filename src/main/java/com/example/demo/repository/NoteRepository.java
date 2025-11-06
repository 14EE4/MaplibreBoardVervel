package com.example.demo.repository;

import java.util.List;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.stereotype.Repository;

import com.example.demo.dto.NoteDTO;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class NoteRepository {
    private final SqlSessionTemplate sql;

    public List<NoteDTO> getAll() {
        return sql.selectList("Note.getAll");
    }

    public void save(NoteDTO note) {
        sql.insert("Note.save", note);
    }

    public void update(NoteDTO note) {
        sql.update("Note.update", note);
    }

    public void deleteById(int id) {
        sql.delete("Note.deleteById", id);
    }
}