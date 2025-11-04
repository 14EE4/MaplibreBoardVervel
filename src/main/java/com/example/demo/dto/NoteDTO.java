package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class NoteDTO {
    private Integer id;
    private Double lng;
    private Double lat;
    private String content;
    private String createdAt; // mapped from DB TIMESTAMP
}
