package com.example.demo.repository;

import com.example.demo.dto.BoardDTO;
import com.example.demo.dto.PostDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;

import java.util.List;
import java.util.Map;

@Repository
public class BoardRepository {

    @Autowired
    private JdbcTemplate jdbc;

    public List<Map<String,Object>> findAllBoards() {
        return jdbc.queryForList("SELECT id, name, grid_x, grid_y, center_lng, center_lat, meta, created_at, updated_at FROM boards");
    }

    public Long findBoardIdByGrid(int gridX, int gridY) {
        String sql = "SELECT id FROM boards WHERE grid_x = ? AND grid_y = ? LIMIT 1";
        try {
            Long id = jdbc.queryForObject(sql, Long.class, gridX, gridY);
            return id;
        } catch (org.springframework.dao.EmptyResultDataAccessException ex) {
            return null;
        }
    }

    public Long createBoard(BoardDTO b) {
        String sql = "INSERT INTO boards (name, grid_x, grid_y, center_lng, center_lat, meta) VALUES (?, ?, ?, ?, ?, ?)";
        KeyHolder kh = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, b.getName());
            if (b.getGrid_x() == null) ps.setObject(2, null); else ps.setInt(2, b.getGrid_x());
            if (b.getGrid_y() == null) ps.setObject(3, null); else ps.setInt(3, b.getGrid_y());
            ps.setObject(4, b.getCenter_lng());
            ps.setObject(5, b.getCenter_lat());
            ps.setObject(6, b.getMeta());
            return ps;
        }, kh);
        Number key = kh.getKey();
        return key == null ? null : key.longValue();
    }

    public List<Map<String,Object>> findPostsByBoardId(Long boardId){
        return jdbc.queryForList("SELECT id, board_id, author, content, created_at, updated_at FROM posts WHERE board_id = ? ORDER BY created_at DESC", boardId);
    }

    public Long createPost(Long boardId, PostDTO p) {
        String sql = "INSERT INTO posts (board_id, author, content) VALUES (?, ?, ?)";
        KeyHolder kh = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, boardId);
            ps.setString(2, p.getAuthor());
            ps.setString(3, p.getContent());
            return ps;
        }, kh);
        Number k = kh.getKey();
        return k == null ? null : k.longValue();
    }

    public List<Map<String,Object>> getActivity(Long boardId, int hours) {
        String sql = "SELECT DATE_FORMAT(created_at, '%Y-%m-%d %H:00:00') AS hour_bucket, COUNT(*) AS cnt " +
                "FROM posts WHERE board_id = ? AND created_at >= NOW() - INTERVAL ? HOUR GROUP BY hour_bucket ORDER BY hour_bucket";
        return jdbc.queryForList(sql, boardId, hours);
    }

    /**
     * Ensure the posts table for a specific grid exists.
     * Table name pattern: posts_grid_{gridX}_{gridY}
     */
    public void ensurePostsTableForGrid(int gridX, int gridY) {
        String tableName = "posts_grid_" + gridX + "_" + gridY;
        // Basic validation: gridX/gridY are integers so building identifier is safe
        String sql = "CREATE TABLE IF NOT EXISTS `" + tableName + "` ("
                + "id BIGINT PRIMARY KEY AUTO_INCREMENT,"
                + "board_id BIGINT,"
                + "author VARCHAR(255),"
                + "content TEXT,"
                + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,"
                + "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
                + ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
        jdbc.execute(sql);
    }

}
