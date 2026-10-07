package com.captionchapterstudio.repository;

import com.captionchapterstudio.model.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Long> {

    List<Chapter> findByUserIdOrderByUpdatedAtDesc(Long userId);

    List<Chapter> findByUserIdAndFavoriteTrueOrderByUpdatedAtDesc(Long userId);

    Optional<Chapter> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    long countByUserIdAndFavoriteTrue(Long userId);

    @Query("SELECT c FROM Chapter c WHERE c.user.id = :userId " +
           "AND (:category IS NULL OR LOWER(c.category) = LOWER(:category)) " +
           "AND (:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.content) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:favorite IS NULL OR c.favorite = :favorite) " +
           "ORDER BY c.updatedAt DESC")
    List<Chapter> searchChapters(
        @Param("userId") Long userId,
        @Param("category") String category,
        @Param("search") String search,
        @Param("favorite") Boolean favorite
    );
}
