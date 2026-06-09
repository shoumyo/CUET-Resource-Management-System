package com.cuet.booking.repository;

import com.cuet.booking.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findAllByOrderByNameAsc();

    List<Resource> findAllByTeacherInCharge_UserId(Long teacherInChargeId);
}
