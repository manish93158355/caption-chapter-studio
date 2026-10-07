package com.captionchapterstudio.repository;

import com.captionchapterstudio.model.Caption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CaptionRepository extends JpaRepository<Caption, Long> {

    List<Caption> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Caption> findByUserIdAndFavoriteTrueOrderByCreatedAtDesc(Long userId);

    Optional<Caption> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    long countByUserIdAndFavoriteTrue(Long userId);

    @Query("SELECT c FROM Caption c WHERE c.user.id = :userId " +
           "AND (:platform IS NULL OR LOWER(c.platform) = LOWER(:platform)) " +
           "AND (:search IS NULL OR LOWER(c.topic) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.content) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:favorite IS NULL OR c.favorite = :favorite) " +
           "ORDER BY c.createdAt DESC")
    List<Caption> searchCaptions(
        @Param("userId") Long userId,
        @Param("platform") String platform,
        @Param("search") String search,
        @Param("favorite") Boolean favorite
    );
}
